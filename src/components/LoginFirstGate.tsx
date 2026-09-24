import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  Mail,
  LogIn,
  UserPlus,
  ShieldCheck,
  FileCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { CompanyBranding, UserAccount } from '../types';
import { CompanyLogo } from './CompanyLogo';
import {
  loginUser,
  registerUser,
  loginAsAdmin,
  generateAccountRecoveryCode,
  verifyAccountRecoveryCode,
  updateAccountPassword,
  loginAfterRecoveryWithOldPassword,
  generateAdminRecoveryCode,
  verifyAdminRecoveryCode,
  updateAdminPassword,
  loginAfterAdminRecoveryWithOldPassword
} from '../utils/storage';
import { GoogleSignInModal } from './GoogleSignInModal';
import { EmailVerificationModal } from './EmailVerificationModal';
import { signInWithRealGoogle, sendRealRecoveryEmail } from '../services/authService';

interface LoginFirstGateProps {
  branding: CompanyBranding;
  onAuthSuccess: (user: UserAccount) => void;
}

export const LoginFirstGate: React.FC<LoginFirstGateProps> = ({
  branding,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'options' | 'update_password'>('request');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const [recoveryPreviewUrl, setRecoveryPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Admin credentials input (values are blank by default, never revealed)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Modals for Google Auth & Email Verification
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleRealGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await signInWithRealGoogle(mode === 'admin' ? 'login' : mode);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        return;
      }
      
      if (res.cancelled) {
        setGoogleLoading(false);
        return;
      }

      if (res.isPopupBlocked) {
        setError('Popup was blocked by your browser settings. Please allow popups or select your Google account below.');
        setShowGoogleModal(true);
      } else if (res.isUnauthorizedDomain) {
        setError(`Firebase Auth Notice: This domain (${res.unauthorizedHost || 'preview domain'}) is not authorized in Firebase Console yet. Select your Google account below to proceed.`);
        setShowGoogleModal(true);
      } else {
        setError(res.error || 'Google authentication encountered an issue.');
        setShowGoogleModal(true);
      }
    } catch (err: any) {
      console.warn('Real Google Auth error:', err);
      setError('Could not complete Google popup. Opening account selector.');
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendRecoveryCode = async () => {
    setError(null);
    setRecoveryStatus(null);
    setLoading(true);
    
    setTimeout(async () => {
      try {
        let res;
        if (mode === 'admin') {
          res = generateAdminRecoveryCode(adminUsername);
        } else {
          res = generateAccountRecoveryCode(recoveryEmail);
        }

        if (res.success && res.code) {
          const destEmail = mode === 'admin' 
            ? (localStorage.getItem('company_ceo_recovery_email') || 'arnavpro78910@gmail.com')
            : recoveryEmail;
            
          const resName = (res as any).name || adminUsername;
          const mailRes = await sendRealRecoveryEmail(destEmail, res.code, resName, branding.companyName);
          if (mailRes.success) {
            setRecoveryStatus(`A new recovery code has been sent to your email!`);
            if (mailRes.previewUrl) setRecoveryPreviewUrl(mailRes.previewUrl);
          } else {
            setError(mailRes.error || 'Failed to resend recovery email.');
          }
        } else {
          setError(res.error || 'Recovery error occurred.');
        }
      } catch (err: any) {
        setError(err?.message || 'Error occurred during resend.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

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
          } else {
            setError(res.error || 'Authentication failed. Please verify credentials.');
          }
        } else if (mode === 'register') {
          if (!name.trim()) {
            setError('Please provide your full name');
            return;
          }
          if (!emailOrUsername.trim() || !emailOrUsername.includes('@')) {
            setError('Please provide a valid corporate or personal email');
            return;
          }
          if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
          }

          const res = registerUser(name, emailOrUsername, password);
          if (res.requiresVerification && res.user) {
            setVerificationEmail(res.user.email);
            setShowVerificationModal(true);
          } else if (res.success && res.user) {
            onAuthSuccess(res.user);
          } else {
            setError(res.error || 'Registration failed');
          }
        } else {
          if (!emailOrUsername.trim()) {
            setError('Please provide your email address or username');
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
          } else {
            const errorMsg = res.error || 'Login failed. Please check credentials.';
            if (errorMsg.toLowerCase().includes('password')) {
              setError(`${errorMsg} You can use the "Forgot password?" link below to reset it via email.`);
            } else {
              setError(errorMsg);
            }
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Authentication error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);
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
        // PRE-CHECK: Check if account is suspended/banned before allowing recovery
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const targetUser = users.find((u: any) => u.email.toLowerCase() === recoveryEmail.toLowerCase());
        
        if (targetUser && targetUser.isBanned) {
          const now = new Date();
          const bannedUntil = targetUser.bannedUntil ? new Date(targetUser.bannedUntil) : null;
          const isPerm = !bannedUntil;
          
          if (isPerm || (bannedUntil && bannedUntil > now)) {
            let msg = 'Account Restricted: This portal account is currently suspended.';
            if (!isPerm && bannedUntil) {
              const diff = bannedUntil.getTime() - now.getTime();
              const mins = Math.ceil(diff / 60000);
              msg = `Account Restricted: Your account is currently suspended. Access will be restored in ${mins} minutes. Contact Administration for details.`;
            }
            setError(msg);
            setLoading(false);
            return;
          }
        }

        const res = generateAccountRecoveryCode(recoveryEmail);
        if (res.success && res.code) {
          const mailRes = await sendRealRecoveryEmail(recoveryEmail, res.code, res.name, branding.companyName);
          if (mailRes.success) {
            setRecoveryStep('verify');
            setRecoveryStatus(`Recovery code sent successfully. Please check your email inbox!`);
            if (mailRes.previewUrl) {
              setRecoveryPreviewUrl(mailRes.previewUrl);
            }
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
        setIsRecoveryMode(false);
      } else {
        setError(res.error || 'Failed to save new password.');
      }
      setLoading(false);
    }, 350);
  };

  const handleRequestAdminRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoveryStatus(null);
    if (!adminUsername.trim()) {
      setError('Please provide your Admin or CEO username.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        const res = generateAdminRecoveryCode(adminUsername);
        if (res.success && res.code) {
          const recoveryEmailDest = localStorage.getItem('company_ceo_recovery_email') || 'arnavpro78910@gmail.com';
          const mailRes = await sendRealRecoveryEmail(recoveryEmailDest, res.code, adminUsername, branding.companyName);
          if (mailRes.success) {
            setRecoveryStep('verify');
            setRecoveryStatus(`Recovery code sent to secure destination (${recoveryEmailDest}). Please check inbox!`);
            if (mailRes.previewUrl) {
              setRecoveryPreviewUrl(mailRes.previewUrl);
            }
          } else {
            setError(mailRes.error || 'Failed to dispatch recovery code email.');
          }
        } else {
          setError(res.error || 'Admin account not found with this username.');
        }
      } catch (err: any) {
        setError(err?.message || 'Error occurred during admin recovery.');
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleVerifyAdminCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoveryStatus(null);
    if (recoveryCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit recovery code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = verifyAdminRecoveryCode(adminUsername, recoveryCode);
      if (res.success) {
        setRecoveryStep('options');
        setRecoveryStatus('Admin identity verified! Choose whether to update password or continue with your old password.');
      } else {
        setError(res.error || 'Invalid recovery code.');
      }
      setLoading(false);
    }, 350);
  };

  const handleContinueWithOldAdmin = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = loginAfterAdminRecoveryWithOldPassword(adminUsername);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        setIsRecoveryMode(false);
      } else {
        setError(res.error || 'Failed to authenticate admin.');
      }
      setLoading(false);
    }, 350);
  };

  const handleSaveAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = updateAdminPassword(adminUsername, newPassword);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        setIsRecoveryMode(false);
      } else {
        setError(res.error || 'Failed to update admin password.');
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Corporate Grid / Ambient Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Brand & Portal Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mb-4 backdrop-blur-md ring-1 ring-white/5">
          <CompanyLogo branding={branding} size="lg" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {branding.companyName || 'Anthony India'}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Corporate Intake & Compliance Portal</span>
          </div>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {branding.tagline || 'Official Enterprise Intake & Document Filing System'}
          </p>
        </div>
      </div>

      {/* Main Auth Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl ring-1 ring-white/5">
          {/* Mode Switcher Tabs */}
          {!isRecoveryMode && (
            <div className="flex rounded-2xl bg-slate-950/80 p-1.5 mb-6 border border-slate-800/80">
              <button
                id="gate-mode-login-btn"
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                Sign In
              </button>
              <button
                id="gate-mode-register-btn"
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                Create Account
              </button>
              <button
                id="gate-mode-admin-btn"
                type="button"
                onClick={() => { setMode('admin'); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Subheading status */}
          <div className="mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {isRecoveryMode ? (
                mode === 'admin' ? (
                  <>
                    <span>Recover Admin/CEO Account</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Security
                    </span>
                  </>
                ) : (
                  'Reset Your Password'
                )
              ) : mode === 'admin' ? (
                <>
                  <span>Administrator Authentication</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Restricted
                  </span>
                </>
              ) : mode === 'register' ? (
                'Submitter Registration'
              ) : (
                'Authorized Account Sign In'
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRecoveryMode
                ? mode === 'admin'
                  ? 'Enter your Admin or CEO username below to receive a secure recovery code sent to your configured corporate destination.'
                  : 'If you have lost access to your portal account, enter your registered email address below to receive a secure 6-digit verification code to reset your password.'
                : mode === 'admin'
                ? 'Authorized portal administration with dashboard customization, all IDs, and form governance.'
                : mode === 'register'
                ? 'Sign up to submit your official filing and track progress through your account dashboard.'
                : 'Sign in to access your intake form and monitor review status.'}
            </p>
          </div>

          {recoveryStatus && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{recoveryStatus}</span>
            </div>
          )}

          {recoveryPreviewUrl && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-1.5 shadow-md">
              <span className="block font-bold">🧪 DEV ENVIRONMENT DETECTED</span>
              <span className="block text-[11px] text-slate-300 leading-normal">
                Direct SMTP port restrictions are active on container runtime. Your recovery email was successfully routed to our secure, interactive Ethereal test mailbox.
              </span>
              <a 
                href={recoveryPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 hover:underline pt-1 text-xs"
              >
                <span>Click Here to View Sent Email & Retrieve Code ↗</span>
              </a>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          {isRecoveryMode ? (
            /* Account Recovery Flow */
            <div className="space-y-4">
              {recoveryStep === 'request' && (
                mode === 'admin' ? (
                  <form onSubmit={handleRequestAdminRecovery} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Enter Admin or CEO Username *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="gate-recovery-admin-username-input"
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="e.g. aasnc"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      id="gate-recovery-request-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
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
                      className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors text-center cursor-pointer block"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRequestRecovery} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Enter Account Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="gate-recovery-email-input"
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      id="gate-recovery-request-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
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
                      className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors text-center cursor-pointer block"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </form>
                )
              )}

              {recoveryStep === 'verify' && (
                <form onSubmit={mode === 'admin' ? handleVerifyAdminCode : handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Enter 6-Digit Verification Code *
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="gate-recovery-code-input"
                        type="text"
                        required
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs tracking-[0.25em] text-center font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <button
                    id="gate-recovery-verify-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Verify Identity</span>
                        <UserCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleResendRecoveryCode}
                      className="w-full py-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors text-center cursor-pointer disabled:opacity-50"
                    >
                      Resend Recovery Code
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('request')}
                      className="w-full py-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      Use a different email
                    </button>
                  </div>
                </form>
              )}

              {recoveryStep === 'options' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-300 mb-1">Identity Verified</h3>
                    <p className="text-xs text-slate-400">Success! You have successfully verified your email ownership. How would you like to proceed?</p>
                  </div>

                  <button
                    id="gate-recovery-update-password-btn"
                    type="button"
                    onClick={handleChooseUpdate}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer text-center block"
                  >
                    Set a New Password
                  </button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold">
                      <span className="bg-slate-900 px-3 text-slate-500">or</span>
                    </div>
                  </div>

                  <button
                    id="gate-recovery-old-password-btn"
                    type="button"
                    onClick={mode === 'admin' ? handleContinueWithOldAdmin : handleContinueWithOld}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer text-center block border border-slate-700"
                  >
                    I Remembered My Old Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(false)}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors text-center cursor-pointer block"
                  >
                    Cancel & Sign In
                  </button>
                </div>
              )}

              {recoveryStep === 'update_password' && (
                <form onSubmit={mode === 'admin' ? handleSaveAdminPassword : handleSavePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Set New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="gate-recovery-new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <button
                    id="gate-recovery-save-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
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
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors text-center cursor-pointer block"
                  >
                    Back to Choice
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'admin' ? (
                /* Dedicated Admin Mode */
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Admin / CEO Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="gate-admin-username-input"
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Enter admin or ceo username"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="gate-admin-password-input"
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryMode(true);
                        setRecoveryStep('request');
                        setError(null);
                        setRecoveryStatus(null);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Forgot Admin Password?
                    </button>
                  </div>

                  <button
                    id="gate-admin-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Authenticate as Admin</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* User Login or Registration */
                <>
                  {/* Official Google Single Sign-On / Registration */}
                  <div>
                    <button
                      id="gate-google-signin-btn"
                      type="button"
                      disabled={loading || googleLoading}
                      onClick={handleRealGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold shadow-md border border-slate-200 transition-all cursor-pointer hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                    >
                      {googleLoading ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
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
                      )}
                      <span>
                        {googleLoading
                          ? 'Connecting to Google...'
                          : mode === 'register'
                          ? 'Sign up with Google'
                          : 'Continue with Google'}
                      </span>
                    </button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                        <span className="bg-slate-950 px-2.5 text-slate-500">
                          or continue with manual email
                        </span>
                      </div>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Full Legal Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="gate-register-name-input"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jordan Mitchell"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      {mode === 'login' ? 'Email Address or Username' : 'Corporate or Personal Email'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="gate-email-input"
                        type="text"
                        required
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder={mode === 'login' ? 'name@company.com or username' : 'name@organization.com'}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="gate-password-input"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent placeholder:text-slate-600"
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
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Forgot password?</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    id="gate-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In & Enter Portal</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Verify Email & Create Account</span>
                      </>
                    )}
                  </button>

                  {mode === 'register' && (
                    <p className="text-[11px] text-center text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>A 6-digit code will be sent to your email to verify ownership</span>
                    </p>
                  )}
                </>
              )}
            </form>
          )}

          {/* Quick link to switch between user login and admin */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            {mode === 'admin' ? (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Return to standard sign in
              </button>
            ) : (
              <>
                <span className="text-slate-400">Portal administration?</span>
                <button
                  type="button"
                  onClick={() => { setMode('admin'); setError(null); }}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Sign In</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Security protocol callout */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Intake Protocol • Verified 1 Submission Allowance</span>
        </div>
      </div>

      {/* Google Authentication Dialog */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        branding={branding}
        mode={mode === 'admin' ? 'login' : mode}
        onAuthSuccess={onAuthSuccess}
      />

      {/* Manual Email Verification PIN Dialog */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          branding={branding}
          onSuccess={(user) => {
            setShowVerificationModal(false);
            onAuthSuccess(user);
          }}
          onBackOrCancel={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
};
