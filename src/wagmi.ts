import { createConfig, http } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { QueryClient } from '@tanstack/react-query';

export const monad = defineChain({
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://monadvision.com' },
  },
});

export const wagmiConfig = createConfig({
  chains: [monad],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'Nobel Arena' }),
  ],
  transports: { [monad.id]: http() },
});

export const queryClient = new QueryClient();
