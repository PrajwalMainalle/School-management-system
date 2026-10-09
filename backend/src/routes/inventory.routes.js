import express from 'express';
import {
  getItems,
  addItem,
  recordStockTransaction,
  getSuppliers,
  addSupplier,
  getAssets,
  addAsset,
  updateAssetStatus,
  getInventoryStats,
} from '../controllers/inventory.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Dashboard / Stats
router.get('/stats', getInventoryStats);

// Items & Stock
router.get('/items', getItems);
router.post('/items', addItem);
router.post('/stock-transactions', recordStockTransaction);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', addSupplier);

// Assets
router.get('/assets', getAssets);
router.post('/assets', addAsset);
router.put('/assets/:assetId/status', updateAssetStatus);

export default router;
