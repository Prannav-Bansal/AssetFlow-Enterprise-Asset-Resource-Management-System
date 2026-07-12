export const ASSET_STATUSES = ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'] as const;
export type AssetStatus = typeof ASSET_STATUSES[number];

export const ASSET_CONDITIONS = ['New', 'Good', 'Fair', 'Poor'] as const;
export type AssetCondition = typeof ASSET_CONDITIONS[number];

export const ALLOCATION_STATUSES = ['Active', 'Returned', 'Overdue'] as const;
export type AllocationStatus = typeof ALLOCATION_STATUSES[number];

export const TRANSFER_STATUSES = ['Requested', 'Approved', 'Rejected'] as const;
export type TransferStatus = typeof TRANSFER_STATUSES[number];

export const MAINTENANCE_STATUSES = ['Pending Approval', 'Approved', 'In Progress', 'Resolved', 'Closed'] as const;
export type MaintenanceStatus = typeof MAINTENANCE_STATUSES[number];

export const AUDIT_CYCLE_STATUSES = ['Planned', 'In Progress', 'Completed', 'Closed'] as const;
export type AuditCycleStatus = typeof AUDIT_CYCLE_STATUSES[number];

export const AUDIT_RESULTS = ['Verified', 'Missing', 'Damaged', 'Not Working', 'Others'] as const;
export type AuditResult = typeof AUDIT_RESULTS[number];

export const BOOKING_STATUSES = ['Confirmed', 'Cancelled', 'Completed'] as const;
export type BookingStatus = typeof BOOKING_STATUSES[number];

export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type Priority = typeof PRIORITIES[number];

export const USER_ROLES = ['Admin', 'Asset Manager', 'Department Head', 'Employee'] as const;
export type UserRole = typeof USER_ROLES[number];

export const ENTITY_STATUSES = ['Active', 'Inactive'] as const;
export type EntityStatus = typeof ENTITY_STATUSES[number];

export const NOTIFICATION_TYPES = ['Return', 'Booking', 'Maintenance', 'Audit', 'System', 'Other'] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export interface Role { _id: string; name: UserRole; description?: string; created_at: string; }
export interface Department { _id: string; name: string; parent_department_id?: string; head_employee_id?: string; head_employee?: Employee; parent_department?: Department; status: EntityStatus; created_at: string; updated_at: string; }
export interface Employee { _id: string; name: string; email: string; password_hash?: string; department_id?: string; department?: Department; role_id: string; role?: Role; status: EntityStatus; created_at: string; updated_at: string; }
export interface UserSession { _id: string; employee_id: string; token: string; login_at: string; logout_at?: string; ip_address?: string; user_agent?: string; }
export interface AssetCategory { _id: string; name: string; description?: string; custom_fields?: Record<string, string>; created_at: string; updated_at: string; }
export interface Asset { _id: string; category_id: string; category?: AssetCategory; asset_tag: string; serial_number?: string; name: string; description?: string; is_bookable: boolean; condition?: AssetCondition; status: AssetStatus; location?: string; acquisition_date?: string; acquisition_cost?: number; photo_url?: string; created_by?: string; creator?: Employee; created_at: string; updated_at: string; }
export interface AssetAllocation { _id: string; asset_id: string; asset?: Asset; employee_id?: string; employee?: Employee; department_id?: string; department?: Department; allocated_by: string; allocator?: Employee; allocated_date: string; expected_return_date?: string; returned_date?: string; status: AllocationStatus; condition_on_return?: string; return_notes?: string; created_at: string; updated_at: string; }
export interface TransferRequest { _id: string; allocation_id: string; allocation?: AssetAllocation; from_employee_id: string; from_employee?: Employee; to_employee_id: string; to_employee?: Employee; requested_by: string; requester?: Employee; status: TransferStatus; requested_at: string; approved_by?: string; approver?: Employee; approved_at?: string; remarks?: string; }
export interface Booking { _id: string; asset_id: string; asset?: Asset; employee_id: string; employee?: Employee; start_datetime: string; end_datetime: string; purpose?: string; status: BookingStatus; created_at: string; created_by?: string; photo_url?: string; }
export interface MaintenanceRequest { _id: string; asset_id: string; asset?: Asset; requested_by: string; requester?: Employee; issue_description: string; priority: Priority; status: MaintenanceStatus; photo_url?: string; requested_at: string; approved_by?: string; approver?: Employee; technician_id?: string; technician?: Employee; approved_at?: string; resolved_at?: string; resolution_notes?: string; }
export interface AuditCycle { _id: string; name: string; scope_department_id?: string; scope_department?: Department; scope_location?: string; start_date: string; end_date: string; status: AuditCycleStatus; auditors?: Employee[]; created_by?: string; creator?: Employee; created_at: string; updated_at: string; }
export interface AuditRecord { _id: string; audit_cycle_id: string; audit_cycle?: AuditCycle; asset_id: string; asset?: Asset; auditor_id: string; auditor?: Employee; result?: AuditResult; remarks?: string; recorded_at?: string; photo_url?: string; }
export interface Notification { _id: string; employee_id: string; title: string; message?: string; type: NotificationType; is_read: boolean; created_at: string; }
export interface ActivityLog { _id: string; employee_id: string; employee?: Employee; action: string; entity_type: string; entity_id: string; description?: string; metadata?: Record<string, unknown>; ip_address?: string; created_at?: string; }

