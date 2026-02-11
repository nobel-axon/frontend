import { useAPI } from './useAPI';
import { fetchBountyStats } from '../services/api';
import { config } from '../config';
import type { BountyStatsResponse } from '../types';

export function useBountyStats() {
  const { data, loading } = useAPI(fetchBountyStats, [], {
    pollInterval: config.statsPollingInterval,
  });

  return {
    bountyStats: data as BountyStatsResponse | null,
    loading,
  };
}
