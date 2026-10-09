import mongoose from 'mongoose';
import SalaryStructure from '../models/salaryStructure.model.js';
import PayrollPayslip from '../models/payrollPayslip.model.js';
import AuditLog from '../models/auditLog.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Dev Fallback Stores (Empty by default for real user data)
let mockSalaryStructures = [];
let mockPayslips = [];

/**
 * Helper to record Financial Audit Log
 */
const recordAuditLog = async ({ schoolId, userId, userRole, action, amount, entityId, details, req }) => {
  const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
  if (mongoose.connection.readyState === 1) {
    await AuditLog.create({
      schoolId: schoolId || 'SCHOOL_GREENWOOD_MAIN',
      userId: userId || 'user_admin',
      userRole: userRole || 'ADMIN',
      action,
      amount: amount || 0,
      entityId,
      details: details || '',
      ipAddress,
    });
  } else {
    // In-Memory Dev fallback log
  }
};

/**
 * Create or Update Staff Salary Structure
 */
export const createSalaryStructure = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      staffId,
      basicPay,
      hra = 0,
      transportAllowance = 0,
      medicalAllowance = 0,
      specialAllowance = 0,
      pfPercentage = 12,
      professionalTax = 200,
      tdsAmount = 0,
    } = req.body;

    if (!staffId || basicPay === undefined) {
      return sendError(res, 'staffId and basicPay are required', 400);
    }

    let structDoc;
    if (mongoose.connection.readyState === 1) {
      structDoc = await SalaryStructure.findOneAndUpdate(
        { staffId },
        {
          schoolId,
          basicPay: Number(basicPay),
          hra: Number(hra),
          transportAllowance: Number(transportAllowance),
          medicalAllowance: Number(medicalAllowance),
          specialAllowance: Number(specialAllowance),
          pfPercentage: Number(pfPercentage),
          professionalTax: Number(professionalTax),
          tdsAmount: Number(tdsAmount),
        },
        { upsert: true, new: true }
      );
    } else {
      const existingIdx = mockSalaryStructures.findIndex((s) => s.staffId === staffId);
      structDoc = {
        _id: existingIdx !== -1 ? mockSalaryStructures[existingIdx]._id : `sal_${Date.now()}`,
        schoolId,
        staffId,
        basicPay: Number(basicPay),
        hra: Number(hra),
        transportAllowance: Number(transportAllowance),
        medicalAllowance: Number(medicalAllowance),
        specialAllowance: Number(specialAllowance),
        pfPercentage: Number(pfPercentage),
        professionalTax: Number(professionalTax),
        tdsAmount: Number(tdsAmount),
        createdAt: new Date().toISOString(),
      };
      if (existingIdx !== -1) mockSalaryStructures[existingIdx] = structDoc;
      else mockSalaryStructures.push(structDoc);
    }

    return sendSuccess(res, 'Staff salary structure configured successfully', structDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Salary Structures List
 */
export const getSalaryStructures = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN', staffId } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { schoolId };
      if (staffId) query.staffId = staffId;
      const list = await SalaryStructure.find(query);
      return sendSuccess(res, 'Salary structures fetched', list);
    } else {
      let filtered = mockSalaryStructures.filter((s) => s.schoolId === schoolId);
      if (staffId) filtered = filtered.filter((s) => s.staffId === staffId);
      return sendSuccess(res, 'Salary structures fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * BACKEND PAYROLL PROCESSOR
 * Server-side calculation of Basic Pay, HRA, Allowances, LOP Deduction, PF, PT, TDS, and Net Salary
 */
export const processMonthlyPayroll = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      month = 10,
      year = 2026,
      staffId = 'tch_101',
      totalWorkingDays = 26,
      lopDays = 0,
    } = req.body;

    let salaryStruct;
    if (mongoose.connection.readyState === 1) {
      salaryStruct = await SalaryStructure.findOne({ staffId });
    } else {
      salaryStruct = mockSalaryStructures.find((s) => s.staffId === staffId);
    }

    if (!salaryStruct) {
      return sendError(res, `Salary structure not configured for staff ${staffId}`, 404);
    }

    // SERVER-SIDE PAYROLL CALCULATIONS
    const numWorkingDays = Number(totalWorkingDays) || 26;
    const numLopDays = Number(lopDays) || 0;
    const presentDays = Math.max(0, numWorkingDays - numLopDays);

    const basicPay = Number(salaryStruct.basicPay) || 0;
    const hra = Number(salaryStruct.hra) || 0;
    const allowances =
      (Number(salaryStruct.transportAllowance) || 0) +
      (Number(salaryStruct.medicalAllowance) || 0) +
      (Number(salaryStruct.specialAllowance) || 0);

    const grossSalary = basicPay + hra + allowances;

    // LOP Calculation server-side (Daily basic rate)
    const dailyRate = numWorkingDays > 0 ? basicPay / numWorkingDays : 0;
    const lopDeduction = parseFloat((numLopDays * dailyRate).toFixed(2));

    // Statutory & Tax Deductions
    const pfDeduction = parseFloat(((basicPay * (salaryStruct.pfPercentage || 12)) / 100).toFixed(2));
    const ptDeduction = Number(salaryStruct.professionalTax) || 0;
    const tdsDeduction = Number(salaryStruct.tdsAmount) || 0;

    const totalDeductions = parseFloat((lopDeduction + pfDeduction + ptDeduction + tdsDeduction).toFixed(2));
    const netSalary = Math.max(0, parseFloat((grossSalary - totalDeductions).toFixed(2)));

    const payslipNumber = `PAY-${year}-${month}-${staffId}`;

    let payslipDoc;
    if (mongoose.connection.readyState === 1) {
      payslipDoc = await PayrollPayslip.findOneAndUpdate(
        { schoolId, staffId, month, year },
        {
          payslipNumber,
          totalWorkingDays: numWorkingDays,
          presentDays,
          lopDays: numLopDays,
          basicPay,
          hra,
          allowances,
          grossSalary,
          lopDeduction,
          pfDeduction,
          ptDeduction,
          tdsDeduction,
          totalDeductions,
          netSalary,
          status: 'DRAFT',
        },
        { upsert: true, new: true }
      );
    } else {
      const existingIdx = mockPayslips.findIndex(
        (p) => p.staffId === staffId && p.month === Number(month) && p.year === Number(year)
      );
      payslipDoc = {
        _id: existingIdx !== -1 ? mockPayslips[existingIdx]._id : `ps_${Date.now()}`,
        payslipNumber,
        schoolId,
        staffId,
        month: Number(month),
        year: Number(year),
        totalWorkingDays: numWorkingDays,
        presentDays,
        lopDays: numLopDays,
        basicPay,
        hra,
        allowances,
        grossSalary,
        lopDeduction,
        pfDeduction,
        ptDeduction,
        tdsDeduction,
        totalDeductions,
        netSalary,
        status: 'DRAFT',
        paymentMethod: 'BANK_TRANSFER',
        transactionRef: '',
        createdAt: new Date().toISOString(),
      };
      if (existingIdx !== -1) mockPayslips[existingIdx] = payslipDoc;
      else mockPayslips.push(payslipDoc);
    }

    return sendSuccess(
      res,
      'Monthly payroll processed with server-side LOP & deductions calculation',
      payslipDoc,
      201
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Disburse Monthly Salary & Audit Log
 */
export const disbursePayslip = async (req, res) => {
  try {
    const { payslipId } = req.params;
    const { paymentMethod = 'BANK_TRANSFER' } = req.body;

    let payslip;
    const transactionRef = `SAL-TXN-${Date.now()}`;

    if (mongoose.connection.readyState === 1) {
      payslip = await PayrollPayslip.findByIdAndUpdate(
        payslipId,
        {
          status: 'DISBURSED',
          paymentMethod,
          transactionRef,
          disbursedAt: new Date(),
        },
        { new: true }
      );
      if (!payslip) return sendError(res, 'Payslip not found', 404);
    } else {
      const psIdx = mockPayslips.findIndex((p) => p._id === payslipId);
      if (psIdx === -1) return sendError(res, 'Payslip not found', 404);
      mockPayslips[psIdx] = {
        ...mockPayslips[psIdx],
        status: 'DISBURSED',
        paymentMethod,
        transactionRef,
        disbursedAt: new Date().toISOString(),
      };
      payslip = mockPayslips[psIdx];
    }

    // IMMUTABLE AUDIT LOG RECORDING
    await recordAuditLog({
      schoolId: payslip.schoolId,
      userId: req.user?.id || 'user_admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'PAYMENT_COLLECTED', // Payroll disbursement audit action
      amount: payslip.netSalary,
      entityId: payslip._id,
      details: `Disbursed Net Salary of ₹${payslip.netSalary} to Staff ${payslip.staffId} via ${paymentMethod}. Ref: ${transactionRef}`,
      req,
    });

    return sendSuccess(res, 'Salary disbursed successfully & audit log generated', payslip);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Payslips List
 */
export const getPayslips = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN', month, year, staffId } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { schoolId };
      if (month) query.month = Number(month);
      if (year) query.year = Number(year);
      if (staffId) query.staffId = staffId;

      const list = await PayrollPayslip.find(query).sort({ createdAt: -1 });
      return sendSuccess(res, 'Payroll payslips fetched', list);
    } else {
      let filtered = mockPayslips.filter((p) => p.schoolId === schoolId);
      if (month) filtered = filtered.filter((p) => p.month === Number(month));
      if (year) filtered = filtered.filter((p) => p.year === Number(year));
      if (staffId) filtered = filtered.filter((p) => p.staffId === staffId);

      return sendSuccess(res, 'Payroll payslips fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