export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface PaginatedResponse<T> { success: boolean; data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface AuthResponse { success: boolean; data: { employee: Employee; accessToken: string; refreshToken: string; }; message?: string; }
export interface KPIDashboard { assetsAvailable: number; assetsAllocated: number; maintenanceToday: number; activeBookings: number; pendingTransfers: number; upcomingReturns: number; overdueReturns: number; }

export interface CreateAssetInput { name: string; category_id: string; serial_number?: string; condition?: AssetCondition; location?: string; acquisition_date?: string; acquisition_cost?: number; is_bookable: boolean; description?: string; photo?: File; }
export type UpdateAssetInput = Partial<CreateAssetInput>;
export interface CreateDepartmentInput { name: string; parent_department_id?: string; head_employee_id?: string; status?: EntityStatus; }
export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;
export interface CreateCategoryInput { name: string; description?: string; custom_fields?: Record<string, string>; }
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
export interface CreateAllocationInput { asset_id: string; employee_id?: string; department_id?: string; expected_return_date?: string; }
export interface ReturnAssetInput { condition_on_return: AssetCondition; return_notes?: string; }
export interface CreateTransferInput { allocation_id: string; to_employee_id: string; remarks?: string; }
export interface CreateBookingInput { asset_id: string; start_datetime: string; end_datetime: string; purpose?: string; }
export interface RescheduleBookingInput { start_datetime: string; end_datetime: string; }
export interface CreateMaintenanceInput { asset_id: string; issue_description: string; priority: Priority; photo?: File; }
export interface AssignTechnicianInput { technician_id: string; }
export interface ResolveMaintenanceInput { resolution_notes: string; }
export interface CreateAuditCycleInput { name: string; scope_department_id?: string; scope_location?: string; start_date: string; end_date: string; }
export interface AssignAuditorsInput { auditor_ids: string[]; }
export interface RecordAuditResultInput { result: AuditResult; remarks?: string; photo?: File; }
export interface UpdateEmployeeRoleInput { role_id: string; }

export interface AssetFilters { search?: string; category_id?: string; status?: AssetStatus; department_id?: string; location?: string; is_bookable?: boolean; page?: number; limit?: number; sort_by?: string; sort_order?: string; }
export interface AllocationFilters { employee_id?: string; department_id?: string; status?: AllocationStatus; asset_id?: string; overdue?: boolean; page?: number; limit?: number; }
export interface BookingFilters { asset_id?: string; employee_id?: string; status?: BookingStatus; date_from?: string; date_to?: string; page?: number; limit?: number; }
export interface MaintenanceFilters { asset_id?: string; status?: MaintenanceStatus; priority?: Priority; date_from?: string; date_to?: string; page?: number; limit?: number; }
export interface AuditFilters { status?: AuditCycleStatus; department_id?: string; page?: number; limit?: number; }
export interface EmployeeFilters { search?: string; department_id?: string; role_id?: string; status?: EntityStatus; page?: number; limit?: number; }
export interface ActivityLogFilters { employee_id?: string; action?: string; entity_type?: string; date_from?: string; date_to?: string; page?: number; limit?: number; }
export interface NotificationFilters { type?: NotificationType; is_read?: boolean; page?: number; limit?: number; }
