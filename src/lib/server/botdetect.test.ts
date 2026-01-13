import { describe, it, expect } from 'vitest';
import { isSuspiciousUA, getClientIP } from './botdetect';

describe('isSuspiciousUA', () => {
	describe('empty/null user agents', () => {
		it('should return true for null user agent', () => {
			expect(isSuspiciousUA(null)).toBe(true);
		});

		it('should return true for empty string', () => {
			expect(isSuspiciousUA('')).toBe(true);
		});

		it('should return true for whitespace-only string', () => {
			expect(isSuspiciousUA('   ')).toBe(true);
		});
	});

	describe('known bot patterns', () => {
		it('should detect curl', () => {
			expect(isSuspiciousUA('curl/7.68.0')).toBe(true);
		});

		it('should detect wget', () => {
			expect(isSuspiciousUA('Wget/1.21')).toBe(true);
		});

		it('should detect python-requests', () => {
			expect(isSuspiciousUA('python-requests/2.28.0')).toBe(true);
		});

		it('should detect scrapy', () => {
			expect(isSuspiciousUA('Scrapy/2.5.0')).toBe(true);
		});

		it('should detect puppeteer', () => {
			expect(isSuspiciousUA('Mozilla/5.0 puppeteer')).toBe(true);
		});

		it('should detect playwright', () => {
			expect(isSuspiciousUA('Mozilla/5.0 playwright')).toBe(true);
		});

		it('should detect selenium', () => {
			expect(isSuspiciousUA('Mozilla/5.0 selenium')).toBe(true);
		});

		it('should detect axios', () => {
			expect(isSuspiciousUA('axios/0.21.1')).toBe(true);
		});

		it('should detect postman', () => {
			expect(isSuspiciousUA('PostmanRuntime/7.29.0')).toBe(true);
		});

		it('should detect node-fetch', () => {
			expect(isSuspiciousUA('node-fetch/1.0')).toBe(true);
		});

		it('should detect python-urllib', () => {
			expect(isSuspiciousUA('Python-urllib/3.9')).toBe(true);
		});

		it('should detect java http client', () => {
			expect(isSuspiciousUA('Java/11.0.11')).toBe(true);
		});

		it('should detect headless browsers', () => {
			expect(isSuspiciousUA('Mozilla/5.0 HeadlessChrome/91.0')).toBe(true);
		});
	});

	describe('case insensitivity', () => {
		it('should detect CURL (uppercase)', () => {
			expect(isSuspiciousUA('CURL/7.68.0')).toBe(true);
		});

		it('should detect Wget (mixed case)', () => {
			expect(isSuspiciousUA('WGeT/1.21')).toBe(true);
		});

		it('should detect PYTHON-REQUESTS (uppercase)', () => {
			expect(isSuspiciousUA('PYTHON-REQUESTS/2.28')).toBe(true);
		});
	});

	describe('legitimate browser user agents', () => {
		it('should allow Chrome', () => {
			expect(
				isSuspiciousUA(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				)
			).toBe(false);
		});

		it('should allow Firefox', () => {
			expect(
				isSuspiciousUA(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
				)
			).toBe(false);
		});

		it('should allow Safari', () => {
			expect(
				isSuspiciousUA(
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
				)
			).toBe(false);
		});

		it('should allow Edge', () => {
			expect(
				isSuspiciousUA(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
				)
			).toBe(false);
		});

		it('should allow mobile Chrome', () => {
			expect(
				isSuspiciousUA(
					'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
				)
			).toBe(false);
		});

		it('should allow mobile Safari', () => {
			expect(
				isSuspiciousUA(
					'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
				)
			).toBe(false);
		});
	});
});

describe('getClientIP', () => {
	// Helper to create mock Request objects
	function createMockRequest(headers: Record<string, string>): Request {
		return {
			headers: {
				get: (name: string) => headers[name.toLowerCase()] || null
			}
		} as unknown as Request;
	}

	describe('x-forwarded-for header', () => {
		it('should extract single IP from x-forwarded-for', () => {
			const request = createMockRequest({
				'x-forwarded-for': '192.168.1.1'
			});
			expect(getClientIP(request)).toBe('192.168.1.1');
		});

		it('should extract first IP from multiple IPs in x-forwarded-for', () => {
			const request = createMockRequest({
				'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1'
			});
			expect(getClientIP(request)).toBe('192.168.1.1');
		});

		it('should trim whitespace from x-forwarded-for', () => {
			const request = createMockRequest({
				'x-forwarded-for': '  192.168.1.1  '
			});
			expect(getClientIP(request)).toBe('192.168.1.1');
		});
	});

	describe('fallback headers', () => {
		it('should fall back to x-real-ip when no x-forwarded-for', () => {
			const request = createMockRequest({
				'x-real-ip': '10.0.0.1'
			});
			expect(getClientIP(request)).toBe('10.0.0.1');
		});

		it('should fall back to cf-connecting-ip when no x-real-ip', () => {
			const request = createMockRequest({
				'cf-connecting-ip': '172.16.0.1'
			});
			expect(getClientIP(request)).toBe('172.16.0.1');
		});

		it('should fall back to true-client-ip as last resort', () => {
			const request = createMockRequest({
				'true-client-ip': '203.0.113.1'
			});
			expect(getClientIP(request)).toBe('203.0.113.1');
		});
	});

	describe('header priority', () => {
		it('should prefer x-forwarded-for over x-real-ip', () => {
			const request = createMockRequest({
				'x-forwarded-for': '192.168.1.1',
				'x-real-ip': '10.0.0.1'
			});
			expect(getClientIP(request)).toBe('192.168.1.1');
		});

		it('should prefer x-real-ip over cf-connecting-ip', () => {
			const request = createMockRequest({
				'x-real-ip': '10.0.0.1',
				'cf-connecting-ip': '172.16.0.1'
			});
			expect(getClientIP(request)).toBe('10.0.0.1');
		});
	});

	describe('no headers present', () => {
		it('should return 0.0.0.0 when no IP headers', () => {
			const request = createMockRequest({});
			expect(getClientIP(request)).toBe('0.0.0.0');
		});

		it('should return 0.0.0.0 for empty x-forwarded-for', () => {
			const request = createMockRequest({
				'x-forwarded-for': ''
			});
			expect(getClientIP(request)).toBe('0.0.0.0');
		});
	});

	describe('whitespace handling', () => {
		it('should trim whitespace from x-real-ip', () => {
			const request = createMockRequest({
				'x-real-ip': '  10.0.0.1  '
			});
			expect(getClientIP(request)).toBe('10.0.0.1');
		});

		it('should trim whitespace from cf-connecting-ip', () => {
			const request = createMockRequest({
				'cf-connecting-ip': '  172.16.0.1  '
			});
			expect(getClientIP(request)).toBe('172.16.0.1');
		});

		it('should trim whitespace from true-client-ip', () => {
			const request = createMockRequest({
				'true-client-ip': '  203.0.113.1  '
			});
			expect(getClientIP(request)).toBe('203.0.113.1');
		});
	});
});
