// Seed script for YogiTrack
// Usage:
//   node scripts/seed.cjs                  # seed all (clears all collections)
//   node scripts/seed.cjs --module=all     # same as above
//   node scripts/seed.cjs --module=instructor|package|customer|class|attendance  # seed only that module (clears only that collection)

const path = require('path');
const mongoose = require('mongoose');

// Connect using existing app config
require(path.join(__dirname, '..', 'config', 'mongodbconn.cjs'));

const Instructor = require(path.join(__dirname, '..', 'models', 'instructorModel.cjs'));
const Package = require(path.join(__dirname, '..', 'models', 'packageModel.cjs'));
const Customer = require(path.join(__dirname, '..', 'models', 'customerModel.cjs'));
const ClassModel = require(path.join(__dirname, '..', 'models', 'classModel.cjs'));
const Attendance = require(path.join(__dirname, '..', 'models', 'attendanceModel.cjs'));

async function clearCollections() {
  await Promise.all([
    Instructor.deleteMany({}),
    Package.deleteMany({}),
    Customer.deleteMany({}),
    ClassModel.deleteMany({}),
    Attendance.deleteMany({}),
  ]);
}

function makeInstructors() {
  return [
    { instructorId: 'I001', firstname: 'John', lastname: 'Doe', email: 'john@yoga.com', phone: '123-456-7890', address: '10 Main Street, City', preferredContact: 'email' },
    { instructorId: 'I002', firstname: 'Jane', lastname: 'Lee', email: 'jane@yoga.com', phone: '345-678-9900', address: '11 Healthy Ave, City', preferredContact: 'phone' },
    { instructorId: 'I003', firstname: 'Priya', lastname: 'Patel', email: 'priya@yoga.com', phone: '222-111-3333', address: '22 Lotus Rd, City', preferredContact: 'email' },
    { instructorId: 'I004', firstname: 'Marco', lastname: 'Rossi', email: 'marco@yoga.com', phone: '777-888-9999', address: '7 Sunrise Blvd, City', preferredContact: 'phone' },
    { instructorId: 'I005', firstname: 'Ava', lastname: 'Nguyen', email: 'ava@yoga.com', phone: '444-222-1111', address: '5 Zen Way, City', preferredContact: 'email' },
    // Demo Tour spotlight instructor
    { instructorId: 'I100', firstname: 'Tour', lastname: 'Teacher', email: 'tour.teacher@yoga.com', phone: '555-000-1000', address: '100 Demo Ln, City', preferredContact: 'email' },
  ];
}

function makePackages() {
  return [
    { packageId: 'P001', packageName: '4 Class Pass', description: 'Valid for 1 month', price: 70.00 },
    { packageId: 'S001', packageName: '4 Class Pass (Senior)', description: 'Valid for 1 month', price: 60.00 },
    { packageId: 'P002', packageName: '10 Class Pass', description: 'Valid for 3 months', price: 140.00 },
    { packageId: 'S002', packageName: '10 Class Pass (Senior)', description: 'Valid for 3 months', price: 120.00 },
    { packageId: 'P003', packageName: '3 Months Unlimited', description: 'Valid for 3 months', price: 400.00 },
    { packageId: 'S003', packageName: '3 Months Unlimited (Senior)', description: 'Valid for 3 months', price: 360.00 },
    // Demo Tour package
    { packageId: 'T001', packageName: 'Tour - Sample Package', description: 'For demo tour showcase', price: 99.00 },
  ];
}

function makeCustomers() {
  return [
    { customerId: 'Y001', firstName: 'Sara', lastName: 'Doe', email: 'sara@yoga.com', phone: '555-789-0001', senior: false, address: '1 Awesome Blvd, City', preferredContact: 'phone', classBalance: 2 },
    { customerId: 'Y002', firstName: 'Sam', lastName: 'Smith', email: 'sam@yoga.com', phone: '234-567-8900', senior: true, address: '234 Sesame St, City', preferredContact: 'email', classBalance: 9 },
    { customerId: 'Y003', firstName: 'Emily', lastName: 'Park', email: 'emily@yoga.com', phone: '555-000-2222', senior: false, address: '300 Maple Ave, City', preferredContact: 'email', classBalance: 5 },
    { customerId: 'Y004', firstName: 'David', lastName: 'Kim', email: 'david@yoga.com', phone: '555-111-3333', senior: false, address: '55 River Rd, City', preferredContact: 'phone', classBalance: 0 },
    { customerId: 'Y005', firstName: 'Olivia', lastName: 'Brown', email: 'olivia@yoga.com', phone: '555-444-6666', senior: true, address: '12 Pine St, City', preferredContact: 'email', classBalance: 12 },
    // Demo Tour customer
    { customerId: 'Y100', firstName: 'Tour', lastName: 'Tester', email: 'tour.tester@yoga.com', phone: '555-000-0100', senior: false, address: '100 Demo Ln, City', preferredContact: 'email', classBalance: 3 },
  ];
}

