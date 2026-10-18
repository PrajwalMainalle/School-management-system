import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 2,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Event] Disconnected from database cluster. Attempting to reconnect...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB Event] Reconnected to database successfully.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Event] Database connection error:', err.message);
    });

    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB instance: ${error.message}`);
    console.warn(`[MongoDB Info] Application running in detached database mode for Phase 1 API verification.`);
    return false;
  }
};
