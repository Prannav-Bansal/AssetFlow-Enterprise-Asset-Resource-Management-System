export type DepartmentStatus = 'Active' | 'Inactive';

export interface Department {
  department_id: string;
  name: string;
  parent_department_id?: string;
  parent_department_name?: string; // denormalized
  head_employee_id?: string;
  head_employee_name?: string; // denormalized
  status: DepartmentStatus;
  created_at: string;
  updated_at: string;
}
