const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const TransferRequest = require('../models/TransferRequest');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const AuditCycle = require('../models/AuditCycle');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedDatabase = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('Seeding database with sample ERP enterprise data...');

    // Clear collections
    await User.deleteMany();
    await Department.deleteMany();
    await Category.deleteMany();
    await Asset.deleteMany();
    await Allocation.deleteMany();
    await TransferRequest.deleteMany();
    await Booking.deleteMany();
    await Maintenance.deleteMany();
    await AuditCycle.deleteMany();
    await Notification.deleteMany();
    await AuditLog.deleteMany();

    // 1. Create Departments
    const engDept = await Department.create({
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development, DevOps, and Tech Ops infrastructure'
    });

    const hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'People Operations, Recruitment, and Employee Engagement'
    });

    const finDept = await Department.create({
      name: 'Finance & Accounting',
      code: 'FIN',
      description: 'Financial Planning, Payroll, and Budget Control'
    });

    const designDept = await Department.create({
      name: 'Product & Design',
      code: 'DES',
      description: 'UI/UX Design, Research, and Product Strategy'
    });

    // 2. Create Users (with default roles & passwords)
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@assetflow.com',
      password: 'Admin123!',
      role: 'Admin',
      department: engDept._id,
      status: 'Active'
    });

    const managerUser = await User.create({
      name: 'Vikram Sharma',
      email: 'manager@assetflow.com',
      password: 'Manager123!',
      role: 'Asset Manager',
      department: engDept._id,
      status: 'Active'
    });

    const deptHeadUser = await User.create({
      name: 'Ananya Roy',
      email: 'depthead@assetflow.com',
      password: 'Head123!',
      role: 'Department Head',
      department: engDept._id,
      status: 'Active'
    });

    // Assign Ananya Roy as head of Engineering
    engDept.head = deptHeadUser._id;
    await engDept.save();

    const priyaUser = await User.create({
      name: 'Priya Patel',
      email: 'employee@assetflow.com',
      password: 'Emp123!',
      role: 'Employee',
      department: engDept._id,
      status: 'Active'
    });

    const rajUser = await User.create({
      name: 'Raj Malhotra',
      email: 'raj@assetflow.com',
      password: 'Emp123!',
      role: 'Employee',
      department: hrDept._id,
      status: 'Active'
    });

    const auditorUser = await User.create({
      name: 'Sunita Verma',
      email: 'auditor@assetflow.com',
      password: 'Emp123!',
      role: 'Employee',
      department: finDept._id,
      status: 'Active'
    });

    // 3. Create Categories
    const electronicsCat = await Category.create({
      name: 'Electronics & Workstations',
      code: 'ELEC',
      description: 'Laptops, desktops, displays, and compute servers',
      icon: 'laptop',
      warrantyPeriodMonths: 36,
      maintenanceIntervalDays: 180,
      customFields: ['Processor', 'RAM Size', 'Storage Type']
    });

    const furnitureCat = await Category.create({
      name: 'Furniture & Ergonomics',
      code: 'FURN',
      description: 'Standing desks, ergonomic mesh chairs, and storage units',
      icon: 'armchair',
      warrantyPeriodMonths: 60,
      maintenanceIntervalDays: 365
    });

    const roomsCat = await Category.create({
      name: 'Shared Facilities & Rooms',
      code: 'ROOM',
      description: 'Conference halls, huddle rooms, and project pods',
      icon: 'door-open',
      warrantyPeriodMonths: 0,
      maintenanceIntervalDays: 90
    });

    const vehiclesCat = await Category.create({
      name: 'Office Shuttles & Vehicles',
      code: 'VEH',
      description: 'Corporate EV shuttles and delivery vans',
      icon: 'car',
      warrantyPeriodMonths: 48,
      maintenanceIntervalDays: 60
    });

    // 4. Create Assets
    const now = new Date();
    const pastOverdueDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago overdue!

    // Asset 1: Laptop allocated to Priya (Active allocation)
    const asset1 = await Asset.create({
      assetTag: 'AF-0001',
      name: 'MacBook Pro M3 Max 16"',
      category: electronicsCat._id,
      serialNumber: 'C02G901XMD6R',
      acquisitionDate: new Date('2025-01-15'),
      acquisitionCost: 3499,
      condition: 'Good',
      location: 'Building A - Floor 3 - Bay 12',
      department: engDept._id,
      status: 'Allocated',
      isBookable: false,
      currentHolder: priyaUser._id,
      photo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AF-0001',
      notes: 'High performance laptop for Lead Software Engineer'
    });

    const alloc1 = await Allocation.create({
      asset: asset1._id,
      user: priyaUser._id,
      department: engDept._id,
      allocatedBy: managerUser._id,
      allocationDate: new Date('2025-01-20'),
      expectedReturnDate: new Date('2027-01-20'),
      status: 'Active',
      notes: 'Initial allocation on onboarding'
    });

    asset1.currentAllocation = alloc1._id;
    await asset1.save();

    // Asset 2: Dell XPS 15 (Available)
    const asset2 = await Asset.create({
      assetTag: 'AF-0002',
      name: 'Dell XPS 15 OLED Touch',
      category: electronicsCat._id,
      serialNumber: 'DL-XPS15-9530',
      acquisitionDate: new Date('2025-03-01'),
      acquisitionCost: 2299,
      condition: 'New',
      location: 'IT Storage Vault - Cabinet 4',
      department: engDept._id,
      status: 'Available',
      isBookable: false,
      photo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AF-0002',
      notes: 'Available for assignment to new engineers'
    });

    // Asset 3: Shared Conference Room B2 (Bookable)
    const asset3 = await Asset.create({
      assetTag: 'AF-0003',
      name: 'Executive Boardroom B2 (12 Pax)',
      category: roomsCat._id,
      serialNumber: 'ROOM-CONF-B2',
      acquisitionDate: new Date('2024-06-10'),
      acquisitionCost: 15000,
      condition: 'Good',
      location: 'Building B - Floor 2',
      department: engDept._id,
      status: 'Available',
      isBookable: true,
      photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AF-0003',
      notes: 'Equipped with 4K Video Conferencing & Smart Whiteboard'
    });

    // Asset 4: Ergonomic Chair (Allocated to Raj - OVERDUE RETURN!)
    const asset4 = await Asset.create({
      assetTag: 'AF-0004',
      name: 'Herman Miller Aeron Chair',
      category: furnitureCat._id,
      serialNumber: 'HM-AERON-8831',
      acquisitionDate: new Date('2024-02-11'),
      acquisitionCost: 1450,
      condition: 'Fair',
      location: 'Building A - Floor 1',
      department: hrDept._id,
      status: 'Allocated',
      isBookable: false,
      currentHolder: rajUser._id,
      photo: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AF-0004',
      notes: 'Temporary loaner chair for ergonomics evaluation'
    });

    const alloc4 = await Allocation.create({
      asset: asset4._id,
      user: rajUser._id,
      department: hrDept._id,
      allocatedBy: managerUser._id,
      allocationDate: new Date('2026-07-01'),
      expectedReturnDate: pastOverdueDate, // PAST DUE OVERDUE FLAG!
      status: 'Active',
      notes: 'Temporary 30-day loaner allocation'
    });
    asset4.currentAllocation = alloc4._id;
    await asset4.save();

    // Asset 5: iPad Pro (Under Maintenance)
    const asset5 = await Asset.create({
      assetTag: 'AF-0005',
      name: 'iPad Pro 12.9" M2 Test Device',
      category: electronicsCat._id,
      serialNumber: 'IPAD-PRO-9921',
      acquisitionDate: new Date('2024-11-05'),
      acquisitionCost: 1199,
      condition: 'Damaged',
      location: 'Service Repair Lab',
      department: engDept._id,
      status: 'Under Maintenance',
      isBookable: false,
      photo: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AF-0005',
      notes: 'Display glass cracked during mobile app testing'
    });

    // Asset 6: Electric Shuttle (Bookable)
    const asset6 = await Asset.create({
      assetTag: 'AF-0006',
      name: 'Tesla Model Y Campus Shuttle',
      category: vehiclesCat._id,
      serialNumber: 'VIN-5YJXCBE21MF990',
      acquisitionDate: new Date('2025-05-12'),
      acquisitionCost: 45000,
      condition: 'Good',
      location: 'Main Parking Bay 1',
      department: hrDept._id,
      status: 'Available',
      isBookable: true,
      photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AF-0006',
      notes: 'Available for inter-site corporate transit'
    });

    // 5. Create Sample Bookings (with non-overlapping time slots)
    const todayMorningStart = new Date();
    todayMorningStart.setHours(9, 0, 0, 0);
    const todayMorningEnd = new Date();
    todayMorningEnd.setHours(10, 0, 0, 0);

    await Booking.create({
      asset: asset3._id,
      user: deptHeadUser._id,
      department: engDept._id,
      purpose: 'Q3 Product Architecture Review',
      startTime: todayMorningStart,
      endTime: todayMorningEnd,
      status: 'Upcoming',
      notes: 'Requires projector and whiteboards'
    });

    // 6. Create Maintenance Requests
    await Maintenance.create({
      asset: asset5._id,
      requestedBy: priyaUser._id,
      issueDescription: 'Screen digitizer glass broken and touch unresponsive',
      priority: 'High',
      status: 'Approved',
      approvedBy: managerUser._id,
      assignedTechnician: 'Apple Authorized Service Tech (Ramesh)',
      cost: 350
    });

    await Maintenance.create({
      asset: asset4._id,
      requestedBy: rajUser._id,
      issueDescription: 'Lifting cylinder hydraulic pressure slow',
      priority: 'Low',
      status: 'Pending'
    });

    // 7. Create Audit Cycle
    const auditCycle = await AuditCycle.create({
      title: 'Q3 2026 Engineering Department Asset Audit',
      scopeType: 'Department',
      scopeValue: engDept._id.toString(),
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
      assignedAuditors: [auditorUser._id, managerUser._id],
      status: 'In Progress',
      verifications: [
        {
          asset: asset1._id,
          status: 'Verified',
          notes: 'Asset tag intact, matched serial C02G901XMD6R in possession of Priya Patel',
          verifiedBy: auditorUser._id,
          verifiedAt: new Date()
        },
        {
          asset: asset2._id,
          status: 'Verified',
          notes: 'In IT storage locker cabinet 4',
          verifiedBy: auditorUser._id,
          verifiedAt: new Date()
        }
      ],
      createdBy: adminUser._id
    });

    // 8. Notifications
    await Notification.create({
      recipient: rajUser._id,
      title: 'OVERDUE RETURN ALERT',
      message: `Asset ${asset4.name} (${asset4.assetTag}) was expected to be returned by ${pastOverdueDate.toLocaleDateString()}. Please initiate a return or extension immediately.`,
      type: 'Overdue Alert',
      relatedAsset: asset4._id
    });

    await Notification.create({
      recipient: priyaUser._id,
      title: 'Asset Allocated',
      message: `Asset ${asset1.name} (${asset1.assetTag}) has been successfully allocated to you.`,
      type: 'Asset Assigned',
      relatedAsset: asset1._id
    });

    // 9. Initial Audit Logs
    await AuditLog.create({
      user: adminUser._id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'SYSTEM_INITIALIZED',
      entity: 'System',
      details: 'Populated initial ERP database with seed organization data, departments, categories, and assets.'
    });

    console.log('Database Seeding Complete!');
  } catch (error) {
    console.error('Database Seed Error:', error);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
