import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

export const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const healthData = {
    system: 'School ERP API',
    status: 'ONLINE',
    phase: 'Phase 1 - Project Foundation',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    theme: 'Eco-Friendly (White + Sky Blue + Natural Green)',
    slogan: '🌱 Learn • Grow • Protect 💧',
    supportedLanguages: ['en', 'kn'],
    databaseStatus: dbStatusMap[dbState] || 'Unknown',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  return sendSuccess(res, 'School ERP System API is operational', healthData);
};
