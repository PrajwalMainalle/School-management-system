import mongoose from 'mongoose';
import School from '../models/school.model.js';
import Branch from '../models/branch.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Staff from '../models/staff.model.js';
import Attendance from '../models/attendance.model.js';
import FeeInvoice from '../models/feeInvoice.model.js';
import Book from '../models/book.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSchoolInfo = async (req, res, next) => {
  try {
    let school = null;
    if (req.user?.schoolId) {
      if (mongoose.Types.ObjectId.isValid(req.user.schoolId)) {
        school = await School.findById(req.user.schoolId);
      }
      if (!school) {
        school = await School.findOne({ code: req.user.schoolId });
      }
    }
    if (!school) {
      school = await School.findOne();
    }
    return sendSuccess(res, 'School details fetched', { school });
  } catch (error) {
    next(error);
  }
};

export const getBranches = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branches = await Branch.find({ schoolId });
    return sendSuccess(res, 'Branches fetched', { branches });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';

    const [totalStudents, totalTeachers, totalStaff, totalBooks] = await Promise.all([
      Student.countDocuments({ schoolId }),
      Teacher.countDocuments({ schoolId }),
      Staff.countDocuments({ schoolId }),
      Book.countDocuments({ schoolId }).catch(() => 0),
    ]);

    let attendanceRate = '0%';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await Attendance.find({
      schoolId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (logs.length > 0) {
      const present = logs.filter((l) => l.status === 'PRESENT').length;
      attendanceRate = `${((present / logs.length) * 100).toFixed(1)}%`;
    }

    const invoices = await FeeInvoice.find({ schoolId });
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    return sendSuccess(res, 'Dashboard summary metrics calculated from database', {
      totalStudents,
      totalTeachers,
      totalStaff,
      totalBooks,
      attendanceRate,
      totalCollected,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSchoolInfo = async (req, res, next) => {
  try {
    const { name, code, email, phone, slogan, boardAffiliation, address } = req.body;
    let school = await School.findOne();

    if (!school) {
      school = new School({ code: code || 'SCH', name: name || 'Main Educational Institution' });
    }

    if (name) school.name = name;
    if (code) school.code = code;
    if (email) school.email = email;
    if (phone) school.phone = phone;
    if (slogan) school.slogan = slogan;
    if (boardAffiliation) school.boardAffiliation = boardAffiliation;
    if (address) school.address = address;

    await school.save();
    return sendSuccess(res, 'School profile settings updated successfully', { school });
  } catch (err) {
    next(err);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const { branchName, branchCode, phone, isMainBranch, address } = req.body;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';

    if (!branchName || !branchCode) {
      return sendError(res, 'Branch name and branch code are required', null, 400);
    }

    if (isMainBranch) {
      await Branch.updateMany({ schoolId }, { isMainBranch: false });
    }

    const branch = await Branch.create({
      schoolId,
      branchName,
      branchCode,
      phone: phone || '',
      isMainBranch: !!isMainBranch,
      address: address || {},
    });

    return sendSuccess(res, 'Branch created successfully', { branch }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { branchName, branchCode, phone, isMainBranch, isActive } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) return sendError(res, 'Branch not found', null, 404);

    if (branchName) branch.branchName = branchName;
    if (branchCode) branch.branchCode = branchCode;
    if (phone !== undefined) branch.phone = phone;
    if (isMainBranch !== undefined) {
      if (isMainBranch) {
        await Branch.updateMany({ schoolId: branch.schoolId }, { isMainBranch: false });
      }
      branch.isMainBranch = isMainBranch;
    }
    if (isActive !== undefined) branch.isActive = isActive;

    await branch.save();
    return sendSuccess(res, 'Branch updated successfully', { branch });
  } catch (err) {
    next(err);
  }
};
