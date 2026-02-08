import { createContext, useContext } from 'react';
import { useAPI } from './useAPI';
import { fetchStats } from '../services/api';
import { config } from '../config';
import type { GlobalStats } from '../types';

interface StatsContextValue {
  stats: GlobalStats | null;
  loading: boolean;
}

const StatsContext = createContext<StatsContextValue>({ stats: null, loading: true });

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const { data, loading } = useAPI(fetchStats, [], { pollInterval: config.statsPollingInterval });

  return (
    <StatsContext value={{ stats: data, loading }}>
      {children}
    </StatsContext>
  );
}

export function useStats() {
  return useContext(StatsContext);
}
