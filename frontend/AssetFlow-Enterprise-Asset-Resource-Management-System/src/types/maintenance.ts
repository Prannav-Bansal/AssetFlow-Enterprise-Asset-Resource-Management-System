export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled';

export interface MaintenanceRequest {
  request_id: string;
  asset_id: string;
  asset_name: string;
  reported_by: string;
  reporter_name: string;
  issue_description: string;
  status: MaintenanceStatus;
  cost?: number;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}
