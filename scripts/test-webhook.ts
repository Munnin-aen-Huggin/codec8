/**
 * Test script for GitHub webhook auto-sync
 *
 * Usage: npx tsx scripts/test-webhook.ts
 */

import crypto from 'crypto';

const BASE_URL = 'http://localhost:5173';

async function testWebhook() {
	console.log('Testing GitHub webhook endpoint...\n');

	// Test 1: Ping event (no signature needed for ping)
	console.log('1. Testing ping event...');
	const pingResponse = await fetch(`${BASE_URL}/api/github/webhook`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-GitHub-Event': 'ping',
			'X-GitHub-Delivery': 'test-ping-123',
			'X-Hub-Signature-256': 'sha256=test'
		},
		body: JSON.stringify({ zen: 'Test ping' })
	});
	const pingResult = await pingResponse.text();
	console.log(`   Status: ${pingResponse.status}`);
	console.log(`   Response: ${pingResult}\n`);

	// Test 2: Push event without signature (should fail)
	console.log('2. Testing push event without signature...');
	const noSigResponse = await fetch(`${BASE_URL}/api/github/webhook`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-GitHub-Event': 'push',
			'X-GitHub-Delivery': 'test-push-no-sig'
		},
		body: JSON.stringify({ repository: { full_name: 'test/repo' } })
	});
	console.log(`   Status: ${noSigResponse.status} (expected 401)`);
	console.log(`   Response: ${await noSigResponse.text()}\n`);

	// Test 3: Push event with invalid repo (should return 200 but "not registered")
	console.log('3. Testing push event for unregistered repo...');
	const secret = 'test-secret-123';
	const payload = JSON.stringify({ repository: { full_name: 'nonexistent/repo' }, ref: 'refs/heads/main' });
	const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;

	const unknownRepoResponse = await fetch(`${BASE_URL}/api/github/webhook`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-GitHub-Event': 'push',
			'X-GitHub-Delivery': 'test-push-unknown',
			'X-Hub-Signature-256': signature
		},
		body: payload
	});
	console.log(`   Status: ${unknownRepoResponse.status}`);
	console.log(`   Response: ${await unknownRepoResponse.text()}\n`);

	console.log('Webhook endpoint tests complete!');
	console.log('\nTo test full auto-sync flow:');
	console.log('1. Go to http://localhost:5173/dashboard');
	console.log('2. Click on a connected repo');
	console.log('3. Enable "Auto-sync" toggle');
	console.log('4. Push a commit to that GitHub repo');
	console.log('5. Watch server logs for regeneration');
}

testWebhook().catch(console.error);
