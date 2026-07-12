/**
 * Centralized enums and constant values used across the application.
 * Keeping every enum in one place makes models, validators, and services
 * agree on the exact same set of allowed values.
 */

const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee',
};
const ROLE_VALUES = Object.values(ROLES);

const ACTIVE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};
const ACTIVE_STATUS_VALUES = Object.values(ACTIVE_STATUS);

const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  RESERVED: 'Reserved',
  UNDER_MAINTENANCE: 'Under Maintenance',
  LOST: 'Lost',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed',
};
const ASSET_STATUS_VALUES = Object.values(ASSET_STATUS);

/**
 * Allowed asset lifecycle transitions. Any status change is validated against
 * this map so an asset can never jump into an illegal state.
 */
const ASSET_STATUS_TRANSITIONS = {
  [ASSET_STATUS.AVAILABLE]: [
    ASSET_STATUS.ALLOCATED,
    ASSET_STATUS.RESERVED,
    ASSET_STATUS.UNDER_MAINTENANCE,
    ASSET_STATUS.LOST,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.DISPOSED,
  ],
  [ASSET_STATUS.ALLOCATED]: [
    ASSET_STATUS.AVAILABLE,
    ASSET_STATUS.UNDER_MAINTENANCE,
    ASSET_STATUS.LOST,
  ],
  [ASSET_STATUS.RESERVED]: [ASSET_STATUS.AVAILABLE, ASSET_STATUS.ALLOCATED],
  [ASSET_STATUS.UNDER_MAINTENANCE]: [ASSET_STATUS.AVAILABLE],
  [ASSET_STATUS.LOST]: [ASSET_STATUS.AVAILABLE, ASSET_STATUS.DISPOSED],
  [ASSET_STATUS.RETIRED]: [ASSET_STATUS.DISPOSED],
  [ASSET_STATUS.DISPOSED]: [],
};

const ASSET_CONDITION = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};
const ASSET_CONDITION_VALUES = Object.values(ASSET_CONDITION);

const ALLOCATION_STATUS = {
  ACTIVE: 'Active',
  RETURNED: 'Returned',
  OVERDUE: 'Overdue',
};
const ALLOCATION_STATUS_VALUES = Object.values(ALLOCATION_STATUS);

const TRANSFER_STATUS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};
const TRANSFER_STATUS_VALUES = Object.values(TRANSFER_STATUS);

const BOOKING_STATUS = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};
const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS);

const MAINTENANCE_STATUS = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};
const MAINTENANCE_STATUS_VALUES = Object.values(MAINTENANCE_STATUS);

const MAINTENANCE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
const MAINTENANCE_PRIORITY_VALUES = Object.values(MAINTENANCE_PRIORITY);

const AUDIT_CYCLE_STATUS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
};
const AUDIT_CYCLE_STATUS_VALUES = Object.values(AUDIT_CYCLE_STATUS);

const AUDIT_RESULT = {
  VERIFIED: 'Verified',
  MISSING: 'Missing',
  DAMAGED: 'Damaged',
  NOT_WORKING: 'Not Working',
  OTHERS: 'Others',
};
const AUDIT_RESULT_VALUES = Object.values(AUDIT_RESULT);

const NOTIFICATION_TYPE = {
  RETURN: 'Return',
  BOOKING: 'Booking',
  MAINTENANCE: 'Maintenance',
  AUDIT: 'Audit',
  SYSTEM: 'System',
  OTHER: 'Other',
};
const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE);

module.exports = {
  ROLES,
  ROLE_VALUES,
  ACTIVE_STATUS,
  ACTIVE_STATUS_VALUES,
  ASSET_STATUS,
  ASSET_STATUS_VALUES,
  ASSET_STATUS_TRANSITIONS,
  ASSET_CONDITION,
  ASSET_CONDITION_VALUES,
  ALLOCATION_STATUS,
  ALLOCATION_STATUS_VALUES,
  TRANSFER_STATUS,
  TRANSFER_STATUS_VALUES,
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES,
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_VALUES,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_PRIORITY_VALUES,
  AUDIT_CYCLE_STATUS,
  AUDIT_CYCLE_STATUS_VALUES,
  AUDIT_RESULT,
  AUDIT_RESULT_VALUES,
  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_VALUES,
};
