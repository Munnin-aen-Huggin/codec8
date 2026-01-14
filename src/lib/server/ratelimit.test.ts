import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hashIP, hashFingerprint, isBlocked, checkDemoLimit, incrementDemoUsage, blockClient } from './ratelimit';

// Mock supabaseAdmin
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOr = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();
const mockUpsert = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('./supabase', () => ({
	supabaseAdmin: {
		from: (...args: unknown[]) => {
			mockFrom(...args);
			return {
				select: (...selectArgs: unknown[]) => {
					mockSelect(...selectArgs);
					return {
						eq: (...eqArgs: unknown[]) => {
							mockEq(...eqArgs);
							return {
								eq: (...eq2Args: unknown[]) => {
									mockEq(...eq2Args);
									return {
										single: () => mockSingle()
									};
								},
								or: (...orArgs: unknown[]) => {
									mockOr(...orArgs);
									return {
										limit: (...limitArgs: unknown[]) => {
											mockLimit(...limitArgs);
											return mockSingle();
										}
									};
								},
								single: () => mockSingle()
							};
						}
					};
				},
				upsert: (...upsertArgs: unknown[]) => {
					mockUpsert(...upsertArgs);
					return mockSingle();
				},
				insert: (...insertArgs: unknown[]) => {
					mockInsert(...insertArgs);
					return mockSingle();
				},
				update: (...updateArgs: unknown[]) => {
					mockUpdate(...updateArgs);
					return {
						eq: (...eqArgs: unknown[]) => {
							mockEq(...eqArgs);
							return {
								eq: (...eq2Args: unknown[]) => {
									mockEq(...eq2Args);
									return mockSingle();
								}
							};
						}
					};
				}
			};
		}
	}
}));

