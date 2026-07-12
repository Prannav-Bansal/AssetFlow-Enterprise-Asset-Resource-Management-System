import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Activity,
} from 'lucide-react';

// ─── App Constants ───────────────────────────────────────────────────────────

export const APP_NAME = 'AssetFlow';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ITEMS_PER_PAGE = 10;
export const DATE_FORMAT = 'MMM DD, YYYY';
export const DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// ─── Status Config Types ─────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  text: string;
  dot: string;
}

// ─── Asset Status ────────────────────────────────────────────────────────────

export const ASSET_STATUS_CONFIG: Record<string, StatusConfig> = {
  Available: {
    label: 'Available',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Allocated: {
    label: 'Allocated',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  Reserved: {
    label: 'Reserved',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  'Under Maintenance': {
    label: 'Under Maintenance',
    color: 'orange',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  Lost: {
    label: 'Lost',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  Retired: {
    label: 'Retired',
    color: 'gray',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
  Disposed: {
    label: 'Disposed',
    color: 'slate',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-500',
  },
};

// ─── Allocation Status ───────────────────────────────────────────────────────

export const ALLOCATION_STATUS_CONFIG: Record<string, StatusConfig> = {
  Active: {
    label: 'Active',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  Returned: {
    label: 'Returned',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Overdue: {
    label: 'Overdue',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

// ─── Transfer Status ─────────────────────────────────────────────────────────

export const TRANSFER_STATUS_CONFIG: Record<string, StatusConfig> = {
  Requested: {
    label: 'Requested',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  Approved: {
    label: 'Approved',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

// ─── Maintenance Status ──────────────────────────────────────────────────────

export const MAINTENANCE_STATUS_CONFIG: Record<string, StatusConfig> = {
  'Pending Approval': {
    label: 'Pending Approval',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  Approved: {
    label: 'Approved',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'indigo',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    dot: 'bg-indigo-500',
  },
  Resolved: {
    label: 'Resolved',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Closed: {
    label: 'Closed',
    color: 'gray',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

// ─── Audit Cycle Status ──────────────────────────────────────────────────────

export const AUDIT_CYCLE_STATUS_CONFIG: Record<string, StatusConfig> = {
  Planned: {
    label: 'Planned',
    color: 'slate',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-500',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  Completed: {
    label: 'Completed',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Closed: {
    label: 'Closed',
    color: 'gray',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

// ─── Audit Result ────────────────────────────────────────────────────────────

export const AUDIT_RESULT_CONFIG: Record<string, StatusConfig> = {
  Verified: {
    label: 'Verified',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Missing: {
    label: 'Missing',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  Damaged: {
    label: 'Damaged',
    color: 'orange',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  'Not Working': {
    label: 'Not Working',
    color: 'rose',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  Others: {
    label: 'Others',
    color: 'gray',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

// ─── Booking Status ──────────────────────────────────────────────────────────

export const BOOKING_STATUS_CONFIG: Record<string, StatusConfig> = {
  Confirmed: {
    label: 'Confirmed',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  Completed: {
    label: 'Completed',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
};

// ─── Priority ────────────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<string, StatusConfig> = {
  Low: {
    label: 'Low',
    color: 'slate',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-500',
  },
  Medium: {
    label: 'Medium',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  High: {
    label: 'High',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

// ─── Asset Condition ─────────────────────────────────────────────────────────

export const CONDITION_CONFIG: Record<string, StatusConfig> = {
  New: {
    label: 'New',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Good: {
    label: 'Good',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  Fair: {
    label: 'Fair',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  Poor: {
    label: 'Poor',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

// ─── User Roles ──────────────────────────────────────────────────────────────

export const ROLE_CONFIG: Record<string, StatusConfig> = {
  Admin: {
    label: 'Admin',
    color: 'violet',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  'Asset Manager': {
    label: 'Asset Manager',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  'Department Head': {
    label: 'Department Head',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  Employee: {
    label: 'Employee',
    color: 'slate',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-400',
    dot: 'bg-slate-500',
  },
};

// ─── Entity Status (Active / Inactive) ───────────────────────────────────────

export const ENTITY_STATUS_CONFIG: Record<string, StatusConfig> = {
  Active: {
    label: 'Active',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Inactive: {
    label: 'Inactive',
    color: 'gray',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

// ─── Valid Asset Status Transitions ──────────────────────────────────────────

export const VALID_ASSET_TRANSITIONS: Record<string, string[]> = {
  Available: [
    'Allocated',
    'Reserved',
    'Under Maintenance',
    'Lost',
    'Retired',
    'Disposed',
  ],
  Allocated: ['Available', 'Under Maintenance', 'Lost'],
  Reserved: ['Available', 'Allocated'],
  'Under Maintenance': ['Available'],
  Lost: ['Available', 'Disposed'],
  Retired: ['Disposed'],
  Disposed: [],
};

// ─── Sidebar Navigation ─────────────────────────────────────────────────────

export const SIDEBAR_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  },
  {
    title: 'Organization Setup',
    href: '/organization',
    icon: Building2,
    roles: ['Admin'],
  },
  {
    title: 'Asset Directory',
    href: '/assets',
    icon: Package,
    roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  },
  {
    title: 'Allocation & Transfer',
    href: '/allocations',
    icon: ArrowLeftRight,
    roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  },
  {
    title: 'Resource Booking',
    href: '/bookings',
    icon: Calendar,
    roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  },
  {
    title: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  },
  {
    title: 'Audit Management',
    href: '/audits',
    icon: ClipboardCheck,
    roles: ['Admin', 'Asset Manager', 'Department Head'],
  },
  {
    title: 'Reports & Analytics',
    href: '/reports',
    icon: BarChart3,
    roles: ['Admin', 'Asset Manager', 'Department Head'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
  },
  {
    title: 'Activity Logs',
    href: '/activity-logs',
    icon: Activity,
    roles: ['Admin'],
  },
];
