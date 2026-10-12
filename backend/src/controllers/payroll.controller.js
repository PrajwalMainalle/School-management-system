import SalaryStructure from '../models/salaryStructure.model.js';
import PayrollPayslip from '../models/payrollPayslip.model.js';
import AuditLog from '../models/auditLog.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Helper to record Financial Audit Log
 */
const recordAuditLog = async ({ schoolId, userId, userRole, action, amount, entityId, details, req }) => {
  const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
  try {
    await AuditLog.create({
      schoolId: schoolId || 'SCHOOL_MAIN',
      userId: userId || 'user_admin',
      userRole: userRole || 'ADMIN',
      action,
      amount: amount || 0,
      entityId,
      details: details || '',
      ipAddress,
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }
};

/**
 * Create or Update Staff Salary Structure
 */
export const createSalaryStructure = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
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
      return sendError(res, 'staffId and basicPay are required', null, 400);
    }

    const structDoc = await SalaryStructure.findOneAndUpdate(
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

    return sendSuccess(res, 'Staff salary structure configured successfully', structDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Salary Structures List
 */
export const getSalaryStructures = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const query = { schoolId };
    if (req.query.staffId) query.staffId = req.query.staffId;

    const list = await SalaryStructure.find(query);
    return sendSuccess(res, 'Salary structures fetched', list);
  } catch (error) {
    next(error);
  }
};

/**
 * Backend Payroll Processor
 */
export const processMonthlyPayroll = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      month = 10,
      year = 2026,
      staffId = 'tch_101',
      totalWorkingDays = 26,
      lopDays = 0,
    } = req.body;

    const salaryStruct = await SalaryStructure.findOne({ staffId });
    if (!salaryStruct) {
      return sendError(res, `Salary structure not configured for staff ${staffId}`, null, 404);
    }

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

    const dailyRate = numWorkingDays > 0 ? basicPay / numWorkingDays : 0;
    const lopDeduction = parseFloat((numLopDays * dailyRate).toFixed(2));

    const pfDeduction = parseFloat(((basicPay * (salaryStruct.pfPercentage || 12)) / 100).toFixed(2));
    const ptDeduction = Number(salaryStruct.professionalTax) || 0;
    const tdsDeduction = Number(salaryStruct.tdsAmount) || 0;

    const totalDeductions = parseFloat((lopDeduction + pfDeduction + ptDeduction + tdsDeduction).toFixed(2));
    const netSalary = Math.max(0, parseFloat((grossSalary - totalDeductions).toFixed(2)));

    const payslipNumber = `PAY-${year}-${month}-${staffId}`;

    const payslipDoc = await PayrollPayslip.findOneAndUpdate(
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

    return sendSuccess(
      res,
      'Monthly payroll processed with server-side LOP & deductions calculation',
      payslipDoc,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Disburse Monthly Salary & Audit Log
 */
export const disbursePayslip = async (req, res, next) => {
  try {
    const { payslipId } = req.params;
    const { paymentMethod = 'BANK_TRANSFER' } = req.body;
    const transactionRef = `SAL-TXN-${Date.now()}`;

    const payslip = await PayrollPayslip.findByIdAndUpdate(
      payslipId,
      {
        status: 'DISBURSED',
        paymentMethod,
        transactionRef,
        disbursedAt: new Date(),
      },
      { new: true }
    );
    if (!payslip) return sendError(res, 'Payslip not found', null, 404);

    await recordAuditLog({
      schoolId: payslip.schoolId,
      userId: req.user?._id || 'user_admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'PAYMENT_COLLECTED',
      amount: payslip.netSalary,
      entityId: payslip._id,
      details: `Disbursed Net Salary of ₹${payslip.netSalary} to Staff ${payslip.staffId} via ${paymentMethod}. Ref: ${transactionRef}`,
      req,
    });

    return sendSuccess(res, 'Salary disbursed successfully & audit log generated', payslip);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payslips List
 */
export const getPayslips = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const { month, year, staffId } = req.query;

    const query = { schoolId };
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (staffId) query.staffId = staffId;

    const list = await PayrollPayslip.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Payroll payslips fetched', list);
  } catch (error) {
    next(error);
  }
};
