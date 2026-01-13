/**
 * Bot detection utility for protecting the demo endpoint
 */

/**
 * Regex patterns for common bots and automation tools
 */
const BOT_PATTERNS = [
	/curl/i,
	/wget/i,
	/python-requests/i,
	/python-urllib/i,
	/scrapy/i,
	/httpclient/i,
	/java\//i,
	/libwww/i,
	/lwp-/i,
	/perl/i,
	/ruby/i,
	/mechanize/i,
	/phantom/i,
	/headless/i,
	/puppeteer/i,
	/playwright/i,
	/selenium/i,
	/axios/i,
	/node-fetch/i,
	/got\//i,
	/undici/i,
	/httpie/i,
	/postman/i,
	/insomnia/i
];

/**
 * Check if a user agent string looks suspicious (bot-like)
 */
export function isSuspiciousUA(userAgent: string | null): boolean {
	// Empty or missing user agent is suspicious
	if (!userAgent || userAgent.trim() === '') {
		return true;
	}

	// Check against known bot patterns
	for (const pattern of BOT_PATTERNS) {
		if (pattern.test(userAgent)) {
			return true;
		}
	}

	return false;
}

/**
 * Extract client IP from request headers
 * Checks various proxy headers in order of priority
 */
export function getClientIP(request: Request): string {
	// Check x-forwarded-for (most common proxy header)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
		// The first one is the original client
		const firstIP = forwardedFor.split(',')[0].trim();
		if (firstIP) {
			return firstIP;
		}
	}

	// Check x-real-ip (nginx)
	const realIP = request.headers.get('x-real-ip');
	if (realIP) {
		return realIP.trim();
	}

	// Check cf-connecting-ip (Cloudflare)
	const cfConnectingIP = request.headers.get('cf-connecting-ip');
	if (cfConnectingIP) {
		return cfConnectingIP.trim();
	}

	// Check true-client-ip (Akamai, Cloudflare Enterprise)
	const trueClientIP = request.headers.get('true-client-ip');
	if (trueClientIP) {
		return trueClientIP.trim();
	}

	// Fallback to 0.0.0.0 if no IP found
	return '0.0.0.0';
}
