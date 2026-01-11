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
    expect(PLAN_LIMITS.free.docs_per_month).toBe(3);
  });

  it('should have unlimited repos for paid plans', () => {
    expect(PLAN_LIMITS.ltd.repos).toBe(-1);
    expect(PLAN_LIMITS.pro.repos).toBe(-1);
    expect(PLAN_LIMITS.dfy.repos).toBe(-1);
  });

  it('should have unlimited docs for paid plans', () => {
    expect(PLAN_LIMITS.ltd.docs_per_month).toBe(-1);
    expect(PLAN_LIMITS.pro.docs_per_month).toBe(-1);
    expect(PLAN_LIMITS.dfy.docs_per_month).toBe(-1);
  });
});

describe('Price Details', () => {
  it('should have correct price for LTD', () => {
    expect(PRICE_DETAILS.ltd.price).toBe(299);
    expect(PRICE_DETAILS.ltd.name).toBe('Lifetime Deal');
  });

  it('should have correct price for Pro', () => {
    expect(PRICE_DETAILS.pro.price).toBe(497);
    expect(PRICE_DETAILS.pro.name).toBe('Pro Setup');
  });

  it('should have correct price for DFY', () => {
    expect(PRICE_DETAILS.dfy.price).toBe(2500);
    expect(PRICE_DETAILS.dfy.name).toBe('Done-For-You');
  });

  it('should have features for each tier', () => {
    expect(PRICE_DETAILS.ltd.features.length).toBeGreaterThan(0);
    expect(PRICE_DETAILS.pro.features.length).toBeGreaterThan(0);
    expect(PRICE_DETAILS.dfy.features.length).toBeGreaterThan(0);
  });
});
