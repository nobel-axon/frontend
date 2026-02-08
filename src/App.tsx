import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AgentProfile } from './components/AgentProfile';
import { HowToPlay } from './components/HowToPlay';
import { StatsProvider } from './hooks/useStats';

function App() {
  return (
    <StatsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents/:address" element={<AgentProfile />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
        </Routes>
      </Layout>
    </StatsProvider>
  );
}

export default App;
