import { supabaseAdmin } from './supabase';
import type { DocTemplate } from '$lib/types';

const DEFAULT_TEMPLATES: Record<string, string> = {
	readme: `Generate a comprehensive README.md for this repository.
Include:
- Project title and description
- Features and highlights
- Installation instructions
- Usage examples
- Configuration options
- Contributing guidelines
- License information

Use clear, concise language. Format in proper Markdown.`,

	api: `Generate API documentation for this codebase.
Include:
- Overview of available endpoints/functions
- Request/response formats
- Authentication requirements
- Error codes and handling
- Usage examples for each endpoint
- Rate limits if applicable

Format as structured Markdown with code examples.`,

	architecture: `Generate architecture documentation for this codebase.
Include:
- System overview and design philosophy
- Component breakdown
- Data flow diagrams (Mermaid syntax)
- Key design decisions
- Dependencies and integrations
- Deployment architecture

Use Mermaid diagrams where helpful.`,

	setup: `Generate a setup guide for this repository.
Include:
- Prerequisites and requirements
- Step-by-step installation
- Environment configuration
- Database setup if needed
- Development server instructions
- Troubleshooting common issues

Format as a clear, numbered guide.`
};

export async function getTeamTemplates(teamId: string): Promise<DocTemplate[]> {
	const { data, error } = await supabaseAdmin
		.from('doc_templates')
		.select('*')
		.eq('team_id', teamId)
		.order('doc_type')
		.order('name');

	if (error) throw error;
	return data || [];
}

export async function getTemplate(
	teamId: string | null,
	docType: string
): Promise<string> {
	// If team has a default template for this type, use it
	if (teamId) {
		const { data } = await supabaseAdmin
			.from('doc_templates')
			.select('prompt_template')
			.eq('team_id', teamId)
			.eq('doc_type', docType)
			.eq('is_default', true)
			.single();

		if (data?.prompt_template) {
			return data.prompt_template;
		}
	}

	// Fall back to built-in default
	return DEFAULT_TEMPLATES[docType] || DEFAULT_TEMPLATES.readme;
}

export async function createTemplate(
	teamId: string,
	docType: string,
	name: string,
	promptTemplate: string,
	createdBy: string,
	isDefault: boolean = false
): Promise<DocTemplate> {
	// If setting as default, unset existing defaults
	if (isDefault) {
		await supabaseAdmin
			.from('doc_templates')
			.update({ is_default: false })
			.eq('team_id', teamId)
			.eq('doc_type', docType);
	}

	const { data, error } = await supabaseAdmin
		.from('doc_templates')
		.insert({
			team_id: teamId,
			doc_type: docType,
			name,
			prompt_template: promptTemplate,
			is_default: isDefault,
			created_by: createdBy
		})
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			throw new Error('A template with this name already exists');
		}
		throw error;
	}

	return data;
}

export async function updateTemplate(
	templateId: string,
	updates: {
		name?: string;
		prompt_template?: string;
		is_default?: boolean;
	},
	teamId: string
): Promise<DocTemplate> {
	// If setting as default, get doc_type and unset others
	if (updates.is_default) {
		const { data: existing } = await supabaseAdmin
			.from('doc_templates')
			.select('doc_type')
			.eq('id', templateId)
			.single();

		if (existing) {
			await supabaseAdmin
				.from('doc_templates')
				.update({ is_default: false })
				.eq('team_id', teamId)
				.eq('doc_type', existing.doc_type);
		}
	}

	const { data, error } = await supabaseAdmin
		.from('doc_templates')
		.update({
			...updates,
			updated_at: new Date().toISOString()
		})
		.eq('id', templateId)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteTemplate(templateId: string): Promise<void> {
	const { error } = await supabaseAdmin
		.from('doc_templates')
		.delete()
		.eq('id', templateId);

	if (error) throw error;
}

export async function duplicateTemplate(
	templateId: string,
	newName: string,
	createdBy: string
): Promise<DocTemplate> {
	const { data: original } = await supabaseAdmin
		.from('doc_templates')
		.select('*')
		.eq('id', templateId)
		.single();

	if (!original) throw new Error('Template not found');

	const { data, error } = await supabaseAdmin
		.from('doc_templates')
		.insert({
			team_id: original.team_id,
			doc_type: original.doc_type,
			name: newName,
			prompt_template: original.prompt_template,
			is_default: false,
			created_by: createdBy
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

// Get default templates for display/reference
export function getDefaultTemplates(): Record<string, string> {
	return { ...DEFAULT_TEMPLATES };
}
