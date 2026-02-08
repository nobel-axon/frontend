import type {
  GlobalStats,
  LeaderboardEntry,
  MatchResponse,
  AnswerResponse,
  CommentaryResponse,
  BurnStatsResponse,
  AgentProfile,
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
