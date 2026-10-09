import mongoose from 'mongoose';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Staff from '../models/staff.model.js';
import FeeInvoice from '../models/feeInvoice.model.js';
import Book from '../models/book.model.js';
import Vehicle from '../models/vehicle.model.js';
import Hostel from '../models/hostel.model.js';
import InventoryItem from '../models/inventoryItem.model.js';
import Event from '../models/event.model.js';
import Notice from '../models/notice.model.js';
import Meeting from '../models/meeting.model.js';
import Attendance from '../models/attendance.model.js';
import PayrollPayslip from '../models/payrollPayslip.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Global Multi-Entity Search Engine
 * RBAC & Tenant Isolation Enforced
 */
export const globalSearch = async (req, res) => {
  try {
    const { q, category } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const userRole = req.user?.role || 'STUDENT';

    if (!q || q.trim().length < 2) {
      return sendError(res, 'Search query must be at least 2 characters long', null, 400);
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const results = {
      students: [],
      teachers: [],
      staff: [],
      fees: [],
      books: [],
      vehicles: [],
      hostels: [],
      inventory: [],
      events: [],
      notices: [],
      meetings: [],
    };

    if (mongoose.connection.readyState === 1) {
      // Execute scoped queries in parallel
      const [
        students,
        teachers,
        staff,
        fees,
        books,
        vehicles,
        hostels,
        inventory,
        events,
        notices,
        meetings,
      ] = await Promise.all([
        !category || category === 'STUDENT'
          ? Student.find({ schoolId, $or: [{ name: searchRegex }, { admissionNumber: searchRegex }, { rollNumber: searchRegex }] }).limit(10)
          : [],
        !category || category === 'TEACHER'
          ? Teacher.find({ schoolId, $or: [{ name: searchRegex }, { employeeId: searchRegex }] }).limit(10)
          : [],
        !category || category === 'STAFF'
          ? Staff.find({ schoolId, $or: [{ name: searchRegex }, { employeeId: searchRegex }] }).limit(10)
          : [],
        (!category || category === 'FINANCE') && ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'].includes(userRole)
          ? FeeInvoice.find({ schoolId, invoiceNumber: searchRegex }).limit(10)
          : [],
        !category || category === 'LIBRARY'
          ? Book.find({ schoolId, $or: [{ title: searchRegex }, { author: searchRegex }, { accessionNumber: searchRegex }] }).limit(10)
          : [],
        !category || category === 'TRANSPORT'
          ? Vehicle.find({ schoolId, vehicleNumber: searchRegex }).limit(10)
          : [],
        !category || category === 'HOSTEL'
          ? Hostel.find({ schoolId, hostelName: searchRegex }).limit(10)
          : [],
        !category || category === 'INVENTORY'
          ? InventoryItem.find({ schoolId, $or: [{ itemName: searchRegex }, { itemCode: searchRegex }] }).limit(10)
          : [],
        !category || category === 'EVENTS'
          ? Event.find({ schoolId, title: searchRegex }).limit(10)
          : [],
        !category || category === 'NOTICES'
          ? Notice.find({ schoolId, title: searchRegex }).limit(10)
          : [],
        !category || category === 'MEETINGS'
          ? Meeting.find({ schoolId, $or: [{ title: searchRegex }, { roomCode: searchRegex }] }).limit(10)
          : [],
      ]);

      results.students = students;
      results.teachers = teachers;
      results.staff = staff;
      results.fees = fees;
      results.books = books;
      results.vehicles = vehicles;
      results.hostels = hostels;
      results.inventory = inventory;
      results.events = events;
      results.notices = notices;
      results.meetings = meetings;

      return sendSuccess(res, 'Global search results fetched successfully', results);
    }

    return sendSuccess(res, 'Global search results fetched (Dev Mode)', results);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Comprehensive System Analytics & Module Reports
 */
export const getReportsData = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { moduleType, startDate, endDate } = req.query;

    if (mongoose.connection.readyState === 1) {
      let reportPayload = {};

      if (moduleType === 'STUDENT') {
        const total = await Student.countDocuments({ schoolId });
        const active = await Student.countDocuments({ schoolId, isActive: true });
        reportPayload = { module: 'STUDENT', totalStudents: total, activeStudents: active };
      } else if (moduleType === 'FINANCE') {
        const invoices = await FeeInvoice.find({ schoolId });
        const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
        const totalPending = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
        reportPayload = { module: 'FINANCE', invoiceCount: invoices.length, totalCollected, totalPending };
      } else if (moduleType === 'HR') {
        const totalTeachers = await Teacher.countDocuments({ schoolId });
        const totalStaff = await Staff.countDocuments({ schoolId });
        const payslips = await PayrollPayslip.find({ schoolId });
        const totalDisbursed = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);
        reportPayload = { module: 'HR', totalTeachers, totalStaff, totalPayrollDisbursed: totalDisbursed };
      } else {
        // Overview Summary of All Modules
        const [students, teachers, staff, books, vehicles, hostels, items] = await Promise.all([
          Student.countDocuments({ schoolId }),
          Teacher.countDocuments({ schoolId }),
          Staff.countDocuments({ schoolId }),
          Book.countDocuments({ schoolId }),
          Vehicle.countDocuments({ schoolId }),
          Hostel.countDocuments({ schoolId }),
          InventoryItem.countDocuments({ schoolId }),
        ]);

        reportPayload = {
          overview: true,
          students,
          teachers,
          staff,
          books,
          vehicles,
          hostels,
          items,
        };
      }

      return sendSuccess(res, 'Report data generated successfully', reportPayload);
    }

    return sendSuccess(res, 'Report data generated (Dev Mode)', { overview: true, students: 0, teachers: 0 });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Export Server-Side CSV Data Report
 */
export const exportReportCSV = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { moduleType } = req.query;

    let csvContent = 'ID,Name,Type,Status,Date\n';

    if (mongoose.connection.readyState === 1) {
      if (moduleType === 'STUDENT') {
        const students = await Student.find({ schoolId }).limit(100);
        csvContent = 'AdmissionNo,Name,RollNo,Gender,Status\n';
        students.forEach((s) => {
          csvContent += `"${s.admissionNumber}","${s.name}","${s.rollNumber || ''}","${s.gender || ''}","${s.status || 'ACTIVE'}"\n`;
        });
      } else if (moduleType === 'FINANCE') {
        const invoices = await FeeInvoice.find({ schoolId }).limit(100);
        csvContent = 'InvoiceNo,TotalAmount,PaidAmount,BalanceDue,Status\n';
        invoices.forEach((inv) => {
          csvContent += `"${inv.invoiceNumber}",${inv.totalAmount},${inv.paidAmount},${inv.balanceDue},"${inv.status}"\n`;
        });
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=school_report_${moduleType || 'general'}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};
