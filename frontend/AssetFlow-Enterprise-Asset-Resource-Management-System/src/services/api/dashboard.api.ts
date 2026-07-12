import api from './axios';

/** KPI shape returned by GET /api/dashboard/kpis (snake_case from the backend). */
export interface DashboardKpis {
  assets_available: number;
  assets_allocated: number;
  assets_under_maintenance: number;
  maintenance_requests_today: number;
  active_bookings: number;
  pending_transfers: number;
  upcoming_returns: number;
  overdue_returns: number;
}

export const dashboardApi = {
  getKpis: async (): Promise<DashboardKpis> => {
    const res = await api.get('/dashboard/kpis');
    return res.data.data;
  },

  getOverdue: async () => {
    const res = await api.get('/dashboard/overdue');
    return res.data.data;
  },

  getUpcomingReturns: async () => {
    const res = await api.get('/dashboard/upcoming-returns');
    return res.data.data;
  },
};
