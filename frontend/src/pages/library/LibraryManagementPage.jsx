import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Library,
  Plus,
  BookOpen,
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  User,
  Clock,
  Droplets,
  Trees,
} from 'lucide-react';

export default function LibraryManagementPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'circulation' | 'overdue'

  // Data States
  const [booksList, setBooksList] = useState([]);
  const [circulationLogs, setCirculationLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal States
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Form States
  const [bookFormData, setBookFormData] = useState({
    accessionNumber: '',
    title: '',
    author: '',
    publisher: '',
    category: 'TEXTBOOK',
    quantityTotal: 5,
    shelfLocation: 'Rack A1',
    price: 350,
  });

  const [issueFormData, setIssueFormData] = useState({
    borrowerType: 'STUDENT',
    borrowerId: '',
    daysToReturn: 14,
  });

  const token = localStorage.getItem('erp_token');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Books Catalog
      const bRes = await fetch(`/api/library/books?query=${searchQuery}&category=${categoryFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bJson = await bRes.json();
      if (bJson.success) setBooksList(bJson.data);

      // 2. Fetch Circulation Logs
      const cRes = await fetch('/api/library/circulation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cJson = await cRes.json();
      if (cJson.success) setCirculationLogs(cJson.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter]);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Add Book Handler
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...bookFormData,
          schoolId: user?.schoolId || '',
        }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Book added to digital catalog successfully!');
        setShowAddBookModal(false);
        setBookFormData({
          accessionNumber: '',
          title: '',
          author: '',
          publisher: '',
          category: 'TEXTBOOK',
          quantityTotal: 5,
          shelfLocation: 'Rack A1',
          price: 350,
        });
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Issue Book Handler
  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      const res = await fetch('/api/library/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: selectedBook._id,
          borrowerType: issueFormData.borrowerType,
          borrowerId: issueFormData.borrowerId,
          daysToReturn: Number(issueFormData.daysToReturn),
          schoolId: user?.schoolId || '',
        }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast('Book issued to borrower! Quantity available updated.');
        setShowIssueModal(false);
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Return Book Handler (Server Fine Calculation)
  const handleReturnBook = async (issueId) => {
    try {
      const res = await fetch(`/api/library/return/${issueId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fineRatePerDay: 5 }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast(`Book returned! Overdue fine computed server-side: ₹${json.data.overdueFine}`);
        fetchData();
      } else {
        triggerToast(json.message, 'error');
      }
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const overdueList = circulationLogs.filter((i) => i.status === 'OVERDUE');

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-white font-medium animate-bounce ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-200 text-sm font-semibold uppercase tracking-wider mb-1">
            <Library className="w-4 h-4" />
            <span>School Library & Books</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t('library.title', 'School Library & Books')}</h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">{t('library.subtitle', 'Manage catalog books, issue & return records, and overdue late fines')}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAddBookModal(true)}
          className="flex items-center space-x-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('library.addBook', 'Add Book to Catalog')}</span>
        </button>
      </div>

      {/* Fine Notice Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sky-900 text-sm">
          <div className="p-2 bg-sky-600 text-white rounded-lg">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">{t('library.fineNotice', 'Automatic Late Fine Tracker Active')}</span>
          </div>
        </div>
        <span className="text-xs bg-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full">Automated Tracking</span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('library.tabCatalog', 'Book Catalog & Stock')}</span>
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {booksList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('circulation')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'circulation'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('library.tabCirculation', 'Circulation & Borrowings')}</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {circulationLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 font-semibold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'overdue'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{t('library.tabOverdue', 'Overdue & Late Fines')}</span>
          {overdueList.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {overdueList.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: BOOK CATALOG & STOCK */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by book title, author, or book number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm bg-gray-50 font-medium"
            >
              <option value="">All Categories</option>
              <option value="TEXTBOOK">Textbook</option>
              <option value="REFERENCE">Reference</option>
              <option value="FICTION">Fiction</option>
              <option value="NON_FICTION">Non-Fiction</option>
            </select>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booksList.map((bk) => (
              <div
                key={bk._id}
                className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {bk.category}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{bk.shelfLocation}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">{bk.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">By <strong>{bk.author}</strong> ({bk.publisher})</p>
                  <div className="mt-2 text-[11px] font-mono text-gray-400">{bk.accessionNumber}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Available / Total</span>
                    <span className="text-sm font-extrabold text-sky-700">
                      {bk.quantityAvailable} / {bk.quantityTotal}
                    </span>
                  </div>

                  {bk.quantityAvailable > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedBook(bk);
                        setShowIssueModal(true);
                      }}
                      className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-transform hover:scale-105"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t('library.issueBook', 'Issue Book')}</span>
                    </button>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BOOK CIRCULATION & RETURNS */}
      {activeTab === 'circulation' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-base">Book Circulation & Borrowing Log</h3>
            <span className="text-xs text-gray-500">Standard Return Period: 14 Days</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">Issue ID</th>
                  <th className="px-6 py-3">Borrower ID</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Overdue Fine (₹)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {circulationLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">{log.issueId}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{log.borrowerId} ({log.borrowerType})</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{new Date(log.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-amber-700">{new Date(log.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-red-600">₹{log.overdueFine}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.status === 'RETURNED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status !== 'RETURNED' ? (
                        <button
                          onClick={() => handleReturnBook(log._id)}
                          className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-transform hover:scale-105"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return Book</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Returned</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OVERDUE BORROWERS */}
      {activeTab === 'overdue' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden space-y-4">
          <div className="p-5 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
            <h3 className="font-bold text-amber-900 text-base flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Overdue Borrowers & Unpaid Late Fines</span>
            </h3>
            <span className="text-xs bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-full">
              ₹5 / Day Overdue Fine Policy
            </span>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3">Issue Ref</th>
                  <th className="px-6 py-3">Borrower ID</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Computed Fine</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overdueList.map((item) => (
                  <tr key={item._id} className="hover:bg-amber-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">{item.issueId}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{item.borrowerId}</td>
                    <td className="px-6 py-4 text-xs font-bold text-red-600">{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-extrabold text-red-600">₹{item.overdueFine}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReturnBook(item._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        Return & Clear Fine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD BOOK TO CATALOG */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Library className="w-5 h-5 text-sky-600" />
              <span>{t('library.addBook', 'Add Book to Catalog')}</span>
            </h3>

            <form onSubmit={handleAddBook} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.accessionNumber', 'Book Serial / ISBN Number')}</label>
                  <input
                    type="text"
                    placeholder="e.g. ISBN-978-0134685991"
                    value={bookFormData.accessionNumber}
                    onChange={(e) => setBookFormData({ ...bookFormData, accessionNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.category', 'Category')}</label>
                  <select
                    value={bookFormData.category}
                    onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="TEXTBOOK">Textbook</option>
                    <option value="REFERENCE">Reference</option>
                    <option value="FICTION">Fiction</option>
                    <option value="NON_FICTION">Non-Fiction</option>
                    <option value="PERIODICAL">Periodical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.bookTitle', 'Book Title')}</label>
                <input
                  type="text"
                  placeholder="e.g. Higher Algebra for Competitive Exams"
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.author', 'Author Name')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall & Knight"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    placeholder="e.g. Macmillan"
                    value={bookFormData.publisher}
                    onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.totalCopies', 'Total Copies / Stock')}</label>
                  <input
                    type="number"
                    value={bookFormData.quantityTotal}
                    onChange={(e) => setBookFormData({ ...bookFormData, quantityTotal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.shelfLocation', 'Shelf / Rack Location')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Rack B-04"
                    value={bookFormData.shelfLocation}
                    onChange={(e) => setBookFormData({ ...bookFormData, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE BOOK */}
      {showIssueModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>Issue Book ({selectedBook.title})</span>
            </h3>

            <form onSubmit={handleIssueBook} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.borrowerType', 'Borrower Category')}</label>
                <select
                  value={issueFormData.borrowerType}
                  onChange={(e) => setIssueFormData({ ...issueFormData, borrowerType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Faculty / Staff Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('library.borrowerId', 'Borrower ID')}</label>
                <input
                  type="text"
                  placeholder="e.g. std_1001 or tch_101"
                  value={issueFormData.borrowerId}
                  onChange={(e) => setIssueFormData({ ...issueFormData, borrowerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Return Due Duration (Days)</label>
                <input
                  type="number"
                  value={issueFormData.daysToReturn}
                  onChange={(e) => setIssueFormData({ ...issueFormData, daysToReturn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Confirm Book Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eco Footer Badge */}
      <div className="bg-gradient-to-r from-emerald-500 to-sky-600 rounded-2xl p-4 text-white flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-sky-200" />
          <span>Save Water • Plant Trees Campaign</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trees className="w-4 h-4 text-emerald-200" />
          <span>School Library System Active 🌿</span>
        </div>
      </div>
    </div>
  );
}
