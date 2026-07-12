import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

const AssetCondition = z.enum(['New', 'Good', 'Fair', 'Poor']);
const EntityStatus = z.enum(['Active', 'Inactive']);
const Priority = z.enum(['Low', 'Medium', 'High']);
const AuditResult = z.enum([
  'Verified',
  'Missing',
  'Damaged',
  'Not Working',
  'Others',
]);

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
});

// ─── Asset Schema ────────────────────────────────────────────────────────────

export const assetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category_id: z.string().min(1, 'Select a category'),
  serial_number: z.string().optional(),
  condition: AssetCondition.optional(),
  location: z.string().optional(),
  acquisition_date: z.string().optional(),
  acquisition_cost: z
    .number()
    .positive('Acquisition cost must be a positive number')
    .optional(),
  is_bookable: z.boolean().default(false),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
});

// ─── Organization Schemas ────────────────────────────────────────────────────

export const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  parent_department_id: z.string().optional(),
  head_employee_id: z.string().optional(),
  status: EntityStatus.optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z
    .string()
    .max(200, 'Description must be at most 200 characters')
    .optional(),
});

// ─── Allocation Schema ───────────────────────────────────────────────────────

export const allocationSchema = z
  .object({
    asset_id: z.string().min(1, 'Asset is required'),
    employee_id: z.string().optional(),
    department_id: z.string().optional(),
    expected_return_date: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.employee_id && data.employee_id.length > 0) ||
      (data.department_id && data.department_id.length > 0),
    {
      message: 'At least one of Employee or Department is required',
      path: ['employee_id'],
    },
  );

// ─── Booking Schema ─────────────────────────────────────────────────────────

export const bookingSchema = z
  .object({
    asset_id: z.string().min(1, 'Asset is required'),
    start_datetime: z.string().min(1, 'Start date/time is required'),
    end_datetime: z.string().min(1, 'End date/time is required'),
    purpose: z
      .string()
      .max(200, 'Purpose must be at most 200 characters')
      .optional(),
  })
  .refine(
    (data) => new Date(data.end_datetime) > new Date(data.start_datetime),
    {
      message: 'End date/time must be after start date/time',
      path: ['end_datetime'],
    },
  );

// ─── Maintenance Schema ─────────────────────────────────────────────────────

export const maintenanceSchema = z.object({
  asset_id: z.string().min(1, 'Asset is required'),
  issue_description: z
    .string()
    .min(10, 'Issue description must be at least 10 characters')
    .max(500, 'Issue description must be at most 500 characters'),
  priority: Priority,
});

// ─── Transfer Schema ────────────────────────────────────────────────────────

export const transferSchema = z.object({
  allocation_id: z.string().min(1, 'Allocation is required'),
  to_employee_id: z.string().min(1, 'Target employee is required'),
  remarks: z
    .string()
    .max(200, 'Remarks must be at most 200 characters')
    .optional(),
});

// ─── Audit Cycle Schema ─────────────────────────────────────────────────────

export const auditCycleSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    scope_department_id: z.string().optional(),
    scope_location: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  });

// ─── Return Schema ──────────────────────────────────────────────────────────

export const returnSchema = z.object({
  condition_on_return: AssetCondition,
  return_notes: z
    .string()
    .max(500, 'Return notes must be at most 500 characters')
    .optional(),
});

// ─── Audit Result Schema ────────────────────────────────────────────────────

export const auditResultSchema = z.object({
  result: AuditResult,
  remarks: z
    .string()
    .max(500, 'Remarks must be at most 500 characters')
    .optional(),
});

// ─── Employee Schemas ────────────────────────────────────────────────────────

export const employeeRoleSchema = z.object({
  role_id: z.string().min(1, 'Select a role'),
});

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  department_id: z.string().optional(),
  status: EntityStatus.optional(),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type AssetFormValues = z.infer<typeof assetSchema>;
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type AllocationFormValues = z.infer<typeof allocationSchema>;
export type BookingFormValues = z.infer<typeof bookingSchema>;
export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
export type TransferFormValues = z.infer<typeof transferSchema>;
export type AuditCycleFormValues = z.infer<typeof auditCycleSchema>;
export type ReturnFormValues = z.infer<typeof returnSchema>;
export type AuditResultFormValues = z.infer<typeof auditResultSchema>;
export type EmployeeRoleFormValues = z.infer<typeof employeeRoleSchema>;
export type EmployeeFormValues = z.infer<typeof employeeSchema>;
