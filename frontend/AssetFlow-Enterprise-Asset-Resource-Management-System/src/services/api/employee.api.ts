import api from './axios';
import { Employee, EmployeeFilters } from '@/types';

export interface EmployeeListResult {
  data: Employee[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const employeeApi = {
  list: async (filters: EmployeeFilters = {}): Promise<EmployeeListResult> => {
    const res = await api.get('/employees', { params: filters });
    return { data: res.data.data, meta: res.data.meta };
  },

  get: async (id: string) => {
    const res = await api.get(`/employees/${id}`);
    return res.data.data;
  },
};
