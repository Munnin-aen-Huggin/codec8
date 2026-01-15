import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
	test.describe('Page Load', () => {
		test('landing page loads successfully', async ({ page }) => {
			await page.goto('/');
			await expect(page).toHaveTitle(/CodeDoc AI/);
		});

		test('has visible h1 heading', async ({ page }) => {
			await page.goto('/');
			const h1 = page.locator('h1').first();
			await expect(h1).toBeVisible();
			await expect(h1).toContainText('writes itself');
		});

		test('navigation links are present', async ({ page }) => {
			await page.goto('/');
			// Top nav has logo and sign in
			await expect(page.locator('.top-nav .logo')).toContainText('CodeDoc AI');
			await expect(page.locator('.nav-link').filter({ hasText: 'Sign In' })).toBeVisible();
		});
	});

	test.describe('Hero Section', () => {
		test('trust badge is visible', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('.trust-badge')).toBeVisible();
			await expect(page.locator('.trust-badge')).toContainText('Try free');
		});

		test('demo form input is visible', async ({ page }) => {
			await page.goto('/');
			const input = page.locator('.demo-input').first();
			await expect(input).toBeVisible();
			await expect(input).toHaveAttribute('placeholder', 'https://github.com/owner/repo');
		});

		test('Generate button is visible and clickable', async ({ page }) => {
			await page.goto('/');
			const button = page.locator('.cta-primary').first();
			await expect(button).toBeVisible();
			await expect(button).toContainText('Generate');
		});

		test('demo details show usage info', async ({ page }) => {
			await page.goto('/');
			const details = page.locator('.demo-details');
			await expect(details).toContainText('1 free demo');
			await expect(details).toContainText('No signup');
		});

		test('doc type badges are displayed', async ({ page }) => {
			await page.goto('/');
			const docTypes = page.locator('.doc-types');
			await expect(docTypes).toContainText('README');
			await expect(docTypes).toContainText('API Docs');
			await expect(docTypes).toContainText('Architecture');
			await expect(docTypes).toContainText('Setup Guide');
		});
	});

	test.describe('Pricing Section', () => {
		test('pricing section exists', async ({ page }) => {
			await page.goto('/');
			const pricingSection = page.locator('#pricing');
			await expect(pricingSection).toBeVisible();
		});

		test('all 4 pricing tiers are displayed', async ({ page }) => {
			await page.goto('/');
			const pricingCards = page.locator('.pricing-card');
			await expect(pricingCards).toHaveCount(4);
		});

		test('Free Demo tier is displayed correctly', async ({ page }) => {
			await page.goto('/');
			const freeCard = page.locator('.pricing-card').filter({ hasText: 'FREE DEMO' });
			await expect(freeCard).toBeVisible();
			await expect(freeCard.locator('.amount')).toContainText('$0');
		});

		test('Single Repo tier shows $99 price', async ({ page }) => {
			await page.goto('/');
			const singleCard = page.locator('.pricing-card').filter({ hasText: 'SINGLE REPO' });
			await expect(singleCard).toBeVisible();
			await expect(singleCard.locator('.amount')).toContainText('$99');
			await expect(singleCard.locator('.period')).toContainText('one-time');
		});

		test('Pro tier shows $149/mo price', async ({ page }) => {
			await page.goto('/');
			const proCard = page.locator('.pricing-card').filter({ hasText: 'PRO' });
			await expect(proCard).toBeVisible();
			await expect(proCard.locator('.amount')).toContainText('$149');
			await expect(proCard.locator('.period')).toContainText('/mo');
		});

		test('Team tier shows $399/mo price', async ({ page }) => {
			await page.goto('/');
			const teamCard = page.locator('.pricing-card').filter({ hasText: 'TEAM' });
			await expect(teamCard).toBeVisible();
			await expect(teamCard.locator('.amount')).toContainText('$399');
			await expect(teamCard.locator('.period')).toContainText('/mo');
		});

		test('Single Repo tier has POPULAR badge', async ({ page }) => {
			await page.goto('/');
			const singleCard = page.locator('.pricing-card.featured');
			await expect(singleCard).toBeVisible();
			await expect(singleCard.locator('.featured-badge')).toContainText('POPULAR');
		});

		test('each tier has CTA button', async ({ page }) => {
			await page.goto('/');
			const ctaButtons = page.locator('.pricing-cta');
			await expect(ctaButtons).toHaveCount(4);
		});
	});

	test.describe('FAQ Section', () => {
		test('FAQ section is present', async ({ page }) => {
			await page.goto('/');
			const faqSection = page.locator('.faq-section');
			await expect(faqSection).toBeVisible();
			await expect(faqSection.locator('h2')).toContainText('Frequently Asked Questions');
		});

		test('FAQ accordion items are present', async ({ page }) => {
			await page.goto('/');
			const faqItems = page.locator('.faq-item');
			// Based on the component, there are 6 FAQs
			await expect(faqItems).toHaveCount(6);
		});

		test('clicking FAQ question expands answer', async ({ page }) => {
			await page.goto('/');
			// Find first FAQ question
			const firstQuestion = page.locator('.faq-question').first();
			await firstQuestion.click();
			// Answer should be visible after click
			const firstAnswer = page.locator('.faq-answer').first();
			await expect(firstAnswer).toBeVisible();
		});

		test('clicking expanded FAQ collapses it', async ({ page }) => {
			await page.goto('/');
			// Click to expand
			const firstQuestion = page.locator('.faq-question').first();
			await firstQuestion.click();
			await expect(page.locator('.faq-answer').first()).toBeVisible();
			// Click again to collapse
			await firstQuestion.click();
			await expect(page.locator('.faq-answer')).toHaveCount(0);
		});
	});

	test.describe('Navigation', () => {
		test('header contains logo', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('.top-nav .logo')).toContainText('CodeDoc AI');
		});

		test('sign in link is visible', async ({ page }) => {
			await page.goto('/');
			const signInLink = page.locator('.nav-link').filter({ hasText: 'Sign In' });
			await expect(signInLink).toBeVisible();
			await expect(signInLink).toHaveAttribute('href', '/auth/login');
		});

		test('pricing link scrolls to pricing section', async ({ page }) => {
			await page.goto('/');
			const pricingLink = page.locator('.nav-link').filter({ hasText: 'Pricing' });
			await expect(pricingLink).toHaveAttribute('href', '#pricing');
		});

		test('Try Demo button is visible in nav', async ({ page }) => {
			await page.goto('/');
			const tryDemoBtn = page.locator('.nav-cta');
			await expect(tryDemoBtn).toBeVisible();
			await expect(tryDemoBtn).toContainText('Try Demo');
		});
	});

	test.describe('Footer', () => {
		test('footer has privacy and terms links', async ({ page }) => {
			await page.goto('/');
			const footer = page.locator('footer');
			await expect(footer.locator('a').filter({ hasText: 'Privacy' })).toBeVisible();
			await expect(footer.locator('a').filter({ hasText: 'Terms' })).toBeVisible();
		});

		test('footer has contact link', async ({ page }) => {
			await page.goto('/');
			const contactLink = page.locator('footer a').filter({ hasText: 'Contact' });
			await expect(contactLink).toBeVisible();
		});
	});

	test.describe('Form Validation', () => {
		test('empty URL shows error when submitted', async ({ page }) => {
			await page.goto('/');
			// Find the demo form's submit button and click it with empty input
			const generateBtn = page.locator('.demo-form .cta-primary').first();
			await generateBtn.click();
			// Should show error message
			await expect(page.locator('.error-message')).toContainText('Please enter a GitHub repository URL');
		});

		test('invalid URL shows error', async ({ page }) => {
			await page.goto('/');
			const input = page.locator('.demo-input').first();
			await input.fill('not-a-valid-url');
			const generateBtn = page.locator('.demo-form .cta-primary').first();
			await generateBtn.click();
			await expect(page.locator('.error-message')).toContainText('valid GitHub URL');
		});
	});
});
