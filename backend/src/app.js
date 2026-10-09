import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import academicRoutes from './routes/academic.routes.js';
import schoolRoutes from './routes/school.routes.js';
import studentRoutes from './routes/student.routes.js';
import admissionRoutes from './routes/admission.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import staffRoutes from './routes/staff.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import homeworkRoutes from './routes/homework.routes.js';
import examRoutes from './routes/exam.routes.js';
import feeRoutes from './routes/fee.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import libraryRoutes from './routes/library.routes.js';
import transportRoutes from './routes/transport.routes.js';
import hostelRoutes from './routes/hostel.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import reportSearchRoutes from './routes/reportSearch.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/analytics', reportSearchRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'School ERP System API',
    phase: 'Phase 14 - Hostel Management',
    slogan: '🌱 Learn • Grow • Protect 💧',
    documentation: '/api/health',
  });
});

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
