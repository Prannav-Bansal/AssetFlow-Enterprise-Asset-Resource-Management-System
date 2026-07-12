import api from './axios';
import { Department, CreateDepartmentInput } from '@/types';

export const departmentApi = {
  list: async (): Promise<Department[]> => {
    const res = await api.get('/departments');
    return res.data.data;
  },

  create: async (input: CreateDepartmentInput): Promise<Department> => {
    const res = await api.post('/departments', input);
    return res.data.data;
  },
};
