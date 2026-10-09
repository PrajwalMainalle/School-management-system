import mongoose from 'mongoose';
import InventoryItem from '../models/inventoryItem.model.js';
import Supplier from '../models/supplier.model.js';
import StockTransaction from '../models/stockTransaction.model.js';
import Asset from '../models/asset.model.js';
import AuditLog from '../models/auditLog.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Dev Fallbacks
let mockItems = [];
let mockSuppliers = [];
let mockTransactions = [];
let mockAssets = [];

/**
 * Audit Logger Helper
 */
const logInventoryAudit = async (req, action, entity, entityId, metadata = {}) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        actorId: req.user?._id || 'SYSTEM',
        actorName: req.user?.name || 'System User',
        actorRole: req.user?.role || 'ADMIN',
        action,
        entity,
        entityId,
        schoolId: req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user?.branchId || 'GLOBAL',
        ipAddress: req.ip || '127.0.0.1',
        metadata,
      });
    }
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

/**
 * Get Inventory Items
 */
export const getItems = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { category, lowStock } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId };
      if (category) filter.category = category;
      let items = await InventoryItem.find(filter).sort({ itemName: 1 });

      if (lowStock === 'true') {
        items = items.filter((item) => item.currentStock <= item.minimumStock);
      }

      return sendSuccess(res, 'Inventory items fetched successfully', items);
    }

    let items = [...mockItems];
    if (category) items = items.filter((i) => i.category === category);
    if (lowStock === 'true') items = items.filter((i) => i.currentStock <= i.minimumStock);

    return sendSuccess(res, 'Inventory items fetched (Dev Mode)', items);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Inventory Item
 */
