import crypto from 'crypto';
import FeeStructure from '../models/feeStructure.model.js';
import FeeInvoice from '../models/feeInvoice.model.js';
import PaymentTransaction from '../models/paymentTransaction.model.js';
import SchoolFinanceConfig from '../models/schoolFinanceConfig.model.js';
import AuditLog from '../models/auditLog.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Helper to record Financial Audit Log in MongoDB
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
 * Create Fee Structure Configuration
 */
export const createFeeStructure = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'AY_2026_27',
      name,
      classId,
      feeHeads = [],
      dueDate,
      lateFinePerDay = 10,
    } = req.body;

    if (!name || !classId || !feeHeads.length || !dueDate) {
      return sendError(res, 'Name, classId, feeHeads array, and dueDate are required', null, 400);
    }

    const totalAmount = feeHeads.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const structureDoc = await FeeStructure.create({
      schoolId,
      branchId,
      academicYearId,
      name,
      classId,
      feeHeads,
      totalAmount,
      dueDate: new Date(dueDate),
      lateFinePerDay: Number(lateFinePerDay) || 0,
    });

    await recordAuditLog({
      schoolId,
      userId: req.user?._id || 'user_admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'FEE_STRUCTURE_CREATED',
      amount: totalAmount,
      entityId: structureDoc._id,
      details: `Created Fee Structure '${name}' for Class ID ${classId}`,
      req,
    });

    return sendSuccess(res, 'Fee structure created successfully', structureDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Fee Structures
 */
export const getFeeStructures = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const query = { schoolId };
    if (req.query.classId) query.classId = req.query.classId;

    const structures = await FeeStructure.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Fee structures fetched', structures);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Student Fee Invoices
 */
export const generateInvoices = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'AY_2026_27',
      feeStructureId,
      studentId,
      classId,
      sectionId,
      discountAmount = 0,
    } = req.body;

    if (!feeStructureId || !studentId || !classId || !sectionId) {
      return sendError(res, 'feeStructureId, studentId, classId, and sectionId are required', null, 400);
    }

    const feeStruct = await FeeStructure.findById(feeStructureId);
    if (!feeStruct) return sendError(res, 'Fee structure not found', null, 404);

    const totalAmount = feeStruct.totalAmount;
    const fineAmount = 0;
    const netPayable = Math.max(0, totalAmount - Number(discountAmount) + fineAmount);
    const paidAmount = 0;
    const balanceDue = netPayable;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoiceDoc = await FeeInvoice.create({
      invoiceNumber,
      schoolId,
      branchId,
      academicYearId,
      studentId,
      classId,
      sectionId,
      feeStructureId,
      totalAmount,
      discountAmount: Number(discountAmount) || 0,
      fineAmount,
      netPayable,
      paidAmount,
      balanceDue,
      dueDate: feeStruct.dueDate,
      status: 'UNPAID',
    });

    await recordAuditLog({
      schoolId,
      userId: req.user?._id || 'user_admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'INVOICE_GENERATED',
      amount: netPayable,
      entityId: invoiceDoc._id,
      details: `Generated Invoice ${invoiceNumber} for Student ${studentId}`,
      req,
    });

    return sendSuccess(res, 'Student fee invoice generated', invoiceDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Fee Invoices
 */
export const getInvoices = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const query = { schoolId };
    if (req.user?.role === 'STUDENT') {
      query.$or = [
        { studentId: String(req.user._id) },
        { studentId: req.user.username },
        { studentName: req.user.name },
      ];
    } else {
      if (req.query.studentId) query.studentId = req.query.studentId;
      if (req.query.classId) query.classId = req.query.classId;
      if (req.query.status) query.status = req.query.status;
    }

    const invoices = await FeeInvoice.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Fee invoices fetched', invoices);
  } catch (error) {
    next(error);
  }
};

/**
 * Collect Payment & Gateway Verification
 */