describe('hashIP', () => {
	it('should return consistent hash for same IP', () => {
		const ip = '192.168.1.1';
		const hash1 = hashIP(ip);
		const hash2 = hashIP(ip);
		expect(hash1).toBe(hash2);
	});

	it('should return different hashes for different IPs', () => {
		const hash1 = hashIP('192.168.1.1');
		const hash2 = hashIP('192.168.1.2');
		expect(hash1).not.toBe(hash2);
	});

	it('should return 64-character hex string (SHA256)', () => {
		const hash = hashIP('192.168.1.1');
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	it('should handle IPv4 addresses', () => {
		const hash = hashIP('10.0.0.1');
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	it('should handle IPv6 addresses', () => {
		const hash = hashIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	it('should handle localhost', () => {
		const hash = hashIP('127.0.0.1');
		expect(hash).toHaveLength(64);
	});

	it('should handle empty string', () => {
		const hash = hashIP('');
		expect(hash).toHaveLength(64);
	});
});

describe('hashFingerprint', () => {
	it('should return consistent hash for same fingerprint', () => {
		const fp = 'abc123def456';
		const hash1 = hashFingerprint(fp);
		const hash2 = hashFingerprint(fp);
		expect(hash1).toBe(hash2);
	});

	it('should return 64-character hex string', () => {
		const hash = hashFingerprint('browser-fingerprint-123');
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[a-f0-9]{64}$/);
	});

	it('should produce different hashes for different fingerprints', () => {
		const hash1 = hashFingerprint('fingerprint-a');
		const hash2 = hashFingerprint('fingerprint-b');
		expect(hash1).not.toBe(hash2);
	});

	it('should handle long fingerprints', () => {
		const longFp = 'x'.repeat(1000);
		const hash = hashFingerprint(longFp);
		expect(hash).toHaveLength(64);
	});

	it('should handle special characters', () => {
		const hash = hashFingerprint('fp-with-special-!@#$%^&*()');
		expect(hash).toHaveLength(64);
	});
});

describe('isBlocked', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true when IP is in blocked_clients', async () => {
		mockSingle.mockResolvedValueOnce({ data: [{ id: '123' }], error: null });

		const result = await isBlocked('hashed-ip');
		expect(result).toBe(true);
		expect(mockFrom).toHaveBeenCalledWith('blocked_clients');
	});

	it('should return true when fingerprint is blocked', async () => {
		// First call for IP - not blocked
		mockSingle.mockResolvedValueOnce({ data: [], error: null });
		// Second call for fingerprint - blocked
		mockSingle.mockResolvedValueOnce({ data: [{ id: '456' }], error: null });

		const result = await isBlocked('hashed-ip', 'hashed-fingerprint');
		expect(result).toBe(true);
	});

	it('should return false when neither blocked', async () => {
		mockSingle.mockResolvedValueOnce({ data: [], error: null });
		mockSingle.mockResolvedValueOnce({ data: [], error: null });

		const result = await isBlocked('hashed-ip', 'hashed-fingerprint');
		expect(result).toBe(false);
	});

	it('should return false when IP not blocked and no fingerprint provided', async () => {
		mockSingle.mockResolvedValueOnce({ data: [], error: null });

		const result = await isBlocked('hashed-ip');
		expect(result).toBe(false);
	});

	it('should return false when data is null', async () => {
		mockSingle.mockResolvedValueOnce({ data: null, error: null });

		const result = await isBlocked('hashed-ip');
		expect(result).toBe(false);
	});
});

describe('checkDemoLimit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return allowed: true, remaining: 1 for new IP (no rows)', async () => {
		mockSingle.mockResolvedValueOnce({
			data: null,
			error: { code: 'PGRST116', message: 'No rows found' }
		});

		const result = await checkDemoLimit('new-ip-hash');
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
	});

	it('should return allowed: true, remaining: 1 when usage_count is 0', async () => {
		mockSingle.mockResolvedValueOnce({
			data: { usage_count: 0 },
			error: null
		});

		const result = await checkDemoLimit('some-ip-hash');
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
	});

	it('should return allowed: false, remaining: 0 when limit reached', async () => {
		mockSingle.mockResolvedValueOnce({
			data: { usage_count: 1 },
			error: null
		});

		const result = await checkDemoLimit('used-ip-hash');
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it('should return allowed: false when usage exceeds limit', async () => {
		mockSingle.mockResolvedValueOnce({
			data: { usage_count: 5 },
			error: null
		});

		const result = await checkDemoLimit('abused-ip-hash');
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it('should return allowed: true on database error (fail-open)', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockSingle.mockResolvedValueOnce({
			data: null,
			error: { code: 'SOME_ERROR', message: 'DB Error' }
		});

		const result = await checkDemoLimit('some-ip');
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
		expect(consoleError).toHaveBeenCalled();

		consoleError.mockRestore();
	});

	it('should call supabase with correct table and date', async () => {
		mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

		await checkDemoLimit('test-ip');

		expect(mockFrom).toHaveBeenCalledWith('demo_usage');
		expect(mockSelect).toHaveBeenCalledWith('usage_count');
	});
});

describe('incrementDemoUsage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call upsert with correct data', async () => {
		mockSingle.mockResolvedValueOnce({ error: null });

		await incrementDemoUsage('ip-hash', {
			repoUrl: 'https://github.com/user/repo',
			userAgent: 'Mozilla/5.0'
		});

		expect(mockFrom).toHaveBeenCalledWith('demo_usage');
		expect(mockUpsert).toHaveBeenCalled();

		const upsertCall = mockUpsert.mock.calls[0][0];
		expect(upsertCall.ip_hash).toBe('ip-hash');
		expect(upsertCall.last_repo_url).toBe('https://github.com/user/repo');
		expect(upsertCall.user_agent).toBe('Mozilla/5.0');
	});

	it('should include fingerprint when provided', async () => {
		mockSingle.mockResolvedValueOnce({ error: null });

		await incrementDemoUsage('ip-hash', {
			repoUrl: 'https://github.com/user/repo',
			userAgent: 'Mozilla/5.0',
			fingerprint: 'fp-123'
		});

		const upsertCall = mockUpsert.mock.calls[0][0];
		expect(upsertCall.fingerprint).toBe('fp-123');
	});

	it('should include isSuspicious flag when provided', async () => {
		mockSingle.mockResolvedValueOnce({ error: null });

		await incrementDemoUsage('ip-hash', {
			repoUrl: 'https://github.com/user/repo',
			userAgent: 'curl/7.68.0',
			isSuspicious: true
		});

		const upsertCall = mockUpsert.mock.calls[0][0];
		expect(upsertCall.is_suspicious).toBe(true);
	});

	it('should try update when upsert fails', async () => {
		mockSingle.mockResolvedValueOnce({ error: { message: 'Upsert failed' } });
		mockSingle.mockResolvedValueOnce({ error: null });

		await incrementDemoUsage('ip-hash', {
			repoUrl: 'https://github.com/user/repo',
			userAgent: 'Mozilla/5.0'
		});

		expect(mockUpsert).toHaveBeenCalled();
		expect(mockUpdate).toHaveBeenCalled();
	});

	it('should log error when both upsert and update fail', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockSingle.mockResolvedValueOnce({ error: { message: 'Upsert failed' } });
		mockSingle.mockResolvedValueOnce({ error: { message: 'Update failed' } });

		await incrementDemoUsage('ip-hash', {
			repoUrl: 'https://github.com/user/repo',
			userAgent: 'Mozilla/5.0'
		});

		expect(consoleError).toHaveBeenCalledWith('Error incrementing demo usage:', expect.any(Object));

		consoleError.mockRestore();
	});
});

describe('blockClient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should insert blocked client with reason', async () => {
		mockSingle.mockResolvedValueOnce({ error: null });

		await blockClient('ip-hash', 'Abuse detected');

		expect(mockFrom).toHaveBeenCalledWith('blocked_clients');
		expect(mockInsert).toHaveBeenCalled();

		const insertCall = mockInsert.mock.calls[0][0];
		expect(insertCall.ip_hash).toBe('ip-hash');
		expect(insertCall.reason).toBe('Abuse detected');
	});

	it('should set expires_at when duration provided', async () => {
		mockSingle.mockResolvedValueOnce({ error: null });

		await blockClient('ip-hash', 'Temporary block', 24);

		const insertCall = mockInsert.mock.calls[0][0];
		expect(insertCall.expires_at).not.toBeNull();
	});

	it('should set expires_at to null for permanent block', async () => {
		mockSingle.mockResolvedValueOnce({ error: null });

		await blockClient('ip-hash', 'Permanent ban');

		const insertCall = mockInsert.mock.calls[0][0];
		expect(insertCall.expires_at).toBeNull();
	});

	it('should throw error when insert fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockSingle.mockResolvedValueOnce({ error: { message: 'Insert failed' } });

		await expect(blockClient('ip-hash', 'Test')).rejects.toThrow('Failed to block client');

		consoleError.mockRestore();
	});
});
