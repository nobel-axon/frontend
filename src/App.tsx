import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AgentProfile } from './components/AgentProfile';
import { HowToPlay } from './components/HowToPlay';
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
            <Route path="/how-to-play" element={<HowToPlay />} />
          </Routes>
        </Layout>
      </StatsProvider>
    </WebSocketProvider>
  );
}

export default App;
