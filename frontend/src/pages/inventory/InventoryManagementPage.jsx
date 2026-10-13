import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Layers,
  Truck,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../i18n/LanguageContext';

const InventoryManagementPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('items'); // items, transactions, assets, suppliers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, lowStockCount: 0, totalAssets: 0, assignedAssets: 0 });

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState({
    itemName: '',
    itemCode: '',
    category: 'STATIONERY',
    unit: 'pcs',
    openingStock: 0,
    minimumStock: 5,
    reorderLevel: 10,
    unitPrice: 0,
    supplierId: '',
    location: 'Main Store',
  });

  const [txnForm, setTxnForm] = useState({
    itemId: '',
    transactionType: 'ISSUE',
    quantity: 1,
    unitPrice: 0,
    issuedToName: '',
    issuedToType: 'STAFF',
    referenceNumber: '',
    notes: '',
  });

  const [assetForm, setAssetForm] = useState({
    assetCode: '',
    assetName: '',
    category: 'COMPUTERS',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    vendorName: '',
    warrantyExpiry: '',
    location: 'Computer Lab 1',
    condition: 'NEW',
  });

  const [supplierForm, setSupplierForm] = useState({
    supplierName: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const getToken = () => localStorage.getItem('erp_token') || localStorage.getItem('token');

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [itemsRes, assetsRes, suppliersRes, statsRes] = await Promise.all([
        axios.get('/api/inventory/items', { headers }).catch(() => ({ data: {} })),
        axios.get('/api/inventory/assets', { headers }).catch(() => ({ data: {} })),
        axios.get('/api/inventory/suppliers', { headers }).catch(() => ({ data: {} })),
        axios.get('/api/inventory/stats', { headers }).catch(() => ({ data: {} })),
      ]);

      if (itemsRes.data?.success) setItems(itemsRes.data.data || []);
      if (assetsRes.data?.success) setAssets(assetsRes.data.data || []);
      if (suppliersRes.data?.success) setSuppliers(suppliersRes.data.data || []);
      if (statsRes.data?.success) setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Error loading inventory data:', err);
      const rawMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 401 || (rawMsg && (rawMsg.includes('token') || rawMsg.includes('authorized')))) {
        setError('Please sign in to view inventory and assets.');
      } else {
        setError(rawMsg || 'Failed to load inventory data. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await axios.post('/api/inventory/items', itemForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setShowItemModal(false);
        setItemForm({
          itemName: '',
          itemCode: '',
          category: 'STATIONERY',
          unit: 'pcs',
          openingStock: 0,
          minimumStock: 5,
          reorderLevel: 10,
          unitPrice: 0,
          supplierId: '',
          location: 'Main Store',
        });
        fetchInventoryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create inventory item');
    }
  };

  const handleRecordTxn = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await axios.post('/api/inventory/stock-transactions', txnForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setShowTxnModal(false);
        setTxnForm({
          itemId: '',
          transactionType: 'ISSUE',
          quantity: 1,
          unitPrice: 0,
          issuedToName: '',
          issuedToType: 'STAFF',
          referenceNumber: '',
          notes: '',
        });
        fetchInventoryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record stock transaction');
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await axios.post('/api/inventory/assets', assetForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setShowAssetModal(false);
        setAssetForm({
          assetCode: '',
          assetName: '',
          category: 'COMPUTERS',
          serialNumber: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          purchasePrice: 0,
          vendorName: '',
          warrantyExpiry: '',
          location: 'Computer Lab 1',
          condition: 'NEW',
        });
        fetchInventoryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register asset');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await axios.post('/api/inventory/suppliers', supplierForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setShowSupplierModal(false);
        setSupplierForm({
          supplierName: '',
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          gstNumber: '',
        });
        fetchInventoryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-emerald-600" />
            {t('inventory.title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('inventory.addItem')}
          </button>
          <button
            onClick={() => setShowTxnModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {t('inventory.recordTransaction')}
          </button>
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            {t('inventory.addAsset')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalItems || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Total Inventory SKUs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{stats.lowStockCount || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Low Stock Alerts</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalAssets || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Physical Assets</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-600">{suppliers.length || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Active Suppliers</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-2xl pt-2 gap-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'items'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('inventory.tabItems')} ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'assets'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('inventory.tabAssets')} ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'suppliers'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('inventory.tabSuppliers')} ({suppliers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-gray-100 shadow-sm min-h-[350px]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">{error}</div>
        ) : (
          <>
            {/* ITEMS TAB */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Boxes className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-base font-semibold text-gray-600">No inventory items found</p>
                    <p className="text-xs text-gray-400">Add inventory items to start tracking store stock</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                          <th className="p-3 font-semibold">SKU / Code</th>
                          <th className="p-3 font-semibold">Item Name</th>
                          <th className="p-3 font-semibold">Category</th>
                          <th className="p-3 font-semibold">Current Stock</th>
                          <th className="p-3 font-semibold">Min Stock</th>
                          <th className="p-3 font-semibold">Unit Price</th>
                          <th className="p-3 font-semibold">Storage Location</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item) => {
                          const isLowStock = item.currentStock <= item.minimumStock;
                          return (
                            <tr key={item._id} className="hover:bg-gray-50/80 transition">
                              <td className="p-3 font-mono text-xs font-semibold text-gray-800">{item.itemCode}</td>
                              <td className="p-3 font-medium text-gray-900">{item.itemName}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 text-xs rounded-lg font-medium bg-gray-100 text-gray-700">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-3 font-semibold">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs ${
                                    isLowStock
                                      ? 'bg-amber-100 text-amber-800 font-bold'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {item.currentStock} {item.unit}
                                </span>
                              </td>
                              <td className="p-3 text-gray-500">
                                {item.minimumStock} {item.unit}
                              </td>
                              <td className="p-3 text-gray-700">₹{item.unitPrice}</td>
                              <td className="p-3 text-gray-600">{item.location}</td>
                              <td className="p-3">
                                {isLowStock ? (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                    <AlertTriangle className="w-3 h-3" /> Low Stock
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                    In Stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === 'assets' && (
              <div className="space-y-4">
                {assets.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShieldCheck className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-base font-semibold text-gray-600">No physical assets registered</p>
                    <p className="text-xs text-gray-400">Register computers, furniture, and equipment assets</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                          <th className="p-3 font-semibold">Asset Code</th>
                          <th className="p-3 font-semibold">Asset Name</th>
                          <th className="p-3 font-semibold">Category</th>
                          <th className="p-3 font-semibold">Location</th>
                          <th className="p-3 font-semibold">Assigned To</th>
                          <th className="p-3 font-semibold">Condition</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {assets.map((ast) => (
                          <tr key={ast._id} className="hover:bg-gray-50/80 transition">
                            <td className="p-3 font-mono text-xs font-semibold text-gray-800">{ast.assetCode}</td>
                            <td className="p-3 font-medium text-gray-900">{ast.assetName}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 text-xs rounded-lg font-medium bg-indigo-50 text-indigo-700">
                                {ast.category}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">{ast.location}</td>
                            <td className="p-3 text-gray-700">
                              {ast.assignedToName || ast.assignedDepartment || '-'}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 font-medium">
                                {ast.condition}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                  ast.status === 'AVAILABLE'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : ast.status === 'ASSIGNED'
                                    ? 'bg-sky-100 text-sky-700'
                                    : ast.status === 'MAINTENANCE'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {ast.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUPPLIERS TAB */}
            {activeTab === 'suppliers' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Approved Suppliers</h3>
                  <button
                    onClick={() => setShowSupplierModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                  >
                    + Add Supplier
                  </button>
                </div>
                {suppliers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Building className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-base font-semibold text-gray-600">No suppliers registered</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suppliers.map((sup) => (
                      <div key={sup._id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2">
                        <div className="font-semibold text-gray-900">{sup.supplierName}</div>
                        {sup.companyName && <div className="text-xs text-gray-500">{sup.companyName}</div>}
                        <div className="text-xs text-gray-600">📞 {sup.phone}</div>
                        {sup.email && <div className="text-xs text-gray-600">✉️ {sup.email}</div>}
                        {sup.gstNumber && <div className="text-xs text-gray-500 font-mono">GST: {sup.gstNumber}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Add Inventory Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemForm.itemName}
                  onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                  placeholder="e.g. A4 Printing Paper"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Item SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.itemCode}
                    onChange={(e) => setItemForm({ ...itemForm, itemCode: e.target.value })}
                    placeholder="e.g. STA-A4-01"
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="STATIONERY">Stationery</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="COMPUTERS">Computers</option>
                    <option value="LABORATORY">Laboratory</option>
                    <option value="SPORTS">Sports</option>
                    <option value="CLASSROOM">Classroom</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="LIBRARY">Library</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="HOSTEL">Hostel</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Unit</label>
                  <input
                    type="text"
                    required
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="pcs, box, ream"
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Opening Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.openingStock}
                    onChange={(e) => setItemForm({ ...itemForm, openingStock: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Min Alert Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.minimumStock}
                    onChange={(e) => setItemForm({ ...itemForm, minimumStock: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Storage Location</label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD TRANSACTION MODAL */}
      {showTxnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Record Stock Transaction</h3>
            <form onSubmit={handleRecordTxn} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Select Item *</label>
                <select
                  required
                  value={txnForm.itemId}
                  onChange={(e) => setTxnForm({ ...txnForm, itemId: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Inventory Item --</option>
                  {items.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.itemName} ({i.itemCode}) - Current Stock: {i.currentStock} {i.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Transaction Type *</label>
                  <select
                    value={txnForm.transactionType}
                    onChange={(e) => setTxnForm({ ...txnForm, transactionType: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ISSUE">Issue Stock</option>
                    <option value="PURCHASE">Stock Purchase</option>
                    <option value="RETURN">Return Stock</option>
                    <option value="DAMAGED">Mark Damaged</option>
                    <option value="LOST">Mark Lost</option>
                    <option value="CONSUMED">Stock Consumed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={txnForm.quantity}
                    onChange={(e) => setTxnForm({ ...txnForm, quantity: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Issued To / Recipient</label>
                <input
                  type="text"
                  value={txnForm.issuedToName}
                  onChange={(e) => setTxnForm({ ...txnForm, issuedToName: e.target.value })}
                  placeholder="e.g. Science Lab / Staff Name"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700"
                >
                  Confirm Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER ASSET MODAL */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Register Physical Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={assetForm.assetName}
                  onChange={(e) => setAssetForm({ ...assetForm, assetName: e.target.value })}
                  placeholder="e.g. Dell OptiPlex Desktop"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Asset Code / Tag *</label>
                  <input
                    type="text"
                    required
                    value={assetForm.assetCode}
                    onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                    placeholder="e.g. AST-LAB-001"
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={assetForm.purchasePrice}
                    onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={assetForm.purchaseDate}
                    onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Location</label>
                  <input
                    type="text"
                    value={assetForm.location}
                    onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Add Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.supplierName}
                  onChange={(e) => setSupplierForm({ ...supplierForm, supplierName: e.target.value })}
                  placeholder="e.g. National Stationers Ltd."
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Phone *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagementPage;
