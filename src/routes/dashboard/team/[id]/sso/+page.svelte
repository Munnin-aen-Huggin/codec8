<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();

	// Form state
	let provider = $state(data.ssoConfig?.provider || 'okta');
	let entityId = $state(data.ssoConfig?.entityId || '');
	let ssoUrl = $state(data.ssoConfig?.ssoUrl || '');
	let certificate = $state('');
	let requireSso = $state(data.ssoConfig?.requireSso || false);
	let jitProvisioning = $state(data.ssoConfig?.jitProvisioning ?? true);

	// Attribute mapping
	let emailAttr = $state(data.ssoConfig?.attributeMapping?.email || '');
	let firstNameAttr = $state(data.ssoConfig?.attributeMapping?.firstName || '');
	let lastNameAttr = $state(data.ssoConfig?.attributeMapping?.lastName || '');
	let groupsAttr = $state(data.ssoConfig?.attributeMapping?.groups || '');

	// UI state
	let saving = $state(false);
	let testing = $state(false);
	let deleting = $state(false);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let showCertField = $state(!data.ssoConfig?.hasCertificate);

	const providers = [
		{ value: 'okta', label: 'Okta' },
		{ value: 'azure_ad', label: 'Azure AD' },
		{ value: 'google', label: 'Google Workspace' },
		{ value: 'custom', label: 'Custom IdP' }
	];

	async function testConnection() {
		testing = true;
		message = null;

		try {
			const res = await fetch(`/api/teams/${data.team.id}/sso`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					provider,
					entity_id: entityId,
					sso_url: ssoUrl,
					certificate: certificate || (data.ssoConfig?.hasCertificate ? 'EXISTING' : ''),
					attribute_mapping: {
						email: emailAttr || undefined,
						firstName: firstNameAttr || undefined,
						lastName: lastNameAttr || undefined,
						groups: groupsAttr || undefined
					},
					require_sso: requireSso,
					jit_provisioning: jitProvisioning,
					test_only: true
				})
			});

			const result = await res.json();

			if (result.success) {
				message = { type: 'success', text: 'Connection test successful!' };
			} else {
				message = { type: 'error', text: result.error || 'Connection test failed' };
			}
		} catch (err) {
			message = { type: 'error', text: 'Failed to test connection' };
		} finally {
			testing = false;
		}
	}

	async function saveConfig() {
		saving = true;
		message = null;

		try {
			const res = await fetch(`/api/teams/${data.team.id}/sso`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					provider,
					entity_id: entityId,
					sso_url: ssoUrl,
					certificate: certificate || undefined,
					attribute_mapping: {
						email: emailAttr || undefined,
						firstName: firstNameAttr || undefined,
						lastName: lastNameAttr || undefined,
						groups: groupsAttr || undefined
					},
					require_sso: requireSso,
					jit_provisioning: jitProvisioning
				})
			});

			if (res.ok) {
				message = { type: 'success', text: 'SSO configuration saved successfully!' };
				showCertField = false;
			} else {
				const error = await res.json();
				message = { type: 'error', text: error.message || 'Failed to save configuration' };
			}
		} catch (err) {
			message = { type: 'error', text: 'Failed to save configuration' };
		} finally {
			saving = false;
		}
	}

	async function deleteConfig() {
		if (!confirm('Are you sure you want to remove SSO configuration? Team members will need to use other login methods.')) {
			return;
		}

		deleting = true;
		message = null;

		try {
			const res = await fetch(`/api/teams/${data.team.id}/sso`, {
				method: 'DELETE'
			});

			if (res.ok) {
				message = { type: 'success', text: 'SSO configuration removed' };
				// Reset form
				entityId = '';
				ssoUrl = '';
				certificate = '';
				requireSso = false;
				showCertField = true;
			} else {
				const error = await res.json();
				message = { type: 'error', text: error.message || 'Failed to remove configuration' };
			}
		} catch (err) {
			message = { type: 'error', text: 'Failed to remove configuration' };
		} finally {
			deleting = false;
		}
	}

	const metadataUrl = $derived(`${$page.url.origin}/api/teams/${data.team.id}/sso/metadata`);
	const callbackUrl = $derived(`${$page.url.origin}/auth/sso/callback`);
	const ssoLoginUrl = $derived(`${$page.url.origin}/auth/sso?team=${data.team.slug}`);
