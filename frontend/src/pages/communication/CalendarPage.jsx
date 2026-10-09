import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Tag, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../i18n/LanguageContext';

const CalendarPage = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, agenda
  const [showEventModal, setShowEventModal] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'PROGRAM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    location: 'School Campus',
    organizer: 'School Administration',
    audienceType: 'EVERYONE',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/communication/events?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      const rawMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 401 || (rawMsg && (rawMsg.includes('token') || rawMsg.includes('authorized')))) {
        setError('Please sign in to view calendar events.');
      } else {
        setError(rawMsg || 'Failed to load calendar events. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/communication/events', eventForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setShowEventModal(false);
        setEventForm({
          title: '',
          description: '',
          eventType: 'PROGRAM',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          location: 'School Campus',
          organizer: 'School Administration',
          audienceType: 'EVERYONE',
          priority: 'MEDIUM',
        });
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-emerald-600" />
            Centralized School Calendar & Events
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track holidays, examinations, sports, cultural programs, homework, and fee deadlines
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'agenda' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Agenda View
            </button>
          </div>

          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 flex items-center gap-1 text-sm font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 flex items-center gap-1 text-sm font-medium"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar / Agenda Body */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading calendar events...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-base font-semibold text-gray-600">No events scheduled for this month</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Event" to schedule school programs, exams, or holidays</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((evt) => (
              <div
                key={evt._id}
                className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
                      evt.eventType === 'HOLIDAY'
                        ? 'bg-rose-100 text-rose-700'
                        : evt.eventType === 'EXAM'
                        ? 'bg-amber-100 text-amber-800'
                        : evt.eventType === 'MEETING'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {evt.eventType}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                    {evt.priority} Priority
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base">{evt.title}</h3>
                {evt.description && <p className="text-xs text-gray-600 line-clamp-2">{evt.description}</p>}

                <div className="space-y-1.5 pt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    <span>
                      {evt.startDate} {evt.endDate !== evt.startDate ? ` to ${evt.endDate}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>
                      {evt.startTime} - {evt.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">Schedule School Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Annual Sports Day 2025"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Event Type *</label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAM">Examination</option>
                  <option value="MEETING">Staff / Parent Meeting</option>
                  <option value="SPORTS">Sports Event</option>
                  <option value="CULTURAL">Cultural Event</option>
                  <option value="PROGRAM">School Program</option>
                  <option value="FEE_DEADLINE">Fee Payment Deadline</option>
                  <option value="HOMEWORK_DEADLINE">Homework Deadline</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">End Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="e.g. Main Auditorium / Sports Ground"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Target Audience</label>
                <select
                  value={eventForm.audienceType}
                  onChange={(e) => setEventForm({ ...eventForm, audienceType: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="EVERYONE">Everyone (Whole School)</option>
                  <option value="TEACHERS">Teachers Only</option>
                  <option value="STAFF">Staff Only</option>
                  <option value="STUDENTS">Students Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Description</label>
                <textarea
                  rows="3"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event details or agenda..."
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
