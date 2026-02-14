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
import { mockFetchBounties, mockFetchBountyDetail, mockFetchBountyStats } from './mockBounties';

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
  filters: { phase?: string; category?: string; creator?: string; includeRejected?: boolean; limit?: number; offset?: number } = {},
): Promise<{ bounties: BountyResponse[]; total: number; limit: number; offset: number }> {
  if (config.useMockBounties) return mockFetchBounties(filters);
  const params = new URLSearchParams();
  if (filters.phase) params.set('phase', filters.phase);
  if (filters.category) params.set('category', filters.category);
  if (filters.creator) params.set('creator', filters.creator);
  if (filters.includeRejected) params.set('include_rejected', 'true');
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return get(`/api/bounties${qs ? `?${qs}` : ''}`);
}

export function fetchBountyDetail(bountyId: number): Promise<BountyDetailResponse> {
  if (config.useMockBounties) return mockFetchBountyDetail(bountyId);
  return get<BountyDetailResponse>(`/api/bounties/${bountyId}`);
}

export function fetchBountyStats(): Promise<BountyStatsResponse> {
  if (config.useMockBounties) return mockFetchBountyStats();
  return get<BountyStatsResponse>('/api/bounties/stats');
}

export function fetchAgentEconomics(address: string): Promise<AgentEconomics> {
  return get<AgentEconomics>(`/api/agent/${address}/economics`);
}

export interface CreateBountyPayload {
  questionText: string;
  category: string;
  difficulty: number;
  entryFee: string;
  deadline: string;
  maxParticipants: number;
  minRating: string;
  creatorAddress: string;
}

export async function postBounty(payload: CreateBountyPayload): Promise<{ status: string; bounty: BountyResponse }> {
  const res = await fetch(`${BASE}/api/bounties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}
