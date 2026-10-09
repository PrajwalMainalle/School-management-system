import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, UserPlus, LogIn, X, ShieldAlert } from 'lucide-react';

export const AuthReminderModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Do not show popup if user is logged in or if currently on login page
    if (user || location.pathname === '/login') {
      setIsOpen(false);
      return;
    }

    // Set 30-second timer to show register/login popup
    const timer = setInterval(() => {
      setIsOpen(true);
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [user, location.pathname]);

  const handleNavigateToLogin = (isRegister = false) => {
    setIsOpen(false);
    navigate('/login', { state: { isRegister } });
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  if (!isOpen || user || location.pathname === '/login') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 relative overflow-hidden space-y-5 transform transition-all scale-100">
        
        {/* Eco Accent Header Bar */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-ecoGreen-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">School ERP Account Notice</h3>
              <p className="text-sky-100 text-xs">Access all school management features</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-center space-y-3 px-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          
          <h4 className="text-lg font-extrabold text-slate-800">
            Sign In or Create Your Account
          </h4>
          
          <p className="text-xs text-slate-600 leading-relaxed">
            You are currently exploring in visitor mode. To save changes, manage classes, view reports, or register students, please log in to your account.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => handleNavigateToLogin(true)}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-600 to-ecoGreen-600 hover:from-sky-700 hover:to-ecoGreen-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-transform hover:scale-[1.02] text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account / Register</span>
          </button>

          <button
            onClick={() => handleNavigateToLogin(false)}
            className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs"
          >
            <LogIn className="w-4 h-4 text-sky-600" />
            <span>Already have an account? Sign In</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            Remind Me in 30 Seconds
          </button>
        </div>

        {/* Eco Footer Note */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center flex items-center justify-center space-x-2">
          <span>🌿 School ERP • Secure & Paperless Management</span>
        </div>

      </div>
    </div>
  );
};

export default AuthReminderModal;