function makeClasses() {
  return [
    {
      classId: 'A001',
      className: 'Breath Work',
      instructorId: 'I001',
      classType: 'General',
      description: 'A beginners class for pranayama',
      daytime: [
        { day: 'Mon', time: '09:00:00', duration: 45 },
        { day: 'Wed', time: '09:00:00', duration: 45 },
        { day: 'Fri', time: '09:00:00', duration: 45 },
      ],
    },
    {
      classId: 'A002',
      className: 'Yoga with Weights',
      instructorId: 'I002',
      classType: 'Special',
      description: 'Advanced class for building strength',
      daytime: [
        { day: 'Tue', time: '16:00:00', duration: 60 },
        { day: 'Thu', time: '16:00:00', duration: 60 },
      ],
    },
    {
      classId: 'A003',
      className: 'Gentle Flow',
      instructorId: 'I003',
      classType: 'General',
      description: 'Slow-paced, restorative flow for all levels',
      daytime: [
        { day: 'Mon', time: '18:00:00', duration: 60 },
        { day: 'Sat', time: '10:00:00', duration: 60 },
      ],
    },
    {
      classId: 'A004',
      className: 'Power Vinyasa',
      instructorId: 'I004',
      classType: 'Special',
      description: 'Dynamic class to build heat and strength',
      daytime: [
        { day: 'Tue', time: '07:00:00', duration: 60 },
        { day: 'Thu', time: '07:00:00', duration: 60 },
      ],
    },
    {
      classId: 'A005',
      className: 'Prenatal Yoga',
      instructorId: 'I005',
      classType: 'General',
      description: 'Supportive practice for expecting mothers',
      daytime: [
        { day: 'Sun', time: '11:00:00', duration: 60 },
      ],
    },
    // Demo Tour class
    {
      classId: 'A100',
      className: 'Tour Class',
      instructorId: 'I100',
      classType: 'General',
      description: 'Highlighted class for demo tour',
      daytime: [
        { day: 'Tue', time: '12:00:00', duration: 45 },
        { day: 'Thu', time: '12:00:00', duration: 45 },
      ],
    },
  ];
}

function makeAttendances() {
  // Use simple YYYY-MM-DD strings for consistency with UI
  return [
    { checkinId: 1, customerId: 'Y001', classId: 'A001', datetime: '2025-05-05', status: 'checked-in' },
    { checkinId: 2, customerId: 'Y001', classId: 'A002', datetime: '2025-05-07', status: 'checked-in' },
    { checkinId: 3, customerId: 'Y002', classId: 'A002', datetime: '2025-05-15', status: 'checked-in' },
    { checkinId: 4, customerId: 'Y003', classId: 'A003', datetime: '2025-05-16', status: 'cancelled' },
    { checkinId: 5, customerId: 'Y005', classId: 'A004', datetime: '2025-05-17', status: 'no-show' },
    // Demo Tour spotlight attendances for Y100 in A100
    { checkinId: 6, customerId: 'Y100', classId: 'A100', datetime: '2025-06-01', status: 'checked-in' },
    { checkinId: 7, customerId: 'Y100', classId: 'A100', datetime: '2025-06-08', status: 'checked-in' },
    { checkinId: 8, customerId: 'Y100', classId: 'A100', datetime: '2025-06-15', status: 'checked-in' },
    { checkinId: 9, customerId: 'Y100', classId: 'A100', datetime: '2025-06-22', status: 'cancelled' },
    { checkinId: 10, customerId: 'Y100', classId: 'A100', datetime: '2025-06-29', status: 'no-show' },
    // Recent check-in to make stats feel fresh
    { checkinId: 11, customerId: 'Y002', classId: 'A002', datetime: '2025-10-12', status: 'checked-in' },
  ];
}

async function seed() {
  try {
    // Parse module arg
    const arg = process.argv.find(a => a.startsWith('--module='));
    const moduleArg = arg ? arg.split('=')[1] : 'all';
    const valid = ['all','instructor','package','customer','class','attendance'];
    if (!valid.includes(moduleArg)) {
      console.error('❌ Invalid --module value. Use one of:', valid.join(', '));
      process.exit(1);
    }

    if (moduleArg === 'all') {
      console.log('🧹 Clearing collections...');
      await clearCollections();
      console.log('👨‍🏫 Seeding instructors...');
      await Instructor.insertMany(makeInstructors());
      console.log('📦 Seeding packages...');
      await Package.insertMany(makePackages());
      console.log('👥 Seeding customers...');
      await Customer.insertMany(makeCustomers());
      console.log('� Seeding classes...');
      await ClassModel.insertMany(makeClasses());
      console.log('✅ Seeding attendance...');
      await Attendance.insertMany(makeAttendances());
    } else if (moduleArg === 'instructor') {
      console.log('🧹 Clearing instructors...');
      await Instructor.deleteMany({});
      console.log('�👨‍🏫 Seeding instructors...');
      await Instructor.insertMany(makeInstructors());
    } else if (moduleArg === 'package') {
      console.log('🧹 Clearing packages...');
      await Package.deleteMany({});
      console.log('📦 Seeding packages...');
      await Package.insertMany(makePackages());
    } else if (moduleArg === 'customer') {
      console.log('🧹 Clearing customers...');
      await Customer.deleteMany({});
      console.log('👥 Seeding customers...');
      await Customer.insertMany(makeCustomers());
    } else if (moduleArg === 'class') {
      console.log('🧹 Clearing classes...');
      await ClassModel.deleteMany({});
      console.log('📅 Seeding classes...');
      await ClassModel.insertMany(makeClasses());
    } else if (moduleArg === 'attendance') {
      console.log('🧹 Clearing attendance...');
      await Attendance.deleteMany({});
      console.log('✅ Seeding attendance...');
      await Attendance.insertMany(makeAttendances());
    }

    console.log('🎉 Seed completed successfully.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
