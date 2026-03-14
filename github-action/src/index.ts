import * as core from '@actions/core';
import * as github from '@actions/github';

const API_URL = 'https://codec8.com/api/action/regenerate';

async function run(): Promise<void> {
  try {
    const apiToken = core.getInput('api-token', { required: true });
    const userId = core.getInput('user-id', { required: true });
    const docTypesInput = core.getInput('doc-types') || 'readme,api,architecture,setup';

    const types = docTypesInput.split(',').map((t) => t.trim()).filter(Boolean);
    const repoFullName = `${github.context.repo.owner}/${github.context.repo.repo}`;

    core.info(`Regenerating docs for ${repoFullName}...`);
    core.info(`Doc types: ${types.join(', ')}`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Codec8-Token': apiToken
      },
      body: JSON.stringify({
        user_id: userId,
        repo_full_name: repoFullName,
        types
      })
    });

    if (!response.ok) {
      const text = await response.text();
      core.setFailed(`Codec8 API error (${response.status}): ${text}`);
      return;
    }

    const result = await response.json() as {
      success: boolean;
      docs_generated: number;
      types: string[];
      errors?: { type: string; error: string }[];
    };

    core.setOutput('docs-generated', String(result.docs_generated));
    core.info(`✓ Generated ${result.docs_generated} documentation files: ${result.types.join(', ')}`);

    if (result.errors && result.errors.length > 0) {
      for (const err of result.errors) {
        core.warning(`Failed to generate ${err.type}: ${err.error}`);
      }
    }

    core.info('Documentation updated successfully. View at https://codec8.com/dashboard');
  } catch (err) {
    core.setFailed(err instanceof Error ? err.message : 'Unknown error');
  }
}

run();
