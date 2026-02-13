import { Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { wagmiConfig, queryClient } from './wagmi';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AgentProfile } from './components/AgentProfile';
import { HowToPlay } from './components/HowToPlay';
import { BountyMarketplace } from './components/bounties/BountyMarketplace';
import { BountyDetail } from './components/bounties/BountyDetail';
import { StatsProvider } from './hooks/useStats';
import { WebSocketProvider } from './hooks/useWebSocketProvider';

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <WebSocketProvider>
            <StatsProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/agents/:address" element={<AgentProfile />} />
                  <Route path="/bounties" element={<BountyMarketplace />} />
                  <Route path="/bounties/:id" element={<BountyDetail />} />
                  <Route path="/how-to-join" element={<HowToPlay />} />
                </Routes>
              </Layout>
            </StatsProvider>
          </WebSocketProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
