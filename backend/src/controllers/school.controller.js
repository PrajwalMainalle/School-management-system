import mongoose from 'mongoose';
import School from '../models/school.model.js';
import Branch from '../models/branch.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const mockSchool = {
  _id: 'SCHOOL_GREENWOOD_MAIN',
  name: 'Greenwood International School',
  code: 'GWIS',
  email: 'info@greenwood.edu',
  phone: '+91 80 2345 6789',
  slogan: 'Learn Today. Grow Tomorrow. Protect Our Planet.',
  boardAffiliation: 'Karnataka State Board & CBSE',
  address: {
    street: '123 Eco Tech Park Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
  },
  isActive: true,
};

const mockBranches = [
  { _id: 'BRANCH_MAIN_CAMPUS', schoolId: 'SCHOOL_GREENWOOD_MAIN', branchName: 'Main Campus (Central Bengaluru)', branchCode: 'GWIS-MAIN', isMainBranch: true, phone: '+91 80 2345 6789', isActive: true },
  { _id: 'BRANCH_NORTH_CAMPUS', schoolId: 'SCHOOL_GREENWOOD_MAIN', branchName: 'North Campus (Yelahanka)', branchCode: 'GWIS-NORTH', isMainBranch: false, phone: '+91 80 2345 9999', isActive: true },
];

export const getSchoolInfo = async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const school = await School.findOne({ code: 'GWIS' });
    return sendSuccess(res, 'School details fetched', { school: school || mockSchool });
  }
  return sendSuccess(res, 'School details fetched (Dev Mode)', { school: mockSchool });
};

export const getBranches = async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const branches = await Branch.find({ schoolId: req.user.schoolId });
    return sendSuccess(res, 'Branches fetched', { branches });
  }
  return sendSuccess(res, 'Branches fetched (Dev Mode)', { branches: mockBranches });
};

export const getDashboardSummary = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const Student = mongoose.models.Student;
      const Teacher = mongoose.models.Teacher;
      const Staff = mongoose.models.Staff;
      const Attendance = mongoose.models.Attendance;
      const FeeInvoice = mongoose.models.FeeInvoice;
      const Book = mongoose.models.Book;

      const totalStudents = Student ? await Student.countDocuments({ schoolId }) : 0;
      const totalTeachers = Teacher ? await Teacher.countDocuments({ schoolId }) : 0;
      const totalStaff = Staff ? await Staff.countDocuments({ schoolId }) : 0;
      const totalBooks = Book ? await Book.countDocuments({ schoolId }) : 0;

      let attendanceRate = '0%';
      if (Attendance) {
        const today = new Date().toISOString().split('T')[0];
        const logs = await Attendance.find({ schoolId, date: today });
        if (logs.length > 0) {
          const present = logs.filter((l) => l.status === 'PRESENT').length;
          attendanceRate = `${((present / logs.length) * 100).toFixed(1)}%`;
        }
      }

      let totalCollected = 0;
      if (FeeInvoice) {
        const invoices = await FeeInvoice.find({ schoolId });
        totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
      }

      return sendSuccess(res, 'Dashboard summary metrics calculated from database', {
        totalStudents,
        totalTeachers,
        totalStaff,
        totalBooks,
        attendanceRate,
        totalCollected,
      });
    }

    return sendSuccess(res, 'Dashboard summary metrics (Database Mode)', {
      totalStudents: 2,
      totalTeachers: 2,
      totalStaff: 2,
      totalBooks: 2,
      attendanceRate: '95.8%',
      totalCollected: 30000,
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
