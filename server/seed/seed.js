/**
 * Seed script — wipes the database and loads a rich demo dataset:
 *   4 roles, 1 admin + ~15 employees, departments (with hierarchy & heads),
 *   asset categories (with custom fields), ~40 assets, and sample allocations,
 *   bookings, and maintenance requests.
 *
 * Run with:  npm run seed
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Role = require('../models/Role');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset');
const AssetAllocation = require('../models/AssetAllocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const UserSession = require('../models/UserSession');
const TransferRequest = require('../models/TransferRequest');
const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');

const {
  ROLES,
  ASSET_STATUS,
  ASSET_CONDITION,
  ALLOCATION_STATUS,
  MAINTENANCE_PRIORITY,
} = require('../config/constants');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const clearAll = async () => {
  await Promise.all([
    Role.deleteMany({}),
    Department.deleteMany({}),
    Employee.deleteMany({}),
    AssetCategory.deleteMany({}),
    Asset.deleteMany({}),
    AssetAllocation.deleteMany({}),
    Booking.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    Counter.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    UserSession.deleteMany({}),
    TransferRequest.deleteMany({}),
    AuditCycle.deleteMany({}),
    AuditRecord.deleteMany({}),
  ]);
  console.log('✓ Cleared existing collections');
};

const seed = async () => {
  await connectDB();
  await clearAll();

  // --- Roles ---
  const roleDocs = await Role.insertMany([
    { name: ROLES.ADMIN, description: 'Full system access' },
    { name: ROLES.ASSET_MANAGER, description: 'Manages assets, allocations, maintenance, audits' },
    { name: ROLES.DEPARTMENT_HEAD, description: 'Manages their department and approvals' },
    { name: ROLES.EMPLOYEE, description: 'Standard employee access' },
  ]);
  const roles = Object.fromEntries(roleDocs.map((r) => [r.name, r._id]));
  console.log('✓ Seeded 4 roles');

  // --- Departments ---
  const [it, ops, finance] = await Department.insertMany([
    { name: 'Information Technology' },
    { name: 'Operations' },
    { name: 'Finance' },
  ]);
  // A sub-department to demonstrate hierarchy.
  const infra = await Department.create({ name: 'IT Infrastructure', parent_department_id: it._id });
  const departments = [it, ops, finance, infra];
  console.log('✓ Seeded departments');

  // --- Employees ---
  const passwordHash = await Employee.hashPassword('Password@123');
  const adminHash = await Employee.hashPassword('Admin@123');

  const admin = await Employee.create({
    name: 'System Admin',
    email: 'admin@assetflow.com',
    password_hash: adminHash,
    role_id: roles[ROLES.ADMIN],
    department_id: it._id,
  });

  const firstNames = ['Aarav', 'Diya', 'Rohan', 'Priya', 'Karan', 'Isha', 'Vikram', 'Neha', 'Arjun', 'Sana', 'Rahul', 'Meera', 'Aditya', 'Tara'];
  const lastNames = ['Sharma', 'Patel', 'Rao', 'Nair', 'Gupta', 'Iyer', 'Singh', 'Bose', 'Reddy', 'Khan', 'Mehta', 'Das', 'Verma', 'Joshi'];

  const employees = [admin];
  for (let i = 0; i < 14; i += 1) {
    const name = `${firstNames[i]} ${lastNames[i]}`;
    // First employee of each of the first 3 depts becomes a Department Head,
    // a couple become Asset Managers, the rest are Employees.
    let roleId = roles[ROLES.EMPLOYEE];
    if (i < 3) roleId = roles[ROLES.DEPARTMENT_HEAD];
    else if (i < 5) roleId = roles[ROLES.ASSET_MANAGER];

    const emp = await Employee.create({
      name,
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@assetflow.com`,
      password_hash: passwordHash,
      role_id: roleId,
      department_id: pick(departments)._id,
    });
    employees.push(emp);
  }
  console.log(`✓ Seeded ${employees.length} employees (incl. admin)`);

  // Assign department heads.
  it.head_employee_id = employees[1]._id;
  ops.head_employee_id = employees[2]._id;
  finance.head_employee_id = employees[3]._id;
  await Promise.all([it.save(), ops.save(), finance.save()]);

  const assetManagers = employees.filter((_, i) => i >= 3 && i < 5);

  // --- Categories ---
  const categories = await AssetCategory.insertMany([
    { name: 'Laptops', description: 'Portable computers', custom_fields: { warranty_period: '2 years', ram: '16GB' } },
    { name: 'Monitors', description: 'External displays', custom_fields: { size: '27 inch' } },
    { name: 'Vehicles', description: 'Company vehicles', custom_fields: { fuel_type: 'Diesel' } },
    { name: 'Meeting Rooms', description: 'Bookable meeting rooms', custom_fields: { capacity: '10' } },
    { name: 'Projectors', description: 'Presentation projectors', custom_fields: { lumens: '3500' } },
    { name: 'Furniture', description: 'Office furniture', custom_fields: {} },
  ]);
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));
  console.log(`✓ Seeded ${categories.length} categories`);

  // --- Assets (with auto-generated tags) ---
  const { generateAssetTag } = require('../utils/assetTagGenerator');
  const locations = ['HQ - Floor 1', 'HQ - Floor 2', 'HQ - Floor 3', 'Warehouse A', 'Remote'];
  const conditions = Object.values(ASSET_CONDITION);

  const assetPlans = [
    ...Array.from({ length: 14 }, (_, i) => ({ category: 'Laptops', name: `Dell Latitude ${5400 + i}` })),
    ...Array.from({ length: 10 }, (_, i) => ({ category: 'Monitors', name: `LG UltraFine Monitor #${i + 1}` })),
    ...Array.from({ length: 4 }, (_, i) => ({ category: 'Vehicles', name: `Toyota Innova #${i + 1}`, bookable: true })),
    ...Array.from({ length: 5 }, (_, i) => ({ category: 'Meeting Rooms', name: `Conference Room ${String.fromCharCode(65 + i)}`, bookable: true })),
    ...Array.from({ length: 4 }, (_, i) => ({ category: 'Projectors', name: `Epson Projector #${i + 1}`, bookable: true })),
    ...Array.from({ length: 5 }, (_, i) => ({ category: 'Furniture', name: `Ergonomic Chair #${i + 1}` })),
  ];

  const assets = [];
  for (let i = 0; i < assetPlans.length; i += 1) {
    const plan = assetPlans[i];
    const asset = await Asset.create({
      category_id: catByName[plan.category]._id,
      asset_tag: await generateAssetTag(),
      serial_number: `SN-${1000 + i}`,
      name: plan.name,
      is_bookable: Boolean(plan.bookable),
      condition: pick(conditions),
      status: ASSET_STATUS.AVAILABLE,
      location: pick(locations),
      acquisition_date: daysFromNow(-Math.floor(Math.random() * 700)),
      acquisition_cost: 5000 + Math.floor(Math.random() * 90000),
      created_by: admin._id,
    });
    assets.push(asset);
  }
  console.log(`✓ Seeded ${assets.length} assets`);

  // --- Sample allocations (allocate ~8 non-bookable assets) ---
  const allocatable = assets.filter((a) => !a.is_bookable).slice(0, 8);
  for (let i = 0; i < allocatable.length; i += 1) {
    const asset = allocatable[i];
    const holder = pick(employees);
    // Make a couple overdue for demo purposes.
    const expected = i < 2 ? daysFromNow(-3) : daysFromNow(10 + i);
    await AssetAllocation.create({
      asset_id: asset._id,
      employee_id: holder._id,
      department_id: holder.department_id,
      allocated_by: pick(assetManagers)._id,
      expected_return_date: expected,
      status: ALLOCATION_STATUS.ACTIVE,
    });
    asset.status = ASSET_STATUS.ALLOCATED;
    await asset.save();
  }
  console.log(`✓ Seeded ${allocatable.length} active allocations (2 overdue)`);

  // --- Sample bookings (for bookable assets) ---
  const bookables = assets.filter((a) => a.is_bookable);
  for (let i = 0; i < 6; i += 1) {
    const asset = pick(bookables);
    const start = daysFromNow(1 + i);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    await Booking.create({
      asset_id: asset._id,
      employee_id: pick(employees)._id,
      created_by: admin._id,
      start_datetime: start,
      end_datetime: end,
      purpose: 'Team meeting',
    });
  }
  console.log('✓ Seeded sample bookings');

  // --- Sample maintenance requests ---
  for (let i = 0; i < 4; i += 1) {
    await MaintenanceRequest.create({
      asset_id: pick(assets)._id,
      requested_by: pick(employees)._id,
      issue_description: pick([
        'Screen flickering intermittently',
        'Battery not charging',
        'Strange noise from engine',
        'Projector bulb dim',
      ]),
      priority: pick(Object.values(MAINTENANCE_PRIORITY)),
    });
  }
  console.log('✓ Seeded sample maintenance requests');

  console.log('\n=== Seed complete ===');
  console.log('Admin login   → admin@assetflow.com / Admin@123');
  console.log('Sample user   → aarav.sharma@assetflow.com / Password@123');
  console.log('(all seeded non-admin users share the password: Password@123)\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('✗ Seed failed:', err);
  process.exit(1);
});
