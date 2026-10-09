import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SystemHealthPage from './pages/SystemHealthPage';
import UserManagementPage from './pages/users/UserManagementPage';
import ProfilePage from './pages/users/ProfilePage';
import AcademicStructurePage from './pages/academics/AcademicStructurePage';
import StudentManagementPage from './pages/students/StudentManagementPage';
import TeacherManagementPage from './pages/teachers/TeacherManagementPage';
import StaffManagementPage from './pages/staff/StaffManagementPage';
import AttendanceManagementPage from './pages/attendance/AttendanceManagementPage';
import TimetableManagementPage from './pages/timetable/TimetableManagementPage';
import HomeworkManagementPage from './pages/homework/HomeworkManagementPage';
import ExamsManagementPage from './pages/exams/ExamsManagementPage';
import FeesManagementPage from './pages/fees/FeesManagementPage';
import PayrollManagementPage from './pages/payroll/PayrollManagementPage';
import LibraryManagementPage from './pages/library/LibraryManagementPage';
import TransportManagementPage from './pages/transport/TransportManagementPage';
import HostelManagementPage from './pages/hostel/HostelManagementPage';
import InventoryManagementPage from './pages/inventory/InventoryManagementPage';
import CalendarPage from './pages/communication/CalendarPage';
import NoticesPage from './pages/communication/NoticesPage';
import MeetingRoomPage from './pages/meetings/MeetingRoomPage';
import ReportsPage from './pages/reports/ReportsPage';
import PlaceholderPage from './pages/PlaceholderPage';

export const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes inside MainLayout */}
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/system-health" element={<SystemHealthPage />} />
                    
                    {/* Protected User Management Route */}
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute allowedRoles={['ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
                          <UserManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Profile Route */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 3 Academic Structure */}
                    <Route
                      path="/classes"
                      element={
                        <ProtectedRoute>
                          <AcademicStructurePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 4 Student Information System & Admissions */}
                    <Route
                      path="/students"
                      element={
                        <ProtectedRoute>
                          <StudentManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 5 Teachers & Staff Management */}
                    <Route
                      path="/teachers"
                      element={
                        <ProtectedRoute>
                          <TeacherManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/staff"
                      element={
                        <ProtectedRoute>
                          <StaffManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 6 Attendance & Leave System */}
                    <Route
                      path="/attendance"
                      element={
                        <ProtectedRoute>
                          <AttendanceManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 7 Timetable System */}
                    <Route
                      path="/timetable"
                      element={
                        <ProtectedRoute>
                          <TimetableManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 8 Homework & Study Materials */}
                    <Route
                      path="/homework"
                      element={
                        <ProtectedRoute>
                          <HomeworkManagementPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Phase 9 Exams, Assessment & Result Engine */}
                    <Route
                      path="/exams"
                      element={
                        <ProtectedRoute>
                          <ExamsManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 10 Fee Management, Gateway & Financial Audit Engine */}
                    <Route
                      path="/fees"
                      element={
                        <ProtectedRoute>
                          <FeesManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/finance" element={<PlaceholderPage title="School Finance" />} />
                    {/* Phase 11 HR, Staff Payroll & Attendance LOP Engine */}
                    <Route
                      path="/payroll"
                      element={
                        <ProtectedRoute>
                          <PayrollManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 12 Library Management & Book Circulation */}
                    <Route
                      path="/library"
                      element={
                        <ProtectedRoute>
                          <LibraryManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 13 Transport Management */}
                    <Route
                      path="/transport"
                      element={
                        <ProtectedRoute>
                          <TransportManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 14 Hostel Management */}
                    <Route
                      path="/hostel"
                      element={
                        <ProtectedRoute>
                          <HostelManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 15 Inventory & Asset Management */}
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute>
                          <InventoryManagementPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 17 Online Meetings & Virtual Classes */}
                    <Route
                      path="/meetings"
                      element={
                        <ProtectedRoute>
                          <MeetingRoomPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 16 Calendar, Events, Notices & Notifications */}
                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute>
                          <CalendarPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notices"
                      element={
                        <ProtectedRoute>
                          <NoticesPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Phase 18 Reports, Analytics & Global Search */}
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <ReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/settings" element={<PlaceholderPage title="System Settings" />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
