/**
 * Document Quality Scoring Service
 *
 * Analyzes generated documentation and provides quality scores
 * with suggestions for improvement.
 */

import { supabaseAdmin } from './supabase';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export interface QualityScore {
	id: string;
	doc_id: string;
	repo_id: string;
	completeness_score: number;
	accuracy_score: number;
	clarity_score: number;
	overall_score: number;
	suggestions: QualitySuggestion[];
	scored_at: string;
}

export interface QualitySuggestion {
	category: 'completeness' | 'accuracy' | 'clarity' | 'format';
	severity: 'low' | 'medium' | 'high';
	message: string;
	section?: string;
}

interface ScoringResult {
	completeness: number;
	accuracy: number;
	clarity: number;
	overall: number;
	suggestions: QualitySuggestion[];
}

/**
 * Score a document's quality using Claude
 *
 * @param docId - The documentation ID
 * @param content - The document content
 * @param docType - The type of documentation
 * @returns Quality score and suggestions
 */
export async function scoreDocument(
	docId: string,
	content: string,
	docType: string
): Promise<QualityScore | null> {
	try {
		// Get the doc to find repo_id
		const { data: doc, error: docError } = await supabaseAdmin
			.from('documentation')
			.select('repo_id')
			.eq('id', docId)
			.single();

		if (docError || !doc) {
			console.error('[Quality] Doc not found:', docError);
			return null;
		}

		// Use Claude to analyze the document
		const scoringResult = await analyzeWithClaude(content, docType);

		// Save the score to database
		const { data, error } = await supabaseAdmin
			.from('doc_quality_scores')
			.insert({
				doc_id: docId,
				repo_id: doc.repo_id,
				completeness_score: scoringResult.completeness,
				accuracy_score: scoringResult.accuracy,
				clarity_score: scoringResult.clarity,
				overall_score: scoringResult.overall,
				suggestions: scoringResult.suggestions
			})
			.select()
			.single();

		if (error) {
			console.error('[Quality] Error saving score:', error);
			return null;
		}

		return data as QualityScore;
	} catch (err) {
		console.error('[Quality] Error scoring document:', err);
		return null;
	}
}

/**
 * Get the latest quality score for a document
 */
export async function getDocumentScore(docId: string): Promise<QualityScore | null> {
	const { data, error } = await supabaseAdmin
		.from('doc_quality_scores')
		.select('*')
		.eq('doc_id', docId)
		.order('scored_at', { ascending: false })
		.limit(1)
		.single();

	if (error) {
		if (error.code !== 'PGRST116') {
			console.error('[Quality] Error fetching score:', error);
		}
		return null;
	}

	return data as QualityScore;
}

/**
 * Get quality scores for all docs in a repository
 */
export async function getRepoQualityScores(
	repoId: string
): Promise<{ docId: string; docType: string; score: QualityScore }[]> {
	// Get all docs for the repo
	const { data: docs, error: docsError } = await supabaseAdmin
		.from('documentation')
		.select('id, type')
		.eq('repo_id', repoId);

	if (docsError || !docs) {
		console.error('[Quality] Error fetching docs:', docsError);
		return [];
	}

	// Get latest score for each doc
	const results: { docId: string; docType: string; score: QualityScore }[] = [];

	for (const doc of docs) {
		const score = await getDocumentScore(doc.id);
		if (score) {
			results.push({
				docId: doc.id,
				docType: doc.type,
				score
			});
		}
	}

	return results;
}

/**
 * Calculate aggregate quality score for a repository
 */
export async function getRepoAggregateScore(repoId: string): Promise<{
	overall: number;
	completeness: number;
	accuracy: number;
	clarity: number;
	docsScored: number;
} | null> {
	const scores = await getRepoQualityScores(repoId);

	if (scores.length === 0) {
		return null;
	}

	const totals = scores.reduce(
		(acc, { score }) => ({
			overall: acc.overall + score.overall_score,
			completeness: acc.completeness + score.completeness_score,
			accuracy: acc.accuracy + score.accuracy_score,
			clarity: acc.clarity + score.clarity_score
		}),
		{ overall: 0, completeness: 0, accuracy: 0, clarity: 0 }
	);

	const count = scores.length;

	return {
		overall: Math.round(totals.overall / count),
		completeness: Math.round(totals.completeness / count),
		accuracy: Math.round(totals.accuracy / count),
		clarity: Math.round(totals.clarity / count),
		docsScored: count
	};
}

