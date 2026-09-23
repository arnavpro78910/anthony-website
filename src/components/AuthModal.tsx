import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Building2,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { UserAccount, CompanyBranding } from '../types';
import {
  registerUser,
  loginUser,
  loginAsAdmin,
  generateAccountRecoveryCode,
  verifyAccountRecoveryCode,
  updateAccountPassword,
  loginAfterRecoveryWithOldPassword
} from '../utils/storage';
import { sendRealRecoveryEmail } from '../services/authService';
import { GoogleSignInModal } from './GoogleSignInModal';
import { EmailVerificationModal } from './EmailVerificationModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: CompanyBranding;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  branding,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'options' | 'update_password'>('request');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Dedicated Admin Login inputs (never pre-filled with plaintext secrets)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals for Google Auth & Email Verification
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        if (mode === 'admin') {
          if (!adminUsername.trim()) {
            setError('Please provide the Admin Username');
            return;
          }
          if (!adminPassword) {
            setError('Please provide the Admin Password');
            return;
          }

          const res = loginAsAdmin(adminUsername, adminPassword);
          if (res.success && res.user) {
            onAuthSuccess(res.user);
            onClose();
          } else {
            setError(res.error || 'Admin authentication failed. Please verify credentials.');
          }
        } else if (mode === 'register') {
          if (!name.trim()) {
            setError('Please provide your full legal name');
            return;
          }
          if (!emailOrUsername.trim() || !emailOrUsername.includes('@')) {
            setError('Please provide a valid email address');
            return;
          }
          if (password.length < 4) {
            setError('Password should be at least 4 characters long');
            return;
          }

          const res = registerUser(name, emailOrUsername, password);
          if (res.requiresVerification && res.user) {
            setVerificationEmail(res.user.email);
            setShowVerificationModal(true);
          } else if (res.success && res.user) {
            onAuthSuccess(res.user);
            onClose();
          } else {
            setError(res.error || 'Registration failed');
          }
        } else {
          if (!emailOrUsername.trim()) {
            setError('Please provide your username or email address');
            return;
          }
          if (!password) {
            setError('Please enter your password');
            return;
          }
          const res = loginUser(emailOrUsername, password);
          if (res.requiresVerification && res.verificationEmail) {
            setVerificationEmail(res.verificationEmail);
            setShowVerificationModal(true);
            setError(null);
          } else if (res.success && res.user) {
            onAuthSuccess(res.user);
            onClose();
          } else {
            setError(res.error || 'Login failed. Please check credentials.');
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Authentication error. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSwitchToAdmin = () => {
    setMode('admin');
    setError(null);
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoveryStatus(null);
    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        const res = generateAccountRecoveryCode(recoveryEmail);
        if (res.success && res.code) {
          const mailRes = await sendRealRecoveryEmail(recoveryEmail, res.code, res.name, branding.companyName);
          if (mailRes.success) {
            setRecoveryStep('verify');
            setRecoveryStatus(`Recovery code sent successfully. Please check your email inbox!`);
          } else {
            setError(mailRes.error || 'Failed to send recovery email. Please try again.');
          }
        } else {
          setError(res.error || 'No account registered with this email address.');
        }
      } catch (err: any) {
        setError(err?.message || 'Error occurred during recovery request.');
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoveryStatus(null);
    if (recoveryCode.trim().length !== 6) {
      setError('Please enter a 6-digit recovery code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyAccountRecoveryCode(recoveryEmail, recoveryCode);
      if (res.success) {
        setRecoveryStep('options');
        setRecoveryStatus('Identity verified! Choose whether you want to update your password or continue with your old password.');
      } else {
        setError(res.error || 'Invalid recovery code. Please try again.');
      }
      setLoading(false);
    }, 350);
  };

  const handleContinueWithOld = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = loginAfterRecoveryWithOldPassword(recoveryEmail);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
        setIsRecoveryMode(false);
      } else {
        setError(res.error || 'Failed to authenticate.');
      }
      setLoading(false);
    }, 350);
  };

  const handleChooseUpdate = () => {
    setError(null);
    setRecoveryStatus(null);
    setRecoveryStep('update_password');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = updateAccountPassword(recoveryEmail, newPassword);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
        setIsRecoveryMode(false);
      } else {
        setError(res.error || 'Failed to save new password.');
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="auth-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className={`p-6 relative text-white ${isRecoveryMode ? 'bg-slate-900 border-b border-red-500/20' : mode === 'admin' ? 'bg-slate-950 border-b border-amber-500/40' : 'bg-slate-900'}`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${isRecoveryMode ? 'bg-red-600' : mode === 'admin' ? 'bg-amber-600' : 'bg-blue-600'}`}>
              {isRecoveryMode ? <ShieldAlert className="w-4 h-4" /> : mode === 'admin' ? <KeyRound className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isRecoveryMode ? 'text-red-300' : mode === 'admin' ? 'text-amber-400' : 'text-blue-300'}`}>
              {branding.companyName}
            </span>
          </div>
          
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {isRecoveryMode ? (
              'Recover Your Account'
            ) : mode === 'admin' ? (
              <>
                <span>Admin Master Access</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Full Control
                </span>
              </>
            ) : mode === 'login' ? (
              'Sign In to Your Account'
            ) : (
              'Create Submitter Account'
            )}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {isRecoveryMode
              ? 'Enter your registered email below to receive a secure recovery code via email.'
              : mode === 'admin'
              ? 'Authorized portal administration with dashboard customization, all IDs, and form governance.'
              : mode === 'login'
              ? 'Check the live status of your submission and manage account details.'
              : 'Each verified account is permitted 1 official submission to ensure authentic intake.'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Tabs switch: Sign In | Create Account | Log In As Admin */}
          {!isRecoveryMode && (
            <div className="flex rounded-lg bg-slate-100 p-1 mb-5">
              <button
                id="switch-login-tab"
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                id="switch-register-tab"
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
              <button
                id="switch-admin-tab"
                type="button"
                onClick={() => { setMode('admin'); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'admin'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                }`}
              >
                <KeyRound className="w-3 h-3" />
                <span>Log in as Admin</span>
              </button>
            </div>
          )}

          {recoveryStatus && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium leading-relaxed">
              {recoveryStatus}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Form Fields */}
          {isRecoveryMode ? (
            /* Account Recovery Flow */
            <div className="space-y-4">
              {recoveryStep === 'request' && (
                <form onSubmit={handleRequestRecovery} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Enter Account Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="recovery-email-input"
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="recovery-request-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Send Recovery Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(false)}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer block"
                  >
                    Cancel and Return to Sign In
                  </button>
                </form>
              )}

              {recoveryStep === 'verify' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Enter 6-Digit Verification Code *
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="recovery-code-input"
                        type="text"
                        required
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs tracking-[0.25em] text-center font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="recovery-verify-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Verify Recovery Code</span>
                        <UserCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecoveryStep('request')}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer block"
                  >
                    Back to Email Address
                  </button>
                </form>
              )}

              {recoveryStep === 'options' && (
                <div className="space-y-3 pt-2">
                  <button
                    id="recovery-update-password-btn"
                    type="button"
                    onClick={handleChooseUpdate}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer text-center block"
                  >
                    Update My Password
                  </button>

                  <button
                    id="recovery-old-password-btn"
                    type="button"
                    onClick={handleContinueWithOld}
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center block"
                  >
                    Continue with My Existing Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(false)}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors text-center cursor-pointer block"
                  >
                    Cancel and Return to Sign In
                  </button>
                </div>
              )}

              {recoveryStep === 'update_password' && (
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Set New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="recovery-new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="recovery-save-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Save Password & Sign In</span>
                        <LogIn className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecoveryStep('options')}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer block"
                  >
                    Back to Choice
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'admin' ? (
                /* Dedicated Admin login section */
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Administrator Credentials Required</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Please provide the designated administrator credentials to access system controls.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Admin Username *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="admin-username-input"
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Enter admin username"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Admin Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="admin-password-input"
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="admin-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-black text-amber-400 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 border border-amber-500/30"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Authenticate as Administrator</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Standard User Login / Register */
                <>
                  {/* Official Google Single Sign-On / Registration */}
                  <div>
                    <button
                      id="auth-google-signin-btn"
                      type="button"
                      onClick={() => setShowGoogleModal(true)}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs border border-slate-300 transition-all cursor-pointer hover:border-slate-400 active:scale-[0.99]"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>
                        {mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
                      </span>
                    </button>

                    <div className="relative my-3.5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                        <span className="bg-white px-2 text-slate-400">
                          or with manual email & password
                        </span>
                      </div>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Full Legal Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="auth-register-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jordan Mitchell"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {mode === 'login' ? 'Username or Email Address *' : 'Corporate or Personal Email *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="auth-email-input"
                        type="text"
                        required
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder={mode === 'login' ? 'name@company.com or username' : 'name@organization.com'}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="auth-password-input"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    {mode === 'login' && (
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRecoveryMode(true);
                            setRecoveryStep('request');
                            setError(null);
                            setRecoveryStatus(null);
                          }}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to Account</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Verify Email & Register</span>
                      </>
                    )}
                  </button>

                  {mode === 'register' && (
                    <p className="text-[11px] text-center text-slate-500 mt-1.5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>A 6-digit verification code will be sent to your email</span>
                    </p>
                  )}
                </>
              )}
            </form>
          )}

          {/* Portal Administration Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need administrative control?</span>
            <button
              id="quick-admin-login-link-btn"
              type="button"
              onClick={handleSwitchToAdmin}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>Admin Authentication</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Enterprise Access Control (RBAC)</span>
        </div>
      </div>

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        branding={branding}
        mode={mode === 'admin' ? 'login' : mode}
        onAuthSuccess={(u) => {
          setShowGoogleModal(false);
          onAuthSuccess(u);
          onClose();
        }}
      />

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          branding={branding}
          onSuccess={(u) => {
            setShowVerificationModal(false);
            onAuthSuccess(u);
            onClose();
          }}
          onBackOrCancel={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
};
