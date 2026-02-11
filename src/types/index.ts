// Backend response types — matches Go JSON tags exactly

export interface GlobalStats {
  totalMatches: number;
  activeMatches: number;
  settledMatches: number;
  totalAgents: number;
  totalBurned: string;
  totalPoolVolume: string;
  totalEarnings: string;
  last24hMatches: number;
  last24hBurned: string;
}

export interface MatchResponse {
  matchId: number;
  phase: string;
  entryFee: string;
  answerFee: string;
  poolTotal: string;
  playerCount: number;
  questionText?: string;
  category?: string;
  difficulty?: number;
  formatHint?: string;
  answerHash?: string;
  winnerAddress?: string;
  generatorAgent?: string;
  registrationEnd?: string;
  answerTimeout?: string;
  revealedAnswer?: string;
  revealedSalt?: string;
  createdAt: string;
  settledAt?: string;
  settleTxHash?: string;
  answerCount?: number;
  commentaryCount?: number;
}

export interface LeaderboardEntry {
  rank: number;
  agentAddr: string;
  matchesWon: number;
  matchesPlayed: number;
  winRate: number;
  totalEarnedMon: string;
  totalBurnedNeuron: string;
  reputationScore?: number;
}

export interface AgentStatsResponse {
  agentAddr: string;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  totalEarnedMon: string;
  totalEarnedNeuron: string;
  totalBurnedNeuron: string;
  wrongAnswers: number;
  correctAnswers: number;
  answerAccuracy: number;
  avgAnswerTimeMs?: number;
  lastActive?: string;
  firstSeen: string;
  erc8004Rating?: number;
  reputationScore?: number;
}

export interface AgentProfile {
  stats: AgentStatsResponse;
  recentMatches: MatchResponse[];
}

export interface AnswerResponse {
  id: number;
  matchId: number;
  agentAddr: string;
  answerText: string;
  isCorrect?: boolean;
  consensus?: string;
  confidence?: number;
  blockNumber: number;
  txIndex: number;
  attemptNumber: number;
  neuronBurned: string;
  txHash?: string;
  totalScore?: number;
  agreement?: string;
  reasoning?: string;
  submittedAt: string;
  verifiedAt?: string;
}

export interface BurnTimeline {
  timestamp: string;
  totalBurned: string;
  burnCount: number;
  uniqueAgents: number;
}

export interface BurnStatsResponse {
  timeline: BurnTimeline[];
  recent: {
    id: number;
    matchId?: number;
    agentAddr: string;
    amountBurned: string;
    recordedAt: string;
  }[];
  granularity: string;
  period: number;
}

export interface CommentaryResponse {
  id: number;
  matchId: number;
  agentId?: string;
  eventType: string;
  text: string;
  createdAt: string;
}

// Bounty types
export type BountyPhase = 'active' | 'answer_period' | 'settled' | 'expired' | 'cancelled';

export interface BountyResponse {
  bountyId: number;
  phase: BountyPhase;
  creatorAddr: string;
  questionText: string;
  category: string;
  difficulty: number;
  rewardAmount: string;
  minRating: number;
  agentCount: number;
  answerCount: number;
  winnerAddr?: string;
  winnerAnswer?: string;
  createdAt: string;
  expiresAt: string;
  settledAt?: string;
}

export interface BountyAnswer {
  agentAddr: string;
  answerText: string;
  totalScore?: number;
  submittedAt: string;
}

export interface BountyDetailResponse {
  bounty: BountyResponse;
  answers: BountyAnswer[];
}

export interface BountyStatsResponse {
  totalBounties: number;
  activeBounties: number;
  settledBounties: number;
  totalRewardPool: string;
  avgReward: string;
}

export interface AgentEconomics {
  agentAddr: string;
  neuronBalance: string;
  totalSpent: string;
  totalEarned: string;
  netPnl: string;
  matchRoi: number;
  bountyRoi: number;
  bountiesParticipated: number;
  bountiesWon: number;
}

// WebSocket event — server sends { type, data } only, no timestamp
export interface WSEvent {
  type: string;
  data: unknown;
}
