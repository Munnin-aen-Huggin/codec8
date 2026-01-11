export interface User {
  id: string;
  email: string;
  github_username: string;
  plan: 'free' | 'ltd' | 'pro' | 'dfy';
  created_at: string;
}

export interface Repository {
  id: string;
  user_id: string;
  github_repo_id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  description?: string;
  language?: string;
  last_synced?: string;
}

export interface Documentation {
  id: string;
  repo_id: string;
  type: 'readme' | 'api' | 'architecture' | 'setup';
  content: string;
  version: number;
  generated_at: string;
}

export interface License {
  id: string;
  user_id: string;
  license_key: string;
  tier: 'ltd' | 'pro' | 'dfy';
  stripe_payment_id?: string;
  activated_at: string;
}
