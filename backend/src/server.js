import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🌱 School Management ERP Server Running`);
    console.log(`📡 Endpoint: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Phase 1 Active - Eco Theme: White + Sky Blue + Green`);
    console.log(`==================================================`);
  });
};

startServer();
