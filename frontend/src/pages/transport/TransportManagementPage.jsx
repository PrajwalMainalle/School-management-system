import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Bus,
  Plus,
  UserCheck,
  MapPin,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  Building2,
  Droplets,
  Trees,
} from 'lucide-react';

export default function TransportManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'drivers' | 'routes' | 'assignments' | 'maintenance'

  // Data States
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal & Form States
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    vehicleType: 'BUS',
    model: '',
    capacity: 40,
    insuranceNumber: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    pollutionCertificateExpiry: '',
    assignedDriverId: '',
  });

  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    licenseCategory: 'HEAVY_MOTOR_VEHICLE',
    licenseExpiry: '',
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeCode: '',
    startPoint: '',
    destination: '',
    vehicleId: '',
    driverId: '',
  });

  const [assignForm, setAssignForm] = useState({
    studentId: '',
    routeId: '',
    pickupStopName: '',
    dropStopName: '',
    monthlyFare: 1500,
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '',
    maintenanceType: 'SERVICE',
    cost: 5000,
    serviceDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const token = localStorage.getItem('erp_token');

  // Fetch All Transport Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes, rRes, aRes, mRes] = await Promise.all([
        fetch('/api/transport/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transport/drivers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transport/routes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transport/assignments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transport/maintenance', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [vJson, dJson, rJson, aJson, mJson] = await Promise.all([
        vRes.json(),
        dRes.json(),
        rRes.json(),
        aRes.json(),
        mRes.json(),
      ]);

      if (vJson.success) setVehicles(vJson.data || []);
      if (dJson.success) setDrivers(dJson.data || []);
      if (rJson.success) setRoutes(rJson.data || []);
      if (aJson.success) setAssignments(aJson.data || []);
      if (mJson.success) setMaintenances(mJson.data || []);
    } catch (err) {
      console.error('Transport fetch error:', err);
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
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transport/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(vehicleForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Vehicle added successfully!');
        setShowVehicleModal(false);
        setVehicleForm({ vehicleNumber: '', vehicleType: 'BUS', model: '', capacity: 40, insuranceNumber: '', insuranceExpiry: '', fitnessExpiry: '', pollutionCertificateExpiry: '', assignedDriverId: '' });
        fetchData();
      } else {
        triggerToast(json.message || 'Error adding vehicle', 'error');
      }
    } catch (err) {
      triggerToast('Network error adding vehicle', 'error');
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transport/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(driverForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Driver added successfully!');
        setShowDriverModal(false);
        setDriverForm({ name: '', phone: '', licenseNumber: '', licenseCategory: 'HEAVY_MOTOR_VEHICLE', licenseExpiry: '' });
        fetchData();
      } else {
        triggerToast(json.message || 'Error adding driver', 'error');
      }
    } catch (err) {
      triggerToast('Network error adding driver', 'error');
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transport/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(routeForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Route created successfully!');
        setShowRouteModal(false);
        setRouteForm({ routeName: '', routeCode: '', startPoint: '', destination: '', vehicleId: '', driverId: '' });
        fetchData();
      } else {
        triggerToast(json.message || 'Error creating route', 'error');
      }
    } catch (err) {
      triggerToast('Network error creating route', 'error');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transport/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(assignForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Student assigned to transport route successfully!');
        setShowAssignModal(false);
        setAssignForm({ studentId: '', routeId: '', pickupStopName: '', dropStopName: '', monthlyFare: 1500 });
        fetchData();
      } else {
        triggerToast(json.message || 'Error assigning student', 'error');
      }
    } catch (err) {
      triggerToast('Network error assigning student', 'error');
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transport/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(maintenanceForm),
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('Maintenance log recorded successfully!');
        setShowMaintenanceModal(false);
        setMaintenanceForm({ vehicleId: '', maintenanceType: 'SERVICE', cost: 5000, serviceDate: new Date().toISOString().split('T')[0], description: '' });
        fetchData();
      } else {
        triggerToast(json.message || 'Error recording maintenance', 'error');
      }
    } catch (err) {
      triggerToast('Network error recording maintenance', 'error');
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
              <Bus className="w-4 h-4 text-sky-200" />
              <span>Transport & Bus Operations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              School Fleet & Route Operations
            </h1>
            <p className="text-sky-100 text-xs mt-1">
              Vehicle tracking, driver compliance, route scheduling, capacity control & maintenance logs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVehicleModal(true)}
              className="px-3.5 py-2 bg-white text-sky-700 font-bold text-xs rounded-xl hover:bg-sky-50 transition-colors shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
            <button
              onClick={() => setShowRouteModal(true)}
              className="px-3.5 py-2 bg-ecoGreen-500 text-white font-bold text-xs rounded-xl hover:bg-ecoGreen-600 transition-colors shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Route
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-700">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Fleet Vehicles</p>
            <h3 className="text-xl font-bold text-slate-800">{vehicles.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ecoGreen-100 text-ecoGreen-700">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Licensed Drivers</p>
            <h3 className="text-xl font-bold text-slate-800">{drivers.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Routes</p>
            <h3 className="text-xl font-bold text-slate-800">{routes.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Assigned Students</p>
            <h3 className="text-xl font-bold text-slate-800">{assignments.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'vehicles', label: 'Fleet Vehicles', icon: Bus },
          { id: 'drivers', label: 'Licensed Drivers', icon: UserCheck },
          { id: 'routes', label: 'Routes & Stops', icon: MapPin },
          { id: 'assignments', label: 'Student Assignments', icon: Users },
          { id: 'maintenance', label: 'Vehicle Maintenance', icon: Wrench },
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
        <div className="p-12 text-center text-slate-400 text-sm">Loading transport fleet data...</div>
      ) : (
        <>
          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Fleet Vehicles List</h3>
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Vehicle
                </button>
              </div>

              {vehicles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No vehicles registered in fleet. Click "Add Vehicle" to register your first bus or van.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((v) => (
                    <div key={v._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {v.vehicleType}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">{v.vehicleNumber}</h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            v.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Model: {v.model || 'Standard'}</p>
                      <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span>Max Capacity:</span>
                          <strong className="text-slate-800">{v.capacity} Passengers</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance Exp:</span>
                          <span className="text-slate-700">{v.insuranceExpiry || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Driver Compliance Directory</h3>
                <button
                  onClick={() => setShowDriverModal(true)}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Driver
                </button>
              </div>

              {drivers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No drivers registered. Click "Add Driver" to add a heavy motor vehicle licensed driver.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((d) => (
                    <div key={d._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {d.driverId}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">{d.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Phone: {d.phone}</p>
                      <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span>License No:</span>
                          <strong className="text-slate-800">{d.licenseNumber}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="text-slate-700">{d.licenseCategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>License Expiry:</span>
                          <span className="text-amber-700 font-semibold">{d.licenseExpiry}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Transport Routes & Stops</h3>
                <button
                  onClick={() => setShowRouteModal(true)}
                  className="px-3 py-1.5 bg-ecoGreen-600 text-white rounded-lg text-xs font-bold hover:bg-ecoGreen-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Route
                </button>
              </div>

              {routes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No transport routes configured. Click "Add Route" to define start points, stops, and pickup schedules.
                </div>
              ) : (
                <div className="space-y-3">
                  {routes.map((r) => (
                    <div key={r._id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 font-bold text-xs border border-sky-200">
                            {r.routeCode}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800">{r.routeName}</h4>
                            <p className="text-xs text-slate-500">
                              {r.startPoint} ➔ {r.destination}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Student Route Assignments</h3>
                  <p className="text-xs text-slate-500">Passenger Capacity Safety Active: Prevents assigning beyond vehicle maximum seat limits.</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Student
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No active student transport assignments. Click "Assign Student" to map a student to a transport route.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                      <tr>
                        <th className="p-3">Student ID</th>
                        <th className="p-3">Route ID</th>
                        <th className="p-3">Pickup Stop</th>
                        <th className="p-3">Drop Stop</th>
                        <th className="p-3">Monthly Fare (₹)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignments.map((a) => (
                        <tr key={a._id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{a.studentId}</td>
                          <td className="p-3">{a.routeId}</td>
                          <td className="p-3">{a.pickupStopName}</td>
                          <td className="p-3">{a.dropStopName}</td>
                          <td className="p-3 font-bold text-sky-700">₹{a.monthlyFare}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700">
                              {a.status}
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

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Vehicle Maintenance & Service Logs</h3>
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Service
                </button>
              </div>

              {maintenances.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-500 text-xs">
                  No maintenance records logged. Click "Record Service" to log repairs, oil changes, or fitness inspections.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                      <tr>
                        <th className="p-3">Vehicle ID</th>
                        <th className="p-3">Maintenance Type</th>
                        <th className="p-3">Cost (₹)</th>
                        <th className="p-3">Service Date</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {maintenances.map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{m.vehicleId}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">
                              {m.maintenanceType}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">₹{m.cost}</td>
                          <td className="p-3">{m.serviceDate}</td>
                          <td className="p-3 text-slate-500">{m.description || 'N/A'}</td>
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

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Bus className="w-5 h-5 text-sky-600" /> Add New Fleet Vehicle
            </h3>
            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle Reg Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-F-9821"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="BUS">BUS</option>
                    <option value="MINI_BUS">MINI BUS</option>
                    <option value="VAN">VAN</option>
                    <option value="CAR">CAR</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity (Seats) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Insurance Expiry Date</label>
                <input
                  type="date"
                  value={vehicleForm.insuranceExpiry}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-600" /> Add Licensed Driver
            </h3>
            <form onSubmit={handleAddDriver} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basavaraj Patil"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License Category</label>
                  <select
                    value={driverForm.licenseCategory}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseCategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="HEAVY_MOTOR_VEHICLE">Heavy Motor Vehicle (HMV)</option>
                    <option value="LIGHT_MOTOR_VEHICLE">Light Motor Vehicle (LMV)</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-1420110012345"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={driverForm.licenseExpiry}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseExpiry: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold">
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ecoGreen-600" /> Create Transport Route
            </h3>
            <form onSubmit={handleAddRoute} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="North Campus Express"
                    value={routeForm.routeName}
                    onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="RT-101"
                    value={routeForm.routeCode}
                    onChange={(e) => setRouteForm({ ...routeForm, routeCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Point *</label>
                  <input
                    type="text"
                    required
                    placeholder="Yelahanka Satellite Town"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="Main Campus"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-ecoGreen-600 text-white rounded-xl font-bold">
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" /> Assign Student to Transport
            </h3>
            <form onSubmit={handleAssignStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. std_1001"
                  value={assignForm.studentId}
                  onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transport Route ID / Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RT-101"
                  value={assignForm.routeId}
                  onChange={(e) => setAssignForm({ ...assignForm, routeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pickup Stop *</label>
                  <input
                    type="text"
                    required
                    placeholder="Yelahanka Circle"
                    value={assignForm.pickupStopName}
                    onChange={(e) => setAssignForm({ ...assignForm, pickupStopName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Drop Stop *</label>
                  <input
                    type="text"
                    required
                    placeholder="Main Gate"
                    value={assignForm.dropStopName}
                    onChange={(e) => setAssignForm({ ...assignForm, dropStopName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Monthly Fare Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={assignForm.monthlyFare}
                  onChange={(e) => setAssignForm({ ...assignForm, monthlyFare: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold">
                  Assign Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" /> Record Vehicle Service Log
            </h3>
            <form onSubmit={handleAddMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle ID / Reg No *</label>
                <input
                  type="text"
                  required
                  placeholder="KA-01-F-9821"
                  value={maintenanceForm.vehicleId}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={maintenanceForm.maintenanceType}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="SERVICE">Regular Service</option>
                    <option value="REPAIR">Repair</option>
                    <option value="INSPECTION">Fitness Inspection</option>
                    <option value="TIRE_CHANGE">Tire Replacement</option>
                    <option value="OIL_CHANGE">Oil Change</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Date *</label>
                <input
                  type="date"
                  required
                  value={maintenanceForm.serviceDate}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold">
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
