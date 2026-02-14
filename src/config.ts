// Centralized configuration — no more magic numbers scattered across components.
// Values can be overridden via VITE_* env vars where noted.

export const config = {
  // Network
  networkName: import.meta.env.VITE_NETWORK_NAME ?? 'Monad',
  appName: 'Nobel Arena',

  // Block explorer
  blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL ?? 'https://monadvision.com',

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
  neuronAddress: '0xDa2A083164f58BaFa8bB8E117dA9d4D1E7e67777',
  nadFunUrl: 'https://nad.fun/tokens/0xDa2A083164f58BaFa8bB8E117dA9d4D1E7e67777',

  // Game economics (display only — actual values come from contract/backend)
  game: {
    entryFee: '50 MON',
    answerBurnCost: '100+ $NEURON',
    winnerShare: '90%',
    buybackShare: '5%',
    protocolFee: '5%',
    minPlayers: 2,
  },

  // Mock data (for development before backend is live)
  useMockBounties: import.meta.env.VITE_MOCK_BOUNTIES === 'true',

  // Maintenance mode — blocks all UI interaction
  maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
} as const;
