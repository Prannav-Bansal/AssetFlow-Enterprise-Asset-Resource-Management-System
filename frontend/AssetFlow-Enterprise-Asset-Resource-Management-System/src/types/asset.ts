export type AssetStatus = 'Available' | 'In Use' | 'Maintenance' | 'Retired' | 'Lost';
export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor';

export interface Asset {
  asset_id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  serial_number: string;
  barcode_rfid: string;
  purchase_date: string;
  purchase_cost: number;
  location: string;
  status: AssetStatus;
  condition: AssetCondition;
  assigned_to?: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}
