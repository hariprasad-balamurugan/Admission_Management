require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { Institution, Campus, Department } = require('../models/Institution');
const Program = require('../models/Program');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    await User.deleteMany({});
    await Institution.deleteMany({});
    await Campus.deleteMany({});
    await Department.deleteMany({});
    await Program.deleteMany({});
    console.log('Cleared existing data...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Admission Officer',
      email: 'officer@college.com',
      password: 'officer123',
      role: 'admission_officer',
    });

    await User.create({
      name: 'Management View',
      email: 'management@college.com',
      password: 'mgmt123',
      role: 'management',
    });
    console.log('✅ Created 3 users');

    const inst = await Institution.create({
      name: 'ABC Engineering College',
      code: 'ABCEC',
      address: 'Bangalore, Karnataka',
    });

    const campus = await Campus.create({
      name: 'Main Campus',
      institution: inst._id,
    });

    const csDept = await Department.create({
      name: 'Computer Science & Engineering',
      campus: campus._id,
    });

    const eceDept = await Department.create({
      name: 'Electronics & Communication Engineering',
      campus: campus._id,
    });
    console.log('✅ Created institution hierarchy');

    await Program.create({
      name: 'B.E. Computer Science',
      code: 'CSE',
      department: csDept._id,
      academicYear: '2026-27',
      courseType: 'UG',
      entryType: 'Regular',
      totalIntake: 120,
      quotas: [
        { name: 'KCET',       totalSeats: 60 },
        { name: 'COMEDK',     totalSeats: 30 },
        { name: 'Management', totalSeats: 30 },
      ],
      supernumerarySeats: 5,
    });

    await Program.create({
      name: 'B.E. Electronics & Communication',
      code: 'ECE',
      department: eceDept._id,
      academicYear: '2026-27',
      courseType: 'UG',
      entryType: 'Regular',
      totalIntake: 60,
      quotas: [
        { name: 'KCET',       totalSeats: 30 },
        { name: 'COMEDK',     totalSeats: 15 },
        { name: 'Management', totalSeats: 15 },
      ],
    });
    console.log('✅ Created 2 programs');

    console.log('\n🎉 Seed completed! You can now log in with:');
    console.log('   Admin:   admin@college.com     / admin123');
    console.log('   Officer: officer@college.com   / officer123');
    console.log('   Mgmt:    management@college.com / mgmt123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
