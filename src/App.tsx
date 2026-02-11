import { Routes, Route } from 'react-router-dom';
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
  );
}

export default App;
