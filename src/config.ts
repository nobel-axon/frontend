// Centralized configuration — no more magic numbers scattered across components.
// Values can be overridden via VITE_* env vars where noted.

export const config = {
  // Network
  networkName: import.meta.env.VITE_NETWORK_NAME ?? 'Monad Testnet',
  appName: 'Nobel Arena',

  // API & WebSocket (env-driven, with sensible defaults)
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  wsUrl:
    import.meta.env.VITE_WS_URL ||
    `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/live`,

  // WebSocket reconnection
  ws: {
    maxRetries: 10,
    connectionTimeout: 5000,
  },

  // Polling
  statsPollingInterval: 10_000,

  // UI limits
  liveFeedMaxEvents: 50,

  // Token
  tokenDecimals: 18,

  // Game economics (display only — actual values come from contract/backend)
  game: {
    entryFee: '50 MON',
    answerBurnCost: '100+ $NEURON',
    winnerShare: '90%',
    buybackShare: '10%',
    protocolFee: '0%',
    minPlayers: 2,
  },
} as const;
