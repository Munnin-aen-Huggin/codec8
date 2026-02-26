import { expect, test } from '@playwright/test';

test.describe('Demo/Try Page', () => {
	test.describe('Page Load', () => {
		test('demo page loads at /try route', async ({ page }) => {
			await page.goto('/try');
			await expect(page).toHaveTitle(/Try Codec8/);
		});

		test('has main heading', async ({ page }) => {
			await page.goto('/try');
			const h1 = page.locator('h1');
			await expect(h1).toBeVisible();
			await expect(h1).toContainText('See it work');
		});

		test('has description text', async ({ page }) => {
			await page.goto('/try');
			const description = page.locator('main p').first();
			await expect(description).toContainText('public GitHub repository');
			await expect(description).toContainText('No signup required');
		});
	});

	test.describe('Form Elements', () => {
		test('has form for repo URL input', async ({ page }) => {
			await page.goto('/try');
			const form = page.locator('form');
			await expect(form).toBeVisible();
		});

		test('input has correct placeholder', async ({ page }) => {
			await page.goto('/try');
			const input = page.locator('input[type="text"]');
			await expect(input).toHaveAttribute('placeholder', 'https://github.com/owner/repo');
		});

		test('submit button is present', async ({ page }) => {
			await page.goto('/try');
			const submitBtn = page.locator('button[type="submit"]');
			await expect(submitBtn).toBeVisible();
			await expect(submitBtn).toContainText('Generate README');
		});

		test('submit button is disabled when input is empty', async ({ page }) => {
			await page.goto('/try');
			const submitBtn = page.locator('button[type="submit"]');
			// Clear any URL params first
			const input = page.locator('input[type="text"]');
			await input.fill('');
			await expect(submitBtn).toBeDisabled();
		});
	});

	test.describe('Form Interaction', () => {
		test('can type in repo URL input', async ({ page }) => {
			await page.goto('/try');
			const input = page.locator('input[type="text"]');
			await input.fill('https://github.com/sveltejs/kit');
			await expect(input).toHaveValue('https://github.com/sveltejs/kit');
		});

		test('valid URL enables submit button', async ({ page }) => {
			await page.goto('/try');
			const input = page.locator('input[type="text"]');
			const submitBtn = page.locator('button[type="submit"]');

			await input.fill('https://github.com/sveltejs/kit');
			await expect(submitBtn).not.toBeDisabled();
		});

		test('URL param pre-populates input', async ({ page }) => {
			await page.goto('/try?url=https%3A%2F%2Fgithub.com%2Fuser%2Frepo');
			const input = page.locator('input[type="text"]');
			await expect(input).toHaveValue('https://github.com/user/repo');
		});
	});

	test.describe('UI Elements', () => {
		test('header is visible with logo', async ({ page }) => {
			await page.goto('/try');
			const header = page.locator('header');
			await expect(header).toBeVisible();
			await expect(header.locator('a').first()).toContainText('Codec8');
		});

		test('has sign in link in header', async ({ page }) => {
			await page.goto('/try');
			const signInLink = page.locator('header a').filter({ hasText: 'Sign In' });
			await expect(signInLink).toBeVisible();
			await expect(signInLink).toHaveAttribute('href', '/auth/login');
		});

		test('footer has back to homepage link', async ({ page }) => {
			await page.goto('/try');
			const footerLink = page.locator('footer a');
			await expect(footerLink).toContainText('Back to homepage');
			await expect(footerLink).toHaveAttribute('href', '/');
		});

		test('empty state shows placeholder instructions', async ({ page }) => {
			await page.goto('/try');
			// Clear any URL param by visiting clean URL
			const input = page.locator('input[type="text"]');
			await input.fill('');
			// Should show empty state
			await expect(page.getByText('Enter a GitHub URL to get started')).toBeVisible();
		});

		test('empty state shows example URL', async ({ page }) => {
			await page.goto('/try');
			const input = page.locator('input[type="text"]');
			await input.fill('');
			await expect(page.getByText('Example: https://github.com/sveltejs/kit')).toBeVisible();
		});
	});

	test.describe('Navigation', () => {
		test('logo links back to homepage', async ({ page }) => {
			await page.goto('/try');
			const logoLink = page.locator('header a').first();
			await expect(logoLink).toHaveAttribute('href', '/');
		});

		test('can navigate back to homepage from footer', async ({ page }) => {
			await page.goto('/try');
			const footerLink = page.locator('footer a');
			await footerLink.click();
			await expect(page).toHaveURL('/');
		});
	});

	test.describe('Loading State', () => {
		// Note: We don't test actual API generation, just UI states
		test('submit shows loading indicator when clicked', async ({ page }) => {
			await page.goto('/try');
			const input = page.locator('input[type="text"]');
			await input.fill('https://github.com/sveltejs/kit');

			const submitBtn = page.locator('button[type="submit"]');
			// Click submit but don't wait for navigation - just check immediate state
			await submitBtn.click();

			// Loading text should appear
			await expect(submitBtn).toContainText('Generating');
		});

		test('input is disabled during loading', async ({ page }) => {
			await page.goto('/try');
			const input = page.locator('input[type="text"]');
			await input.fill('https://github.com/sveltejs/kit');

			const submitBtn = page.locator('button[type="submit"]');
			await submitBtn.click();

			// Input should be disabled during loading
			await expect(input).toBeDisabled();
		});
	});
});
