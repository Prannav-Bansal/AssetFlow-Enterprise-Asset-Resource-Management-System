import api from './axios';
import { MaintenanceRequest, MaintenanceFilters, CreateMaintenanceInput } from '@/types';

export interface MaintenanceListResult {
  data: MaintenanceRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const maintenanceApi = {
  list: async (filters: MaintenanceFilters = {}): Promise<MaintenanceListResult> => {
    const res = await api.get('/maintenance', { params: filters });
    return { data: res.data.data, meta: res.data.meta };
  },

  create: async (input: CreateMaintenanceInput): Promise<MaintenanceRequest> => {
    const res = await api.post('/maintenance', input);
    return res.data.data;
  },
};
