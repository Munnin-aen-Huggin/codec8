import { describe, it, expect } from 'vitest';

// Test pure utility functions only - no database calls
// Import the generateLicenseKey function from stripe.ts since license.ts requires supabase
import { generateLicenseKey, PLAN_LIMITS, PRICE_DETAILS } from '$lib/server/stripe';

describe('License Key Generation', () => {
  it('should generate a license key in correct format', () => {
    const key = generateLicenseKey();
    expect(key).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('should generate unique keys', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateLicenseKey());
    }
    expect(keys.size).toBe(100);
  });

  it('should generate keys with 19 characters (including dashes)', () => {
    const key = generateLicenseKey();
    expect(key.length).toBe(19);
  });
});

describe('Plan Limits', () => {
  it('should have correct limits for free plan', () => {
    expect(PLAN_LIMITS.free.repos).toBe(1);
    expect(PLAN_LIMITS.free.docsPerMonth).toBe(3);
  });

  it('should have correct limits for single repo purchase', () => {
    expect(PLAN_LIMITS.single.repos).toBe(1);
    expect(PLAN_LIMITS.single.docsPerMonth).toBe(-1); // Unlimited
  });

  it('should have correct repo limits for subscription plans', () => {
    expect(PLAN_LIMITS.pro.reposPerMonth).toBe(30);
    expect(PLAN_LIMITS.team.reposPerMonth).toBe(100);
  });

  it('should have team seats for team plan', () => {
    expect(PLAN_LIMITS.team.seats).toBe(5);
  });
});

describe('Price Details', () => {
  it('should have correct price for Single Repo', () => {
    expect(PRICE_DETAILS.single.price).toBe(99);
    expect(PRICE_DETAILS.single.name).toBe('Single Repo');
    expect(PRICE_DETAILS.single.type).toBe('one-time');
  });

  it('should have correct price for Pro', () => {
    expect(PRICE_DETAILS.pro.price).toBe(149);
    expect(PRICE_DETAILS.pro.name).toBe('Pro');
    expect(PRICE_DETAILS.pro.type).toBe('monthly');
  });

  it('should have correct price for Team', () => {
    expect(PRICE_DETAILS.team.price).toBe(399);
    expect(PRICE_DETAILS.team.name).toBe('Team');
    expect(PRICE_DETAILS.team.type).toBe('monthly');
  });

  it('should have features for each tier', () => {
    expect(PRICE_DETAILS.single.features.length).toBeGreaterThan(0);
    expect(PRICE_DETAILS.pro.features.length).toBeGreaterThan(0);
    expect(PRICE_DETAILS.team.features.length).toBeGreaterThan(0);
  });
});
