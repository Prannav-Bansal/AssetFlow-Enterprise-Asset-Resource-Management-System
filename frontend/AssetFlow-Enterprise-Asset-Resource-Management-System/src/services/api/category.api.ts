import api from './axios';
import { AssetCategory, CreateCategoryInput } from '@/types';

export const categoryApi = {
  list: async (): Promise<AssetCategory[]> => {
    const res = await api.get('/categories');
    return res.data.data;
  },

  create: async (input: CreateCategoryInput): Promise<AssetCategory> => {
    const res = await api.post('/categories', input);
    return res.data.data;
  },
};
