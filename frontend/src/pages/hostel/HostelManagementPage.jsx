import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Building2,
  Plus,
  Bed,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Users,
  ShieldCheck,
  Home,
} from 'lucide-react';

export default function HostelManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('hostels'); // 'hostels' | 'rooms' | 'allocations'

  // Data States
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal & Form States
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);

  const [hostelForm, setHostelForm] = useState({
    hostelName: '',
    hostelType: 'BOYS',
    wardenName: '',
    wardenPhone: '',
    capacity: 100,
    address: '',
  });

  const [roomForm, setRoomForm] = useState({
    hostelId: '',
    buildingName: 'Block A',
    floorNumber: 1,
    roomNumber: '',
    roomType: 'DOUBLE',
    capacity: 2,
    monthlyFee: 3500,
  });

  const [allocForm, setAllocForm] = useState({
    studentId: '',
    hostelId: '',
    roomId: '',
    bedNumber: 'Bed-1',
    monthlyFee: 3500,
  });

  const token = localStorage.getItem('erp_token');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, rRes, aRes] = await Promise.all([
        fetch('/api/hostel/hostels', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/hostel/rooms', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/hostel/allocations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [hJson, rJson, aJson] = await Promise.all([
        hRes.json(),
        rRes.json(),
        aRes.json(),
      ]);

      if (hJson.success) setHostels(hJson.data || []);
      if (rJson.success) setRooms(rJson.data || []);
      if (aJson.success) setAllocations(aJson.data || []);
    } catch (err) {
      console.error('Hostel fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handlers
  const handleAddHostel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hostel/hostels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(hostelForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Hostel building created successfully!');
        setShowHostelModal(false);
        setHostelForm({ hostelName: '', hostelType: 'BOYS', wardenName: '', wardenPhone: '', capacity: 100, address: '' });
        fetchData();
      } else {
        triggerToast(json.message || 'Error creating hostel', 'error');
      }
    } catch (err) {
      triggerToast('Network error creating hostel', 'error');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hostel/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(roomForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Hostel room added successfully!');
        setShowRoomModal(false);
        setRoomForm({ hostelId: '', buildingName: 'Block A', floorNumber: 1, roomNumber: '', roomType: 'DOUBLE', capacity: 2, monthlyFee: 3500 });
        fetchData();
      } else {
        triggerToast(json.message || 'Error creating room', 'error');
      }
    } catch (err) {
      triggerToast('Network error creating room', 'error');
    }
  };

  const handleAllocateBed = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hostel/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(allocForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Hostel bed allocated successfully!');
        setShowAllocModal(false);
        setAllocForm({ studentId: '', hostelId: '', roomId: '', bedNumber: 'Bed-1', monthlyFee: 3500 });
        fetchData();
      } else {
        triggerToast(json.message || 'Error allocating bed', 'error');
      }
    } catch (err) {
      triggerToast('Network error allocating bed', 'error');
    }
  };

  const handleCheckout = async (allocId) => {
    try {
      const res = await fetch(`/api/hostel/allocations/${allocId}/checkout`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Student checked out successfully!');
        fetchData();
      } else {
        triggerToast(json.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      triggerToast('Network error checking out student', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-ecoGreen-600 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
              <Building2 className="w-4 h-4 text-sky-200" />
              <span>Hostel & Room Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hostel Buildings & Room Allocation
            </h1>
            <p className="text-sky-100 text-xs mt-1">
              Building hierarchy, room vacancies, bed capacity enforcement & student residency tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHostelModal(true)}
              className="px-3.5 py-2 bg-white text-sky-700 font-bold text-xs rounded-xl hover:bg-sky-50 transition-colors shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Hostel
            </button>
            <button
              onClick={() => setShowAllocModal(true)}
              className="px-3.5 py-2 bg-ecoGreen-500 text-white font-bold text-xs rounded-xl hover:bg-ecoGreen-600 transition-colors shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Allocate Bed
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Hostel Buildings</p>
            <h3 className="text-xl font-bold text-slate-800">{hostels.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Rooms</p>
            <h3 className="text-xl font-bold text-slate-800">{rooms.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Resident Students</p>
            <h3 className="text-xl font-bold text-slate-800">
              {allocations.filter((a) => a.status === 'ACTIVE').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'hostels', label: 'Hostel Buildings', icon: Building2 },
          { id: 'rooms', label: 'Room Directory', icon: Bed },
          { id: 'allocations', label: 'Bed Allocations', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading hostel data...</div>
      ) : (
        <>
          {/* Hostels Tab */}
          {activeTab === 'hostels' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Hostel Buildings List</h3>
                <button
                  onClick={() => setShowHostelModal(true)}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Hostel
                </button>
              </div>

              {hostels.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No hostel buildings created. Click "Add Hostel" to register a Boys, Girls, or Co-Ed hostel.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hostels.map((h) => (
                    <div key={h._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {h.hostelType}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">{h.hostelName}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          {h.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Warden: {h.wardenName} ({h.wardenPhone})</p>
                      <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                        Total Capacity: <strong className="text-slate-800">{h.capacity} Students</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Room & Bed Directory</h3>
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Room
                </button>
              </div>

              {rooms.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No rooms created. Click "Add Room" to configure single, double, or dormitory rooms.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((r) => (
                    <div key={r._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {r.buildingName} • Floor {r.floorNumber}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">Room {r.roomNumber}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700">
                          {r.roomType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex justify-between pt-2 border-t border-slate-100">
                        <span>Capacity: <strong>{r.capacity} Beds</strong></span>
                        <span className="font-bold text-emerald-700">₹{r.monthlyFee}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Allocations Tab */}
          {activeTab === 'allocations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Student Bed Allocations</h3>
                  <p className="text-xs text-slate-500">Enforces non-duplicate active allocations and room bed capacity limits.</p>
                </div>
                <button
                  onClick={() => setShowAllocModal(true)}
                  className="px-3 py-1.5 bg-ecoGreen-600 text-white rounded-lg text-xs font-bold hover:bg-ecoGreen-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Allocate Bed
                </button>
              </div>

              {allocations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No active student bed allocations. Click "Allocate Bed" to assign a resident student.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                      <tr>
                        <th className="p-3">Student ID</th>
                        <th className="p-3">Hostel ID</th>
                        <th className="p-3">Room ID</th>
                        <th className="p-3">Bed No</th>
                        <th className="p-3">Monthly Fee (₹)</th>
                        <th className="p-3">Allocation Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allocations.map((a) => (
                        <tr key={a._id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{a.studentId}</td>
                          <td className="p-3">{a.hostelId}</td>
                          <td className="p-3">{a.roomId}</td>
                          <td className="p-3 font-bold text-sky-700">{a.bedNumber}</td>
                          <td className="p-3 font-bold text-slate-800">₹{a.monthlyFee}</td>
                          <td className="p-3">{a.allocationDate}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                a.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {a.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleCheckout(a._id)}
                                className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold hover:bg-amber-100 text-[10px] flex items-center gap-1 ml-auto"
                              >
                                <LogOut className="w-3 h-3" /> Checkout
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Hostel Modal */}
      {showHostelModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600" /> Add Hostel Building
            </h3>
            <form onSubmit={handleAddHostel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hostel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Greenwood Boys Hostel"
                  value={hostelForm.hostelName}
                  onChange={(e) => setHostelForm({ ...hostelForm, hostelName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hostel Type</label>
                  <select
                    value={hostelForm.hostelType}
                    onChange={(e) => setHostelForm({ ...hostelForm, hostelType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="BOYS">BOYS</option>
                    <option value="GIRLS">GIRLS</option>
                    <option value="CO_ED">CO-ED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={hostelForm.capacity}
                    onChange={(e) => setHostelForm({ ...hostelForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warden Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Suresh Kumar"
                    value={hostelForm.wardenName}
                    onChange={(e) => setHostelForm({ ...hostelForm, wardenName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warden Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 11223"
                    value={hostelForm.wardenPhone}
                    onChange={(e) => setHostelForm({ ...hostelForm, wardenPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHostelModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold">
                  Save Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Bed className="w-5 h-5 text-sky-600" /> Add Hostel Room
            </h3>
            <form onSubmit={handleAddRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hostel ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hst_101"
                  value={roomForm.hostelId}
                  onChange={(e) => setRoomForm({ ...roomForm, hostelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="101"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomForm.floorNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, floorNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity (Beds) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={roomForm.monthlyFee}
                    onChange={(e) => setRoomForm({ ...roomForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Bed Modal */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-ecoGreen-600" /> Allocate Bed to Student
            </h3>
            <form onSubmit={handleAllocateBed} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. std_1001"
                  value={allocForm.studentId}
                  onChange={(e) => setAllocForm({ ...allocForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hostel ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hst_101"
                    value={allocForm.hostelId}
                    onChange={(e) => setAllocForm({ ...allocForm, hostelId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rm_101"
                    value={allocForm.roomId}
                    onChange={(e) => setAllocForm({ ...allocForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bed-A"
                    value={allocForm.bedNumber}
                    onChange={(e) => setAllocForm({ ...allocForm, bedNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={allocForm.monthlyFee}
                    onChange={(e) => setAllocForm({ ...allocForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllocModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-ecoGreen-600 text-white rounded-xl font-bold">
                  Allocate Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
