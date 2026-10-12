import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import LanguageToggle from '../../components/common/LanguageToggle';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Sprout, Droplets, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Phone, Building2, Globe } from 'lucide-react';

export const LoginPage = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(() => location.state?.isRegister || false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [languagePreference, setLanguagePreference] = useState('en');
  const [role, setRole] = useState('SUPER_ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setLoading(false);
        setErrorMsg('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLoading(false);
        setErrorMsg('Password must be at least 6 characters');
        return;
      }

      // Register New Account
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            schoolName,
            languagePreference,
            username: identifier,
            password,
            role,
          }),
        });
        const json = await res.json();
        setLoading(false);
        if (json.success) {
          setSuccessMsg('Account created successfully! Auto-logging in...');
          const loginRes = await login(identifier, password);
          if (loginRes.success) {
            setTimeout(() => navigate('/'), 500);
          }
        } else {
          setErrorMsg(json.message || 'Registration failed');
        }
      } catch (err) {
        setLoading(false);
        setErrorMsg('Network error registering account');
      }
    } else {
      // Login
      const res = await login(identifier, password);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(t('auth.loginSuccess'));
        setTimeout(() => navigate('/'), 500);
      } else {
        setErrorMsg(res.message || t('auth.loginError'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-ecoGreen-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl bg-white shadow-xl border border-slate-200/80 overflow-hidden">

        {/* Left Side Banner - Eco Theme Branding */}
        <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-ecoGreen-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">School ERP</h1>
                <p className="text-xs text-sky-100 font-medium">{t('app.slogan')}</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="text-2xl font-extrabold leading-tight">
                Sustainable Education Management System
              </h2>
              <p className="text-xs text-sky-50 leading-relaxed">
                Empowering modern school administration, students, and staff with scalable MERN-stack multi-tenant ERP architecture.
              </p>
            </div>
          </div>

          {/* Eco Tips */}
          <div className="relative z-10 pt-4 border-t border-white/20 text-xs flex items-center justify-between text-sky-100 font-medium">
            <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-sky-200" /> Save Water 💧</span>
            <span className="flex items-center gap-1.5"><Sprout className="w-4 h-4 text-emerald-200" /> Plant Trees 🌱</span>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Sprout className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Production Security</span>
              </div>
              <LanguageToggle />
            </div>

            {/* Auth Tab Selector */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${!isRegister ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${isRegister ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Register School
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              {isRegister ? 'Register Your School' : t('auth.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {isRegister ? 'Setup your institution and create the primary Super Admin account.' : t('auth.subtitle')}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-ecoGreen-50 border border-ecoGreen-200 text-xs text-ecoGreen-700 font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3.5">
              {isRegister && (
                <>
                  {/* Public Registration Notice */}
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <span>👑</span> School Owner / Super Admin Registration
                    </p>
                    <p className="text-amber-700 leading-relaxed">
                      Only one Super Admin is created per school. Teachers, staff, and students cannot register publicly—their accounts must be provisioned inside the system by the school administration.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      School / Institution Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Modern International Academy"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Super Admin Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. founder@school.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                      <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-between">
                        <span>Super Admin (Master)</span>
                        <Badge variant="sky">Super Admin</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Language Preference</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={languagePreference}
                          onChange={(e) => setLanguagePreference(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="en">English (Default)</option>
                          <option value="kn">Kannada (ಕನ್ನಡ)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRegister ? 'Choose Username' : t('auth.identifier')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isRegister ? 'e.g. principal_admin' : t('auth.identifierPlaceholder')}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {!isRegister && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" defaultChecked />
                    <span>{t('auth.rememberMe')}</span>
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Use Forgot Password flow'); }} className="text-sky-600 hover:text-sky-700 font-semibold">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                disabled={loading}
                icon={ArrowRight}
              >
                {loading ? (isRegister ? 'Registering School...' : t('auth.signingIn')) : (isRegister ? 'Register School & Super Admin' : t('auth.signIn'))}
              </Button>
            </form>
          </div>

          {/* Footer Clean Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Modern MERN Multi-Tenant School Management ERP Platform
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
