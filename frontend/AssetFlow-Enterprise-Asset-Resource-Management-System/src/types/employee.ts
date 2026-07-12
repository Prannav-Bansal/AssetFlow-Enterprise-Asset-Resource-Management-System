export type EmployeeStatus = 'Active' | 'Inactive' | 'Suspended';
export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface Employee {
  employee_id: string;
  department_id: string;
  department_name: string; // denormalized
  role_id: UserRole;
  name: string;
  email: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}
