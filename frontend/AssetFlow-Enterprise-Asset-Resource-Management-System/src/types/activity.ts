export type ActionType = 'Create' | 'Update' | 'Delete' | 'Login' | 'Logout' | 'StatusChange';
export type EntityType = 'Asset' | 'Booking' | 'Employee' | 'Department' | 'Audit' | 'Maintenance';

export interface ActivityLog {
  log_id: string;
  employee_id: string;
  employee_name: string;
  action: ActionType;
  entity_type: EntityType;
  entity_id: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
