import api from './axios';
import { Booking, BookingFilters, CreateBookingInput } from '@/types';

export interface BookingListResult {
  data: Booking[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const bookingApi = {
  list: async (filters: BookingFilters = {}): Promise<BookingListResult> => {
    const res = await api.get('/bookings', { params: filters });
    return { data: res.data.data, meta: res.data.meta };
  },

  create: async (input: CreateBookingInput): Promise<Booking> => {
    const res = await api.post('/bookings', input);
    return res.data.data;
  },

  cancel: async (id: string): Promise<Booking> => {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return res.data.data;
  },
};
