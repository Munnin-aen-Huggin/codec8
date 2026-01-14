import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect to landing page pricing section
  throw redirect(302, '/#pricing');
};
