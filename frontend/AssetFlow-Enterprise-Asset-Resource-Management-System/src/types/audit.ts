export type AuditStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Audit {
  audit_id: string;
  auditor_id: string;
  auditor_name: string;
  scheduled_date: string;
  status: AuditStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AuditItemStatus = 'Present' | 'Missing' | 'Damaged';

export interface AuditItem {
  audit_item_id: string;
  audit_id: string;
  asset_id: string;
  asset_name: string;
  status: AuditItemStatus;
  notes?: string;
}