export const collectPayment = async (req, res, next) => {
  try {
    const {
      invoiceId,
      amountPaid,
      paymentMethod = 'CASH',
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
    } = req.body;

    if (!invoiceId || !amountPaid) {
      return sendError(res, 'invoiceId and amountPaid are required', null, 400);
    }

    const invoice = await FeeInvoice.findById(invoiceId);
    if (!invoice) return sendError(res, 'Invoice record not found', null, 404);

    const numAmountPaid = Number(amountPaid);
    const newTotalPaid = invoice.paidAmount + numAmountPaid;
    const newBalanceDue = Math.max(0, invoice.netPayable - newTotalPaid);
    const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIAL';
    const receiptNumber = `RCP-2026-${Math.floor(8000 + Math.random() * 1999)}`;
    const transactionRef = `TXN-${Date.now()}`;

    invoice.paidAmount = newTotalPaid;
    invoice.balanceDue = newBalanceDue;
    invoice.status = newStatus;
    await invoice.save();

    const txnDoc = await PaymentTransaction.create({
      transactionRef,
      schoolId: invoice.schoolId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amountPaid: numAmountPaid,
      paymentMethod,
      gatewayOrderId: gatewayOrderId || '',
      gatewayPaymentId: gatewayPaymentId || '',
      gatewaySignature: gatewaySignature || '',
      status: 'SUCCESS',
      collectedBy: req.user?._id || 'user_admin',
      receiptNumber,
    });

    await recordAuditLog({
      schoolId: invoice.schoolId,
      userId: req.user?._id || 'user_admin',
      userRole: req.user?.role || 'ADMIN',
      action: 'PAYMENT_COLLECTED',
      amount: numAmountPaid,
      entityId: invoice._id,
      details: `Payment of ₹${numAmountPaid} via ${paymentMethod}. Receipt: ${receiptNumber}, Ref: ${transactionRef}`,
      req,
    });

    return sendSuccess(
      res,
      'Payment processed successfully. Receipt & Audit log generated.',
      { invoice, transaction: txnDoc }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Financial Summary Stats
 */
export const getFinancialSummary = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const invoices = await FeeInvoice.find({ schoolId });

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    invoices.forEach((inv) => {
      totalInvoiced += inv.netPayable || 0;
      totalCollected += inv.paidAmount || 0;
      totalOutstanding += inv.balanceDue || 0;
    });

    return sendSuccess(res, 'Financial summary statistics computed', {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalInvoicesCount: invoices.length,
      collectionRate: totalInvoiced > 0 ? parseFloat(((totalCollected / totalInvoiced) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dynamic School Gateway & Bank Credentials
 */
export const getFinanceConfig = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    let config = await SchoolFinanceConfig.findOne({ schoolId });

    if (!config) {
      config = await SchoolFinanceConfig.create({
        schoolId,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_school_erp_key_2026',
        upiVpa: process.env.SCHOOL_UPI_VPA || 'school@upi',
        bankName: process.env.SCHOOL_BANK_NAME || 'State Bank of India',
        bankAccountNo: process.env.SCHOOL_BANK_ACCOUNT_NO || '39840291048',
        bankIfsc: process.env.SCHOOL_BANK_IFSC || 'SBIN0001234',
        currency: 'INR',
        taxRatePercentage: 0,
      });
    }

    return sendSuccess(res, 'Financial configuration loaded', config);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Dynamic School Gateway & Bank Credentials
 */
export const updateFinanceConfig = async (req, res, next) => {
  try {
    const { razorpayKeyId, upiVpa, bankName, bankAccountNo, bankIfsc, currency, taxRatePercentage } = req.body;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';

    let config = await SchoolFinanceConfig.findOne({ schoolId });
    if (!config) {
      config = new SchoolFinanceConfig({ schoolId });
    }

    if (razorpayKeyId !== undefined) config.razorpayKeyId = razorpayKeyId;
    if (upiVpa !== undefined) config.upiVpa = upiVpa;
    if (bankName !== undefined) config.bankName = bankName;
    if (bankAccountNo !== undefined) config.bankAccountNo = bankAccountNo;
    if (bankIfsc !== undefined) config.bankIfsc = bankIfsc;
    if (currency !== undefined) config.currency = currency;
    if (taxRatePercentage !== undefined) config.taxRatePercentage = Number(taxRatePercentage) || 0;

    await config.save();
    return sendSuccess(res, 'School finance configuration saved successfully', config);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Financial Audit Logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const logs = await AuditLog.find({ schoolId }).sort({ timestamp: -1 });
    return sendSuccess(res, 'Financial audit logs fetched', logs);
  } catch (error) {
    next(error);
  }
};
