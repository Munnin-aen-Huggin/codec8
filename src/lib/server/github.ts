import type { Repository } from '$lib/types';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  language: string | null;
  default_branch: string;
  html_url: string;
  updated_at: string;
  stargazers_count: number;
}

export interface GitHubRepoContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

const GITHUB_API_URL = 'https://api.github.com';

async function githubFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CodeDoc-AI',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const pageRepos = await githubFetch<GitHubRepo[]>(
      `/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator`,
      token
    );

    repos.push(...pageRepos);

    if (pageRepos.length < perPage) break;
    page++;
  }

  return repos;
}

export async function fetchRepoContents(
  token: string,
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubRepoContent[]> {
  return githubFetch<GitHubRepoContent[]>(
    `/repos/${owner}/${repo}/contents/${path}`,
    token
  );
}

export async function fetchFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const content = await githubFetch<GitHubRepoContent>(
    `/repos/${owner}/${repo}/contents/${path}`,
    token
  );

  if (content.content && content.encoding === 'base64') {
    return Buffer.from(content.content, 'base64').toString('utf-8');
  }

  throw new Error('Unable to decode file content');
}

export async function fetchRepoTree(
  token: string,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<{ path: string; type: string }[]> {
  const response = await githubFetch<{
    tree: { path: string; type: string }[];
  }>(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, token);

  return response.tree;
}

export function githubRepoToRepository(
  githubRepo: GitHubRepo,
  userId: string
): Omit<Repository, 'id' | 'last_synced'> {
  return {
    user_id: userId,
    github_repo_id: githubRepo.id,
    name: githubRepo.name,
    full_name: githubRepo.full_name,
    private: githubRepo.private,
    default_branch: githubRepo.default_branch,
    description: githubRepo.description || undefined,
    language: githubRepo.language || undefined
  };
}
