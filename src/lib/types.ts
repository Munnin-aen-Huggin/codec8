export interface User {
  id: string;
  email: string;
  github_username: string;
  plan: 'free' | 'ltd' | 'pro' | 'dfy';
  created_at?: string;
  default_team_id?: string | null;
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
  team_id?: string | null;
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

// ============================================
// Team Collaboration Types (Phase 11)
// ============================================

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  stripe_subscription_id: string | null;
  max_seats: number;
  max_repos_per_month: number;
  repos_used_this_month: number;
  repos_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  // Joined data from profiles
  profile?: {
    id: string;
    email: string;
    github_username: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface DocTemplate {
  id: string;
  team_id: string;
  doc_type: 'readme' | 'api' | 'architecture' | 'setup';
  name: string;
  prompt_template: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string | null;
  team_id: string | null;
  repo_id: string | null;
  doc_type: string;
  tokens_used: number;
  generation_time_ms: number;
  created_at: string;
}

export interface TeamUsage {
  total_docs: number;
  docs_by_type: Record<string, number>;
  repos_used: number;
  seats_used: number;
}
