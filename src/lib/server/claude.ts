/**
 * Claude AI Integration for Documentation Generation
 *
 * Uses Anthropic's Claude API to generate professional documentation
 * from repository context.
 */

import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import type { RepoContext } from '$lib/utils/parser';
import { promptBuilders, type DocType } from '$lib/utils/prompts';

// Initialize the Anthropic client
const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

// Model configuration
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

/**
 * Result of a documentation generation request
 */
export interface GenerationResult {
	type: DocType;
	content: string;
	success: boolean;
	error?: string;
}

/**
 * Generate documentation for a specific type
 */
export async function generateDocumentation(
	context: RepoContext,
	docType: DocType
): Promise<GenerationResult> {
	try {
		const promptBuilder = promptBuilders[docType];
		if (!promptBuilder) {
			return {
				type: docType,
				content: '',
				success: false,
				error: `Unknown documentation type: ${docType}`
			};
		}

		const prompt = promptBuilder(context);

		const message = await anthropic.messages.create({
			model: MODEL,
			max_tokens: MAX_TOKENS,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			]
		});

		// Extract text content from response
		const textContent = message.content.find((block) => block.type === 'text');
		if (!textContent || textContent.type !== 'text') {
			return {
				type: docType,
				content: '',
				success: false,
				error: 'No text content in response'
			};
		}

		return {
			type: docType,
			content: textContent.text,
			success: true
		};
	} catch (error) {
		console.error(`Error generating ${docType} documentation:`, error);
		return {
			type: docType,
			content: '',
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Generate multiple documentation types in parallel
 */
export async function generateMultipleDocs(
	context: RepoContext,
	docTypes: DocType[]
): Promise<GenerationResult[]> {
	const results = await Promise.all(
		docTypes.map((type) => generateDocumentation(context, type))
	);

	return results;
}

/**
 * Generate all documentation types
 */
export async function generateAllDocs(
	context: RepoContext
): Promise<GenerationResult[]> {
	const allTypes: DocType[] = ['readme', 'api', 'architecture', 'setup'];
	return generateMultipleDocs(context, allTypes);
}
