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

// WebSocket event — server sends { type, data } only, no timestamp
export interface WSEvent {
  type: string;
  data: unknown;
}
