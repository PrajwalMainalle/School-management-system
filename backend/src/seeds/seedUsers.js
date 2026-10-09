import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const demoUsers = [
  {
    name: 'SaaS Platform Organizer',
    email: 'organizer@schoolerp.com',
    username: 'organizer',
    password: 'Organizer@123',
    role: 'ORGANIZER',
    permissions: ['*'],
    languagePreference: 'en',
    schoolId: 'SAAS_PLATFORM_GLOBAL',
    branchId: 'GLOBAL',
  },
  {
    name: 'Prajwal Mainalle (School Owner)',
    email: 'superadmin@greenwood.edu',
    username: 'superadmin',
    password: 'SuperAdmin@123',
    role: 'SUPER_ADMIN',
    permissions: ['*'],
    languagePreference: 'en',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    name: 'Dr. Ramesh Kumar (Principal)',
    email: 'principal@greenwood.edu',
    username: 'principal',
    password: 'Principal@123',
    role: 'ADMIN',
    permissions: ['students:read', 'students:write', 'teachers:read', 'academics:write', 'notices:write'],
    languagePreference: 'kn',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    name: 'Anita Sharma (Senior Mathematics Teacher)',
    email: 'teacher@greenwood.edu',
    username: 'teacher',
    password: 'Teacher@123',
    role: 'TEACHER',
    permissions: ['attendance:write', 'homework:write', 'marks:write'],
    languagePreference: 'en',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    name: 'Vijay Gowda (Chief Accountant)',
    email: 'accountant@greenwood.edu',
    username: 'accountant',
    password: 'Staff@123',
    role: 'NON_TEACHING_STAFF',
    permissions: ['fees:read', 'fees:write', 'finance:read', 'finance:write'],
    languagePreference: 'kn',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    name: 'Rohan Patil (Grade 10 Student)',
    email: 'student@greenwood.edu',
    username: 'student',
    password: 'Student@123',
    role: 'STUDENT',
    permissions: ['student_portal:read'],
    languagePreference: 'en',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

export const seedDatabase = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.warn('DB not connected. Cannot run database seeding script.');
      return;
    }

    console.log('Seeding initial demo users for Phase 2...');
    for (const userData of demoUsers) {
      const exists = await User.findOne({ username: userData.username });
      if (!exists) {
        await User.create(userData);
        console.log(`+ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`= User already exists: ${userData.username}`);
      }
    }
    console.log('User Seeding Complete!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// If run directly from CLI
if (process.argv[1].includes('seedUsers.js')) {
  seedDatabase().then(() => process.exit(0));
}
