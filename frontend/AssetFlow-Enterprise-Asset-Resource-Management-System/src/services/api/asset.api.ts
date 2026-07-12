import api from './axios';
import { Asset, AssetFilters, CreateAssetInput, UpdateAssetInput } from '@/types';

/** Result of a paginated asset list (backend nests counts under `meta`). */
export interface AssetListResult {
  data: Asset[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const assetApi = {
  list: async (filters: AssetFilters = {}): Promise<AssetListResult> => {
    const res = await api.get('/assets', { params: filters });
    return { data: res.data.data, meta: res.data.meta };
  },

  get: async (id: string) => {
    const res = await api.get(`/assets/${id}`);
    return res.data.data;
  },

  create: async (input: CreateAssetInput): Promise<Asset> => {
    const res = await api.post('/assets', input);
    return res.data.data;
  },

  update: async (id: string, input: UpdateAssetInput): Promise<Asset> => {
    const res = await api.put(`/assets/${id}`, input);
    return res.data.data;
  },

  setStatus: async (id: string, status: string, note?: string): Promise<Asset> => {
    const res = await api.patch(`/assets/${id}/status`, { status, note });
    return res.data.data;
  },
};
