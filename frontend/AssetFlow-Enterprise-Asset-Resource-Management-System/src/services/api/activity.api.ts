import api from './axios';
import { ActivityLog, ActivityLogFilters } from '@/types';

export interface ActivityListResult {
  data: ActivityLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const activityApi = {
  list: async (filters: ActivityLogFilters = {}): Promise<ActivityListResult> => {
    const res = await api.get('/activity-logs', { params: filters });
    return { data: res.data.data, meta: res.data.meta };
  },
};