export const addItem = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const { itemName, itemCode, category, unit, openingStock, minimumStock, reorderLevel, unitPrice, supplierId, location } = req.body;

    if (!itemName || !itemCode || !unit) {
      return sendError(res, 'Item name, item code (SKU), and unit are required', null, 400);
    }

    const initialStock = Number(openingStock || 0);
    if (initialStock < 0) {
      return sendError(res, 'Opening stock cannot be negative', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const existing = await InventoryItem.findOne({ schoolId, itemCode: itemCode.trim() });
      if (existing) {
        return sendError(res, 'Item code (SKU) already exists in this school', null, 400);
      }

      let supplierName = '';
      if (supplierId) {
        const sup = await Supplier.findById(supplierId);
        if (sup) supplierName = sup.supplierName;
      }

      const item = await InventoryItem.create({
        schoolId,
        branchId,
        itemName: itemName.trim(),
        itemCode: itemCode.trim(),
        category: category || 'OTHER',
        unit,
        openingStock: initialStock,
        currentStock: initialStock,
        minimumStock: Number(minimumStock || 5),
        reorderLevel: Number(reorderLevel || 10),
        unitPrice: Number(unitPrice || 0),
        supplierId: supplierId || null,
        supplierName,
        location: location || 'Main Store',
      });

      await logInventoryAudit(req, 'CREATE_INVENTORY_ITEM', 'INVENTORY_ITEM', item._id, { itemName, itemCode, initialStock });

      return sendSuccess(res, 'Inventory item created successfully', item, 201);
    } else {
      const item = {
        _id: 'inv_' + Date.now(),
        schoolId,
        branchId,
        itemName,
        itemCode,
        category: category || 'OTHER',
        unit,
        openingStock: initialStock,
        currentStock: initialStock,
        minimumStock: Number(minimumStock || 5),
        reorderLevel: Number(reorderLevel || 10),
        unitPrice: Number(unitPrice || 0),
        supplierId,
        location: location || 'Main Store',
        status: 'ACTIVE',
      };
      mockItems.push(item);
      return sendSuccess(res, 'Inventory item created (Dev Mode)', item, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Record Stock Transaction (Purchase, Issue, Return, Adjustment, Damaged, Lost, Consumed)
 * CRITICAL BUSINESS RULE: Never allow negative stock!
 */
export const recordStockTransaction = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const { itemId, transactionType, quantity, unitPrice, issuedToName, issuedToType, referenceNumber, notes } = req.body;

    if (!itemId || !transactionType || quantity === undefined) {
      return sendError(res, 'Item ID, transaction type, and quantity are required', null, 400);
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty === 0) {
      return sendError(res, 'Quantity must be a non-zero number', null, 400);
    }

    // Determine quantity sign:
    // Additions: PURCHASE, RETURN, ADJUSTMENT (if positive)
    // Deductions: ISSUE, DAMAGED, LOST, CONSUMED
    const deductionTypes = ['ISSUE', 'DAMAGED', 'LOST', 'CONSUMED'];
    const netQtyChange = deductionTypes.includes(transactionType) ? -Math.abs(qty) : Math.abs(qty);

    if (mongoose.connection.readyState === 1) {
      const item = await InventoryItem.findOne({ _id: itemId, schoolId });
      if (!item) {
        return sendError(res, 'Inventory item not found', null, 404);
      }

      const prevStock = item.currentStock;
      const calculatedNewStock = prevStock + netQtyChange;

      if (calculatedNewStock < 0) {
        return sendError(
          res,
          `Stock deduction rejected! Current stock is ${prevStock} ${item.unit}, cannot deduct ${Math.abs(qty)} ${item.unit}.`,
          null,
          400
        );
      }

      item.currentStock = calculatedNewStock;
      await item.save();

      const txnPrice = Number(unitPrice || item.unitPrice || 0);

      const txn = await StockTransaction.create({
        schoolId,
        branchId,
        itemId: item._id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        transactionType,
        quantity: netQtyChange,
        previousStock: prevStock,
        newStock: calculatedNewStock,
        unitPrice: txnPrice,
        totalPrice: Math.abs(netQtyChange) * txnPrice,
        issuedToName: issuedToName || '',
        issuedToType: issuedToType || 'STAFF',
        supplierId: item.supplierId,
        referenceNumber: referenceNumber || '',
        notes: notes || '',
        performedBy: req.user?.name || 'System Admin',
        transactionDate: new Date().toISOString().split('T')[0],
      });

      await logInventoryAudit(req, 'STOCK_TRANSACTION', 'STOCK_TRANSACTION', txn._id, {
        itemName: item.itemName,
        transactionType,
        quantity: netQtyChange,
        prevStock,
        newStock: calculatedNewStock,
      });

      return sendSuccess(res, 'Stock transaction recorded successfully', { item, transaction: txn }, 201);
    } else {
      const item = mockItems.find((i) => i._id === itemId);
      if (!item) return sendError(res, 'Inventory item not found', null, 404);

      const prevStock = item.currentStock;
      const calculatedNewStock = prevStock + netQtyChange;

      if (calculatedNewStock < 0) {
        return sendError(
          res,
          `Stock deduction rejected! Current stock is ${prevStock} ${item.unit}, cannot deduct ${Math.abs(qty)} ${item.unit}.`,
          null,
          400
        );
      }

      item.currentStock = calculatedNewStock;
      const txn = {
        _id: 'stk_' + Date.now(),
        schoolId,
        branchId,
        itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        transactionType,
        quantity: netQtyChange,
        previousStock: prevStock,
        newStock: calculatedNewStock,
        transactionDate: new Date().toISOString().split('T')[0],
      };
      mockTransactions.push(txn);
      return sendSuccess(res, 'Stock transaction recorded (Dev Mode)', { item, transaction: txn }, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Suppliers
 */
export const getSuppliers = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const suppliers = await Supplier.find({ schoolId }).sort({ supplierName: 1 });
      return sendSuccess(res, 'Suppliers fetched successfully', suppliers);
    }
    return sendSuccess(res, 'Suppliers fetched (Dev Mode)', mockSuppliers);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Supplier
 */
export const addSupplier = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const { supplierName, companyName, contactPerson, phone, email, address, gstNumber, categories } = req.body;

    if (!supplierName || !phone) {
      return sendError(res, 'Supplier name and phone number are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const supplier = await Supplier.create({
        schoolId,
        branchId,
        supplierName: supplierName.trim(),
        companyName: companyName || '',
        contactPerson: contactPerson || '',
        phone: phone.trim(),
        email: email || '',
        address: address || '',
        gstNumber: gstNumber || '',
        categories: categories || [],
      });

      await logInventoryAudit(req, 'CREATE_SUPPLIER', 'SUPPLIER', supplier._id, { supplierName, phone });

      return sendSuccess(res, 'Supplier added successfully', supplier, 201);
    } else {
      const sup = { _id: 'sup_' + Date.now(), schoolId, supplierName, phone, email, address };
      mockSuppliers.push(sup);
      return sendSuccess(res, 'Supplier added (Dev Mode)', sup, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Assets
 */
export const getAssets = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { category, status } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId };
      if (category) filter.category = category;
      if (status) filter.status = status;

      const assets = await Asset.find(filter).sort({ assetName: 1 });
      return sendSuccess(res, 'Assets fetched successfully', assets);
    }

    let assets = [...mockAssets];
    if (category) assets = assets.filter((a) => a.category === category);
    if (status) assets = assets.filter((a) => a.status === status);
    return sendSuccess(res, 'Assets fetched (Dev Mode)', assets);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Asset
 */
export const addAsset = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const {
      assetCode,
      assetName,
      category,
      serialNumber,
      purchaseDate,
      purchasePrice,
      vendorName,
      warrantyExpiry,
      location,
      condition,
    } = req.body;

    if (!assetCode || !assetName || !purchaseDate || purchasePrice === undefined) {
      return sendError(res, 'Asset code, asset name, purchase date, and purchase price are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const existing = await Asset.findOne({ schoolId, assetCode: assetCode.trim() });
      if (existing) {
        return sendError(res, 'Asset code already exists', null, 400);
      }

      const asset = await Asset.create({
        schoolId,
        branchId,
        assetCode: assetCode.trim(),
        assetName: assetName.trim(),
        category: category || 'OTHER',
        serialNumber: serialNumber || '',
        purchaseDate,
        purchasePrice: Number(purchasePrice),
        vendorName: vendorName || '',
        warrantyExpiry: warrantyExpiry || '',
        location: location || 'Main Office',
        condition: condition || 'NEW',
        status: 'AVAILABLE',
      });

      await logInventoryAudit(req, 'CREATE_ASSET', 'ASSET', asset._id, { assetCode, assetName, purchasePrice });

      return sendSuccess(res, 'Asset registered successfully', asset, 201);
    } else {
      const asset = {
        _id: 'ast_' + Date.now(),
        schoolId,
        assetCode,
        assetName,
        category: category || 'OTHER',
        purchasePrice: Number(purchasePrice),
        status: 'AVAILABLE',
      };
      mockAssets.push(asset);
      return sendSuccess(res, 'Asset registered (Dev Mode)', asset, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Update Asset Status & Assignment
 */
export const updateAssetStatus = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { assetId } = req.params;
    const { status, assignedToName, assignedDepartment, condition, location, notes } = req.body;

    const validStatuses = ['PURCHASED', 'AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETURNED', 'DISPOSED'];
    if (status && !validStatuses.includes(status)) {
      return sendError(res, `Invalid asset status. Valid values: ${validStatuses.join(', ')}`, null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const asset = await Asset.findOne({ _id: assetId, schoolId });
      if (!asset) return sendError(res, 'Asset not found', null, 404);

      if (status) asset.status = status;
      if (assignedToName !== undefined) asset.assignedToName = assignedToName;
      if (assignedDepartment !== undefined) asset.assignedDepartment = assignedDepartment;
      if (condition) asset.condition = condition;
      if (location) asset.location = location;
      if (notes) asset.notes = notes;

      if (status === 'ASSIGNED') {
        asset.assignmentDate = new Date().toISOString().split('T')[0];
      }

      await asset.save();

      await logInventoryAudit(req, 'UPDATE_ASSET_STATUS', 'ASSET', asset._id, {
        assetName: asset.assetName,
        status: asset.status,
        assignedToName,
      });

      return sendSuccess(res, 'Asset status updated successfully', asset);
    } else {
      const asset = mockAssets.find((a) => a._id === assetId);
      if (!asset) return sendError(res, 'Asset not found', null, 404);
      if (status) asset.status = status;
      return sendSuccess(res, 'Asset status updated (Dev Mode)', asset);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Inventory & Asset Dashboard Summary
 */
export const getInventoryStats = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';

    if (mongoose.connection.readyState === 1) {
      const totalItems = await InventoryItem.countDocuments({ schoolId });
      const lowStockItems = await InventoryItem.find({ schoolId });
      const lowStockCount = lowStockItems.filter((i) => i.currentStock <= i.minimumStock).length;

      const totalAssets = await Asset.countDocuments({ schoolId });
      const assignedAssets = await Asset.countDocuments({ schoolId, status: 'ASSIGNED' });
      const maintenanceAssets = await Asset.countDocuments({ schoolId, status: 'MAINTENANCE' });

      return sendSuccess(res, 'Inventory statistics fetched successfully', {
        totalItems,
        lowStockCount,
        totalAssets,
        assignedAssets,
        maintenanceAssets,
      });
    }

    return sendSuccess(res, 'Inventory statistics fetched (Dev Mode)', {
      totalItems: mockItems.length,
      lowStockCount: mockItems.filter((i) => i.currentStock <= i.minimumStock).length,
      totalAssets: mockAssets.length,
      assignedAssets: mockAssets.filter((a) => a.status === 'ASSIGNED').length,
      maintenanceAssets: mockAssets.filter((a) => a.status === 'MAINTENANCE').length,
    });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};
