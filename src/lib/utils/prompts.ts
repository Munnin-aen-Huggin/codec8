/**
 * AI Prompt Templates for Documentation Generation
 *
 * Each prompt builder takes a RepoContext and returns a structured prompt
 * for Claude to generate high-quality documentation.
 */

import type { RepoContext } from './parser';

/**
 * Builds a prompt for generating a comprehensive README.md
 */
export function buildReadmePrompt(context: RepoContext): string {
	const { repoName, description, framework, language, packageJson, fileTree, keyFiles } = context;

	return `You are an expert technical writer. Generate a professional README.md for the following repository.

## Repository Information
- **Name:** ${repoName}
- **Description:** ${description || 'No description provided'}
- **Primary Language:** ${language || 'Unknown'}
- **Framework:** ${framework || 'Unknown'}

## Package.json Contents
\`\`\`json
${packageJson ? JSON.stringify(packageJson, null, 2) : 'Not available'}
\`\`\`

## File Structure
\`\`\`
${fileTree}
\`\`\`

## Key Files Content
${keyFiles.map((f) => `### ${f.path}\n\`\`\`${f.language || ''}\n${f.content}\n\`\`\``).join('\n\n')}

## Instructions
Generate a comprehensive README.md that includes:

1. **Title and Badges** - Project name with relevant badges (build status placeholder, license, version from package.json if available)

2. **Description** - A clear, compelling description of what the project does

3. **Features** - Key features as bullet points (infer from code structure)

4. **Tech Stack** - Technologies used (infer from dependencies and file types)

5. **Prerequisites** - What users need before installing

6. **Installation** - Step-by-step installation instructions based on package.json scripts

7. **Usage** - Basic usage examples (infer from main entry points)

8. **API Reference** - Brief API overview if applicable (infer from route files or exports)

9. **Configuration** - Environment variables and configuration options (look for .env.example patterns or config files)

10. **Contributing** - Standard contributing guidelines

11. **License** - License information (use MIT if not specified)

Format the output as valid Markdown. Be concise but thorough. Do not include any explanatory text outside the README content itself.`;
}

/**
 * Builds a prompt for generating API documentation
 */
export function buildApiPrompt(context: RepoContext): string {
	const { repoName, framework, routeFiles, keyFiles } = context;

	return `You are an expert API documentation writer. Generate comprehensive API documentation for the following project.

## Repository Information
- **Name:** ${repoName}
- **Framework:** ${framework || 'Unknown'}

## Route/API Files
${routeFiles.map((f) => `### ${f.path}\n\`\`\`${f.language || 'typescript'}\n${f.content}\n\`\`\``).join('\n\n')}

## Additional Context Files
${keyFiles.slice(0, 3).map((f) => `### ${f.path}\n\`\`\`${f.language || ''}\n${f.content}\n\`\`\``).join('\n\n')}

## Instructions
Generate professional API documentation that includes:

1. **Overview** - Brief description of the API and its purpose

2. **Base URL** - Placeholder for the API base URL

3. **Authentication** - Document any authentication methods found (cookies, tokens, etc.)

4. **Endpoints** - For each endpoint found:
   - HTTP Method and Path
   - Description of what it does
   - Request Parameters (path params, query params, body)
   - Request Headers if applicable
   - Response format with example JSON
   - Possible error responses
   - Code example using fetch or curl

5. **Error Handling** - Common error response format

6. **Rate Limiting** - Placeholder if not explicitly defined

Format as Markdown with clear sections. Use tables for parameters where appropriate. Include realistic example requests and responses based on the code.

Do not include any explanatory text outside the documentation content itself.`;
}

/**
 * Builds a prompt for generating architecture documentation with Mermaid diagrams
 */
export function buildArchitecturePrompt(context: RepoContext): string {
	const { repoName, framework, fileTree, keyFiles, packageJson } = context;

	return `You are a software architect. Generate architecture documentation with Mermaid diagrams for the following project.

## Repository Information
- **Name:** ${repoName}
- **Framework:** ${framework || 'Unknown'}

## Dependencies
\`\`\`json
${packageJson ? JSON.stringify({ dependencies: packageJson.dependencies, devDependencies: packageJson.devDependencies }, null, 2) : 'Not available'}
\`\`\`

## File Structure
\`\`\`
${fileTree}
\`\`\`

## Key Files
${keyFiles.map((f) => `### ${f.path}\n\`\`\`${f.language || ''}\n${f.content}\n\`\`\``).join('\n\n')}

## Instructions
Generate architecture documentation that includes:

1. **System Overview** - High-level description of the system architecture

2. **Architecture Diagram** - A Mermaid flowchart showing major components and their interactions:
\`\`\`mermaid
flowchart TD
    subgraph Client
        ...
    end
    subgraph Server
        ...
    end
    subgraph Database
        ...
    end
\`\`\`

3. **Component Breakdown** - Description of each major component/module

4. **Data Flow Diagram** - Mermaid sequence diagram showing typical request flow:
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    ...
\`\`\`

5. **Directory Structure** - Explanation of the project organization

6. **Key Design Decisions** - Infer architectural patterns used (MVC, event-driven, etc.)

7. **External Dependencies** - Key third-party services and how they're integrated

8. **Database Schema** (if applicable) - Entity relationship diagram in Mermaid:
\`\`\`mermaid
erDiagram
    ...
\`\`\`

Ensure all Mermaid diagrams are valid and will render correctly. Be specific about the components you identify from the actual code structure.

Do not include any explanatory text outside the documentation content itself.`;
}

