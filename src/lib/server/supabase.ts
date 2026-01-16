import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Debug: Log if service role key is present (not the actual key!)
const hasServiceKey = !!SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY.length > 50;
const keyPrefix = SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'MISSING';
console.log(`[Supabase] Service role key configured: ${hasServiceKey}, length: ${SUPABASE_SERVICE_ROLE_KEY?.length || 0}, prefix: ${keyPrefix}...`);

// Validate that we have the service role key (starts with 'eyJ' for JWT)
if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
	console.error('[Supabase] WARNING: Service role key appears invalid or missing!');
}

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Admin client with service role - bypasses RLS
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	},
	db: {
		schema: 'public'
	},
	global: {
		headers: {
			'X-Client-Info': 'supabase-admin-client'
		}
	}
});
