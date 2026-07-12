import api from './axios';
import { AuditCycle } from '@/types';

export const auditApi = {
  listCycles: async (): Promise<AuditCycle[]> => {
    const res = await api.get('/audits/cycles');
    return res.data.data;
  },
};