/**
 * Analyze document quality using Claude
 */
async function analyzeWithClaude(content: string, docType: string): Promise<ScoringResult> {
	const prompt = buildQualityPrompt(content, docType);

	try {
		const response = await anthropic.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 1024,
			messages: [{ role: 'user', content: prompt }]
		});

		const text = response.content[0].type === 'text' ? response.content[0].text : '';
		return parseQualityResponse(text);
	} catch (err) {
		console.error('[Quality] Claude API error:', err);
		// Return default scores on API error
		return {
			completeness: 70,
			accuracy: 70,
			clarity: 70,
			overall: 70,
			suggestions: [
				{
					category: 'completeness',
					severity: 'low',
					message: 'Quality scoring temporarily unavailable'
				}
			]
		};
	}
}

/**
 * Build the quality scoring prompt
 */
function buildQualityPrompt(content: string, docType: string): string {
	const typeDescriptions: Record<string, string> = {
		readme: 'README documentation',
		api: 'API documentation',
		architecture: 'architecture documentation with diagrams',
		setup: 'setup/installation guide'
	};

	const typeDesc = typeDescriptions[docType] || 'documentation';

	return `You are a technical documentation quality analyst. Analyze the following ${typeDesc} and provide quality scores.

## Document Content
${content.slice(0, 8000)}${content.length > 8000 ? '\n\n[Content truncated for analysis]' : ''}

## Scoring Criteria

Score each category from 0-100:

1. **Completeness** (0-100): Does it cover all expected sections for ${typeDesc}?
   - Are all standard sections present?
   - Is there sufficient detail in each section?
   - Are examples included where appropriate?

2. **Accuracy** (0-100): Is the technical content accurate and consistent?
   - Are code examples syntactically correct?
   - Do the instructions make logical sense?
   - Are there any contradictions?

3. **Clarity** (0-100): Is it easy to read and understand?
   - Is the language clear and professional?
   - Is the formatting consistent?
   - Is it well-organized?

## Response Format (JSON only)

Respond with ONLY a JSON object in this exact format:
{
  "completeness": <number 0-100>,
  "accuracy": <number 0-100>,
  "clarity": <number 0-100>,
  "suggestions": [
    {
      "category": "<completeness|accuracy|clarity|format>",
      "severity": "<low|medium|high>",
      "message": "<specific actionable suggestion>",
      "section": "<optional section name>"
    }
  ]
}

Provide 2-5 specific suggestions for improvement. Be constructive and actionable.`;
}

/**
 * Parse the quality scoring response from Claude
 */
function parseQualityResponse(text: string): ScoringResult {
	try {
		// Extract JSON from response
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('No JSON found in response');
		}

		const parsed = JSON.parse(jsonMatch[0]);

		// Validate and clamp scores
		const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

		const completeness = clamp(parsed.completeness || 70);
		const accuracy = clamp(parsed.accuracy || 70);
		const clarity = clamp(parsed.clarity || 70);
		const overall = Math.round((completeness + accuracy + clarity) / 3);

		// Validate suggestions
		const suggestions: QualitySuggestion[] = [];
		if (Array.isArray(parsed.suggestions)) {
			for (const s of parsed.suggestions.slice(0, 5)) {
				if (s.category && s.severity && s.message) {
					suggestions.push({
						category: ['completeness', 'accuracy', 'clarity', 'format'].includes(s.category)
							? s.category
							: 'completeness',
						severity: ['low', 'medium', 'high'].includes(s.severity) ? s.severity : 'low',
						message: String(s.message).slice(0, 200),
						section: s.section ? String(s.section).slice(0, 50) : undefined
					});
				}
			}
		}

		return { completeness, accuracy, clarity, overall, suggestions };
	} catch (err) {
		console.error('[Quality] Error parsing response:', err);
		return {
			completeness: 70,
			accuracy: 70,
			clarity: 70,
			overall: 70,
			suggestions: []
		};
	}
}
