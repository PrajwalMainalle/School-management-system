import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';

dotenv.config();

/**
 * Database Seed Utility
 * No demo/development data is auto-seeded. Real users are registered dynamically.
 */
export const seedDatabase = async () => {
  // Empty seed - production ready without mock or demo records
  console.log('Database ready: No development data seeded.');
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].includes('seedUsers.js')) {
  seedDatabase().then(() => process.exit(0));
}
