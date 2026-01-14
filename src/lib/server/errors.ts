import { json, error } from '@sveltejs/kit';

/**
 * Standard error codes for API responses
 */
export const ErrorCodes = {
	// Authentication errors
	AUTH_REQUIRED: 'AUTH_REQUIRED',
	INVALID_SESSION: 'INVALID_SESSION',
	SESSION_EXPIRED: 'SESSION_EXPIRED',

	// Authorization errors
	FORBIDDEN: 'FORBIDDEN',
	LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
	TRIAL_EXPIRED: 'TRIAL_EXPIRED',
	SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
	SUBSCRIPTION_ENDED: 'SUBSCRIPTION_ENDED',

	// Resource errors
	NOT_FOUND: 'NOT_FOUND',
	ALREADY_EXISTS: 'ALREADY_EXISTS',

	// Validation errors
	INVALID_INPUT: 'INVALID_INPUT',
	MISSING_FIELD: 'MISSING_FIELD',

	// External service errors
	GITHUB_ERROR: 'GITHUB_ERROR',
	STRIPE_ERROR: 'STRIPE_ERROR',
	AI_ERROR: 'AI_ERROR',

	// Generic errors
	INTERNAL_ERROR: 'INTERNAL_ERROR',
	RATE_LIMITED: 'RATE_LIMITED'
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * User-friendly error messages for each error code
 */
const errorMessages: Record<ErrorCode, string> = {
	[ErrorCodes.AUTH_REQUIRED]: 'Please sign in to continue.',
	[ErrorCodes.INVALID_SESSION]: 'Your session is invalid. Please sign in again.',
	[ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
	[ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
	[ErrorCodes.LIMIT_EXCEEDED]: 'You have reached your usage limit for this period.',
	[ErrorCodes.TRIAL_EXPIRED]: 'Your trial has expired. Please subscribe to continue.',
	[ErrorCodes.SUBSCRIPTION_REQUIRED]: 'A subscription is required to access this feature.',
	[ErrorCodes.SUBSCRIPTION_ENDED]: 'Your subscription has ended. Please renew to continue.',
	[ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
	[ErrorCodes.ALREADY_EXISTS]: 'This resource already exists.',
	[ErrorCodes.INVALID_INPUT]: 'The provided input is invalid.',
	[ErrorCodes.MISSING_FIELD]: 'Required fields are missing.',
	[ErrorCodes.GITHUB_ERROR]: 'Failed to communicate with GitHub. Please try again.',
	[ErrorCodes.STRIPE_ERROR]: 'Payment processing failed. Please try again.',
	[ErrorCodes.AI_ERROR]: 'Documentation generation failed. Please try again.',
	[ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again.',
	[ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.'
};

/**
 * HTTP status codes for each error code
 */
const errorStatusCodes: Record<ErrorCode, number> = {
	[ErrorCodes.AUTH_REQUIRED]: 401,
	[ErrorCodes.INVALID_SESSION]: 401,
	[ErrorCodes.SESSION_EXPIRED]: 401,
	[ErrorCodes.FORBIDDEN]: 403,
	[ErrorCodes.LIMIT_EXCEEDED]: 403,
	[ErrorCodes.TRIAL_EXPIRED]: 403,
	[ErrorCodes.SUBSCRIPTION_REQUIRED]: 403,
	[ErrorCodes.SUBSCRIPTION_ENDED]: 403,
	[ErrorCodes.NOT_FOUND]: 404,
	[ErrorCodes.ALREADY_EXISTS]: 409,
	[ErrorCodes.INVALID_INPUT]: 400,
	[ErrorCodes.MISSING_FIELD]: 400,
	[ErrorCodes.GITHUB_ERROR]: 502,
	[ErrorCodes.STRIPE_ERROR]: 502,
	[ErrorCodes.AI_ERROR]: 502,
	[ErrorCodes.INTERNAL_ERROR]: 500,
	[ErrorCodes.RATE_LIMITED]: 429
};

interface ApiErrorOptions {
	code: ErrorCode;
	message?: string;
	details?: Record<string, unknown>;
}

/**
 * Creates a standardized JSON error response for API endpoints
 */
export function createErrorResponse({ code, message, details }: ApiErrorOptions) {
	const status = errorStatusCodes[code];
	const userMessage = message || errorMessages[code];

	return json(
		{
			success: false,
			error: {
				code,
				message: userMessage,
				...(details && { details })
			}
		},
		{ status }
	);
}

/**
 * Throws a SvelteKit error with standardized formatting
 * Use this when you want to throw an HTTP error that SvelteKit handles
 */
export function throwApiError({ code, message, details }: ApiErrorOptions): never {
	const status = errorStatusCodes[code];
	const userMessage = message || errorMessages[code];

	throw error(status, {
		code,
		message: userMessage,
		...(details && { details })
	} as App.Error);
}

/**
 * Logs an error with context for debugging
 */
export function logError(
	context: string,
	err: unknown,
	metadata?: Record<string, unknown>
): void {
	const errorInfo = {
		context,
		timestamp: new Date().toISOString(),
		...(err instanceof Error && {
			name: err.name,
			message: err.message,
			stack: err.stack
		}),
		...(metadata && { metadata })
	};

	console.error('[API Error]', JSON.stringify(errorInfo, null, 2));
}

/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(err: unknown): string {
	if (err instanceof Error) {
		return err.message;
	}
	if (typeof err === 'string') {
		return err;
	}
	return 'An unknown error occurred';
}
