import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import AuthReminderModal from '../common/AuthReminderModal';

export const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-surface-bg text-slate-800 relative">
      <AuthReminderModal />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Main Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
