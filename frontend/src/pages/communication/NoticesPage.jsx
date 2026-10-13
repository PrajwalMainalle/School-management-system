import React, { useState, useEffect } from 'react';
import { Bell, FileText, Plus, Eye, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const NoticesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const [activeTab, setActiveTab] = useState('notices'); // notices, notifications
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    audienceType: 'EVERYONE',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [noticesRes, notifsRes] = await Promise.all([
        axios.get('/api/communication/notices', { headers }),
        axios.get('/api/communication/notifications', { headers }),
      ]);

      if (noticesRes.data?.success) setNotices(noticesRes.data.data || []);
      if (notifsRes.data?.success) {
        setNotifications(notifsRes.data.data?.notifications || []);
        setUnreadCount(notifsRes.data.data?.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading notices/notifications:', err);
      const rawMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 401 || (rawMsg && (rawMsg.includes('token') || rawMsg.includes('authorized')))) {
        setError('Please sign in to view notices and circulars.');
      } else {
        setError(rawMsg || 'Failed to load notices. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('/api/communication/notices', noticeForm, {
        headers,
      });
      if (res.data?.success) {
        setShowNoticeModal(false);
        setNoticeForm({ title: '', content: '', priority: 'NORMAL', audienceType: 'EVERYONE' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish notice');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await axios.put('/api/communication/notifications/read-all');
      if (res.data?.success) {
        setUnreadCount(0);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-emerald-600" />
            Notices, Announcements & Notification Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Broadcast official circulars, targeted notices, and real-time system alerts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl font-medium text-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All as Read ({unreadCount})
            </button>
          )}
          {!isStudent && (
            <button
              onClick={() => setShowNoticeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Publish Circular
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-2xl pt-2 gap-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'notices'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Notices & Circulars ({notices.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Notifications Center
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-rose-500 text-white font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Body */}
      <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-gray-100 shadow-sm min-h-[350px]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading communication records...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">{error}</div>
        ) : (
          <>
            {/* NOTICES TAB */}
            {activeTab === 'notices' && (
              <div className="space-y-4">
                {notices.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-base font-semibold text-gray-600">No circulars or notices published</p>
                    <p className="text-xs text-gray-400">Publish notices to send updates to teachers, staff, or students</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <div
                        key={notice._id}
                        className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${
                                notice.priority === 'URGENT'
                                  ? 'bg-rose-100 text-rose-700'
                                  : notice.priority === 'IMPORTANT'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {notice.priority}
                            </span>
                            <span className="text-xs text-gray-400">Audience: {notice.audienceType}</span>
                          </div>
                          <span className="text-xs text-gray-400">{notice.publishDate}</span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg">{notice.title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{notice.content}</p>

                        <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 mt-2">
                          <span>Author: {notice.authorName || 'Principal'}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Read by {notice.readBy?.length || 0} users
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-base font-semibold text-gray-600">No notifications in your inbox</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-4 flex items-start gap-4 transition rounded-xl ${
                          !n.isRead ? 'bg-emerald-50/40 font-medium' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            !n.isRead ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">{n.title}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE NOTICE MODAL */}
      {!isStudent && showNoticeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Publish Circular Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Science Exhibition Registration Open"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">Audience</label>
                  <select
                    value={noticeForm.audienceType}
                    onChange={(e) => setNoticeForm({ ...noticeForm, audienceType: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="STAFF">Staff</option>
                    <option value="STUDENTS">Students</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Notice Content *</label>
                <textarea
                  rows="4"
                  required
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Write notice announcement details here..."
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Publish Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
