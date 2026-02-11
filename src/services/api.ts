import type {
  GlobalStats,
  LeaderboardEntry,
  MatchResponse,
  AnswerResponse,
  CommentaryResponse,
  BurnStatsResponse,
  AgentProfile,
  BountyResponse,
  BountyDetailResponse,
  BountyStatsResponse,
  AgentEconomics,
} from '../types';

import { config } from '../config';

const BASE = config.apiUrl;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function fetchStats(): Promise<GlobalStats> {
  return get<GlobalStats>('/api/stats');
}

export function fetchLeaderboard(
  limit = 50,
  sortBy = 'earnings',
): Promise<{ leaderboard: LeaderboardEntry[]; sortBy: string; limit: number; offset: number }> {
  return get(`/api/leaderboard?sortBy=${sortBy}&limit=${limit}`);
}

export function fetchLeaderboardPage(
  offset: number,
  limit: number,
  sortBy = 'earnings',
): Promise<{ leaderboard: LeaderboardEntry[]; sortBy: string; limit: number; offset: number }> {
  return get(`/api/leaderboard?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
}

export function fetchRecentMatches(
  limit = 20,
): Promise<{ matches: MatchResponse[]; total: number; limit: number; offset: number }> {
  return get(`/api/matches?phase=settled&limit=${limit}`);
}

export function fetchRecentMatchesPage(
  offset: number,
  limit: number,
): Promise<{ matches: MatchResponse[]; total: number; limit: number; offset: number }> {
  return get(`/api/matches?phase=settled&limit=${limit}&offset=${offset}`);
}

export function fetchBurnStats(): Promise<BurnStatsResponse> {
  return get<BurnStatsResponse>('/api/stats/burns');
}

export function fetchAgentProfile(address: string): Promise<AgentProfile> {
  return get<AgentProfile>(`/api/agent/${address}`);
}

export function fetchMatchAnswers(
  matchId: number,
): Promise<{ answers: AnswerResponse[] }> {
  return get(`/api/matches/${matchId}/answers`);
}

export function fetchMatchCommentary(
  matchId: number,
): Promise<{ commentary: CommentaryResponse[] }> {
  return get(`/api/matches/${matchId}/commentary`);
}

export function fetchAgentHistory(
  address: string,
  limit = 50,
): Promise<{ matches: MatchResponse[]; total: number; limit: number; offset: number }> {
  return get(`/api/agent/${address}/history?limit=${limit}`);
}

// Bounty endpoints

export function fetchBounties(
  filters: { phase?: string; category?: string; limit?: number; offset?: number } = {},
): Promise<{ bounties: BountyResponse[]; total: number; limit: number; offset: number }> {
  const params = new URLSearchParams();
  if (filters.phase) params.set('phase', filters.phase);
  if (filters.category) params.set('category', filters.category);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return get(`/api/bounties${qs ? `?${qs}` : ''}`);
}

export function fetchBountyDetail(bountyId: number): Promise<BountyDetailResponse> {
  return get<BountyDetailResponse>(`/api/bounties/${bountyId}`);
}

export function fetchBountyStats(): Promise<BountyStatsResponse> {
  return get<BountyStatsResponse>('/api/bounties/stats');
}

export function fetchAgentEconomics(address: string): Promise<AgentEconomics> {
  return get<AgentEconomics>(`/api/agent/${address}/economics`);
}