/**
 * Builds a prompt for generating setup/installation guide
 */
export function buildSetupPrompt(context: RepoContext): string {
	const { repoName, framework, language, packageJson, fileTree, envExample } = context;

	return `You are a DevOps engineer writing setup documentation. Generate a comprehensive setup guide for the following project.

## Repository Information
- **Name:** ${repoName}
- **Primary Language:** ${language || 'Unknown'}
- **Framework:** ${framework || 'Unknown'}

## Package.json
\`\`\`json
${packageJson ? JSON.stringify(packageJson, null, 2) : 'Not available'}
\`\`\`

## File Structure
\`\`\`
${fileTree}
\`\`\`

## Environment Variables Example
\`\`\`
${envExample || 'No .env.example found'}
\`\`\`

## Instructions
Generate a detailed setup guide that includes:

1. **Prerequisites**
   - Required software and versions (Node.js, npm/yarn/pnpm, etc.)
   - Required accounts/services (databases, APIs, etc.)
   - System requirements

2. **Quick Start**
   - Clone repository command
   - Install dependencies command
   - Start development server command

3. **Environment Configuration**
   - List all environment variables
   - Explain what each variable is for
   - Provide example values where safe
   - Instructions for obtaining API keys/secrets

4. **Database Setup** (if applicable)
   - Database installation/connection
   - Migration commands
   - Seed data commands

5. **Development Workflow**
   - Available npm scripts and what they do
   - Hot reload setup
   - Testing commands

6. **Building for Production**
   - Build command
   - Environment differences
   - Optimization notes

7. **Deployment**
   - Recommended hosting platforms based on the stack
   - Deployment commands or CI/CD setup hints
   - Environment variable configuration in production

8. **Troubleshooting**
   - Common issues and solutions
   - How to reset the development environment
   - Debug mode instructions

Format as clear, step-by-step Markdown instructions. Use code blocks for all commands. Be specific based on the actual package.json scripts.

Do not include any explanatory text outside the documentation content itself.`;
}

/**
 * Map doc types to their prompt builders
 */
export const promptBuilders = {
	readme: buildReadmePrompt,
	api: buildApiPrompt,
	architecture: buildArchitecturePrompt,
	setup: buildSetupPrompt
} as const;

export type DocType = keyof typeof promptBuilders;
