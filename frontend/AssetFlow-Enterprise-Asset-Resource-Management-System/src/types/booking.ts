export type BookingStatus = 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Cancelled';

export interface Booking {
  booking_id: string;
  asset_id: string;
  asset_name: string; // denormalized for easier UI rendering
  employee_id: string;
  employee_name: string; // denormalized for easier UI rendering
  start_time: string;
  end_time: string;
  purpose?: string;
  status: BookingStatus;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}