</script>

<svelte:head>
	<title>SSO Settings - {data.team.name} | CodeDoc AI</title>
</svelte:head>

<div class="sso-settings">
	<header class="page-header">
		<div class="header-content">
			<a href="/dashboard/team/{data.team.id}" class="back-link">
				← Back to Team
			</a>
			<h1>SSO Settings</h1>
			<p class="subtitle">{data.team.name}</p>
		</div>
	</header>

	{#if message}
		<div class="message {message.type}">
			{message.text}
		</div>
	{/if}

	<div class="content">
		<!-- SP Information Card -->
		<div class="card info-card">
			<h2>Service Provider Information</h2>
			<p class="description">Use these values when configuring your Identity Provider</p>

			<div class="info-grid">
				<div class="info-item">
					<label>SP Entity ID / Audience URI</label>
					<div class="copy-field">
						<code>{metadataUrl}</code>
						<button onclick={() => navigator.clipboard.writeText(metadataUrl)}>Copy</button>
					</div>
				</div>

				<div class="info-item">
					<label>ACS URL (Callback URL)</label>
					<div class="copy-field">
						<code>{callbackUrl}</code>
						<button onclick={() => navigator.clipboard.writeText(callbackUrl)}>Copy</button>
					</div>
				</div>

				<div class="info-item">
					<label>SSO Login URL</label>
					<div class="copy-field">
						<code>{ssoLoginUrl}</code>
						<button onclick={() => navigator.clipboard.writeText(ssoLoginUrl)}>Copy</button>
					</div>
				</div>

				<div class="info-item">
					<label>SP Metadata</label>
					<a href={metadataUrl} target="_blank" class="metadata-link">
						Download Metadata XML
					</a>
				</div>
			</div>
		</div>

		<!-- Configuration Form -->
		<form class="card config-form" onsubmit={(e) => { e.preventDefault(); saveConfig(); }}>
			<h2>Identity Provider Configuration</h2>

			<div class="form-group">
				<label for="provider">Identity Provider</label>
				<select id="provider" bind:value={provider}>
					{#each providers as p}
						<option value={p.value}>{p.label}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="entityId">IdP Entity ID</label>
				<input
					type="text"
					id="entityId"
					bind:value={entityId}
					placeholder="https://your-idp.com/entity-id"
					required
				/>
				<span class="help-text">The Entity ID from your IdP metadata</span>
			</div>

			<div class="form-group">
				<label for="ssoUrl">SSO URL (IdP Entry Point)</label>
				<input
					type="url"
					id="ssoUrl"
					bind:value={ssoUrl}
					placeholder="https://your-idp.com/sso/saml"
					required
				/>
				<span class="help-text">The URL where users authenticate</span>
			</div>

			<div class="form-group">
				<label for="certificate">
					IdP Signing Certificate
					{#if data.ssoConfig?.hasCertificate && !showCertField}
						<button type="button" class="link-btn" onclick={() => showCertField = true}>
							(Update)
						</button>
					{/if}
				</label>
				{#if showCertField}
					<textarea
						id="certificate"
						bind:value={certificate}
						placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
						rows="6"
						required={!data.ssoConfig?.hasCertificate}
					></textarea>
					<span class="help-text">The X.509 certificate from your IdP</span>
				{:else}
					<p class="cert-status">Certificate configured</p>
				{/if}
			</div>

			<hr />

			<h3>Attribute Mapping (Optional)</h3>
			<p class="description">Map IdP attributes to user fields. Leave blank to use defaults.</p>

			<div class="attr-grid">
				<div class="form-group">
					<label for="emailAttr">Email Attribute</label>
					<input
						type="text"
						id="emailAttr"
						bind:value={emailAttr}
						placeholder="email"
					/>
				</div>

				<div class="form-group">
					<label for="firstNameAttr">First Name Attribute</label>
					<input
						type="text"
						id="firstNameAttr"
						bind:value={firstNameAttr}
						placeholder="firstName"
					/>
				</div>

				<div class="form-group">
					<label for="lastNameAttr">Last Name Attribute</label>
					<input
						type="text"
						id="lastNameAttr"
						bind:value={lastNameAttr}
						placeholder="lastName"
					/>
				</div>

				<div class="form-group">
					<label for="groupsAttr">Groups Attribute</label>
					<input
						type="text"
						id="groupsAttr"
						bind:value={groupsAttr}
						placeholder="groups"
					/>
				</div>
			</div>

			<hr />

			<h3>Security Options</h3>

			<div class="checkbox-group">
				<label>
					<input type="checkbox" bind:checked={jitProvisioning} />
					Enable Just-in-Time Provisioning
				</label>
				<span class="help-text">Automatically create user accounts on first SSO login</span>
			</div>

			<div class="checkbox-group">
				<label>
					<input type="checkbox" bind:checked={requireSso} />
					Require SSO for all team members
				</label>
				<span class="help-text">Team members must use SSO to access the team</span>
			</div>

			<div class="form-actions">
				<button
					type="button"
					class="btn-secondary"
					onclick={testConnection}
					disabled={testing || !entityId || !ssoUrl}
				>
					{testing ? 'Testing...' : 'Test Connection'}
				</button>

				<button
					type="submit"
					class="btn-primary"
					disabled={saving || !entityId || !ssoUrl}
				>
					{saving ? 'Saving...' : 'Save Configuration'}
				</button>
			</div>
		</form>

		{#if data.ssoConfig}
			<div class="card danger-zone">
				<h2>Danger Zone</h2>
				<p>Remove SSO configuration for this team. Team members will need to use other login methods.</p>
				<button
					class="btn-danger"
					onclick={deleteConfig}
					disabled={deleting}
				>
					{deleting ? 'Removing...' : 'Remove SSO Configuration'}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.sso-settings {
		min-height: 100vh;
		background: #0a0a0a;
		color: #fff;
	}

	.page-header {
		border-bottom: 1px solid #222;
		padding: 2rem;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.back-link {
		color: #888;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		color: #fff;
	}

	h1 {
		font-size: 1.75rem;
		margin: 0.5rem 0 0.25rem;
	}

	.subtitle {
		color: #888;
		margin: 0;
	}

	.content {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.message {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.message.success {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		color: #22c55e;
	}

	.message.error {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #ef4444;
	}

	.card {
		background: #111;
		border: 1px solid #222;
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.card h2 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
	}

	.card h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem;
		color: #ccc;
	}

	.description {
		color: #888;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.info-grid {
		display: grid;
		gap: 1rem;
	}

	.info-item label {
		display: block;
		font-size: 0.75rem;
		color: #888;
		margin-bottom: 0.25rem;
		text-transform: uppercase;
	}

	.copy-field {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.copy-field code {
		flex: 1;
		background: #0a0a0a;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		overflow-x: auto;
		white-space: nowrap;
	}

	.copy-field button {
		padding: 0.5rem 0.75rem;
		background: #222;
		border: none;
		border-radius: 0.375rem;
		color: #fff;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.copy-field button:hover {
		background: #333;
	}

	.metadata-link {
		color: #60a5fa;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.metadata-link:hover {
		text-decoration: underline;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		background: #0a0a0a;
		border: 1px solid #333;
		border-radius: 0.5rem;
		color: #fff;
		font-size: 0.875rem;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #60a5fa;
	}

	.help-text {
		display: block;
		font-size: 0.75rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.link-btn {
		background: none;
		border: none;
		color: #60a5fa;
		cursor: pointer;
		font-size: 0.75rem;
	}

	.cert-status {
		color: #22c55e;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cert-status::before {
		content: '✓';
	}

	hr {
		border: none;
		border-top: 1px solid #222;
		margin: 1.5rem 0;
	}

	.attr-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (max-width: 640px) {
		.attr-grid {
			grid-template-columns: 1fr;
		}
	}

	.checkbox-group {
		margin-bottom: 1rem;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-group input[type="checkbox"] {
		width: auto;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-primary {
		background: #2563eb;
		color: #fff;
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: transparent;
		color: #fff;
		border: 1px solid #333;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #222;
	}

	.btn-danger {
		background: #dc2626;
		color: #fff;
		border: none;
	}

	.btn-danger:hover:not(:disabled) {
		background: #b91c1c;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.danger-zone {
		border-color: rgba(239, 68, 68, 0.3);
	}

	.danger-zone h2 {
		color: #ef4444;
	}

	.danger-zone p {
		color: #888;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}
</style>
