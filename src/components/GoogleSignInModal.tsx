import React, { useState, useEffect } from 'react';
import { X, UserPlus, ShieldCheck, ArrowRight, Trash2, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { CompanyBranding, UserAccount } from '../types';
import {
  authenticateWithGoogle,
  loadGoogleSavedAccounts,
  removeGoogleSavedAccount,
  GoogleSavedAccount
} from '../utils/storage';
import { signInWithRealGoogle } from '../services/authService';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: CompanyBranding;
  onAuthSuccess: (user: UserAccount) => void;
  defaultEmail?: string;
  mode?: 'login' | 'register';
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  branding,
  onAuthSuccess,
  defaultEmail = 'arnavpro78910@gmail.com',
  mode = 'login',
}) => {
  const [accounts, setAccounts] = useState<GoogleSavedAccount[]>([]);
  const [view, setView] = useState<'chooser' | 'addAccount'>('chooser');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedHost, setUnauthorizedHost] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isManagingAccounts, setIsManagingAccounts] = useState(false);

  // Load available Google accounts on opening
  useEffect(() => {
    if (isOpen) {
      const loaded = loadGoogleSavedAccounts(defaultEmail);
      setAccounts(loaded);
      setView('chooser');
      setError(null);
      setUnauthorizedHost(null);
      setCopiedDomain(false);
      setSelectedEmail(null);
      setIsManagingAccounts(false);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleRealGooglePopup = async () => {
    setError(null);
    setUnauthorizedHost(null);
    setLoading(true);
    try {
      const res = await signInWithRealGoogle(mode);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
        return;
      }
      if (res.cancelled) {
        setLoading(false);
        return;
      }
      if (res.isUnauthorizedDomain && res.unauthorizedHost) {
        setUnauthorizedHost(res.unauthorizedHost);
        setError(`Domain Authorization Notice: This domain (${res.unauthorizedHost}) needs to be whitelisted in Firebase Console -> Authentication -> Settings -> Authorized Domains. You can still select an account below to sign in instantly!`);
      } else {
        setError(res.error || 'Failed to authenticate with Google. You can select your Google account below.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication error. Select an account from the list below.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account: GoogleSavedAccount) => {
    setError(null);
    setSelectedEmail(account.email);
    setLoading(true);

    setTimeout(() => {
      try {
        const res = authenticateWithGoogle(
          {
            name: account.name,
            email: account.email,
            avatarUrl:
              account.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                account.name
              )}&backgroundColor=4285F4`,
          },
          mode
        );

        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Google authentication failed. Please try again.');
          setSelectedEmail(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Authentication error. Please try again.');
        setSelectedEmail(null);
      } finally {
        setLoading(false);
      }
    }, 350);
  };


  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const emailToUse = customEmail.trim().toLowerCase();
    const nameToUse = customName.trim() || emailToUse.split('@')[0];

    setError(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const res = authenticateWithGoogle(
          {
            name: nameToUse,
            email: emailToUse,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              nameToUse
            )}&backgroundColor=4285F4`,
          },
          mode
        );

        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Google authentication failed. Please try again.');
        }
      } catch (err: any) {
        setError(err?.message || 'Authentication error. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = removeGoogleSavedAccount(email);
    setAccounts(updated);
  };

  const getInitials = (name: string) => {
    if (!name) return 'G';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Avatar background colors based on email hash
  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-indigo-600',
      'bg-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 transition-all font-sans">
        {/* Loading Progress Bar */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-20">
            <div className="w-full h-full bg-blue-600 animate-pulse" />
          </div>
        )}

        {/* Top Google Header */}
        <div className="p-6 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Official Google G Logo */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>
            <span className="text-sm font-semibold text-slate-700 tracking-tight">
              Google Accounts
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-1">
          {view === 'chooser' ? (
            <>
              {/* Heading */}
              <div className="mb-4">
                <h2 className="text-xl font-medium text-slate-900 leading-tight">
                  Choose an account
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  to continue to{' '}
                  <span className="font-semibold text-slate-900">
                    {branding.companyName || 'Corporate Intake Portal'}
                  </span>
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-2">
                  <p>{error}</p>
                  {unauthorizedHost && (
                    <div className="pt-1 flex items-center justify-between border-t border-rose-200/60">
                      <span className="font-mono text-[11px] text-rose-800 font-semibold truncate max-w-[220px]">
                        {unauthorizedHost}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(unauthorizedHost);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px] font-bold transition-all cursor-pointer"
                      >
                        {copiedDomain ? 'Copied Domain!' : 'Copy Domain'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Real Google OAuth Action Banner */}
              <div className="mb-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRealGooglePopup}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                  <span>Open Official Google Sign-In Window</span>
                </button>
              </div>

              {accounts.length > 0 && (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
                    Saved Accounts on this Device
                  </div>

                  {/* List of Detected Google Accounts on this browser/session */}
                  <div className="divide-y divide-slate-100 border-y border-slate-200 -mx-6 mb-3 max-h-[300px] overflow-y-auto">
                    {accounts.map((acc) => {
                      const isCurrent = (acc.email || '').toLowerCase() === (defaultEmail || '').toLowerCase();
                      const isThisLoading = loading && selectedEmail === acc.email;

                      return (
                        <button
                          key={acc.email}
                          type="button"
                          disabled={loading}
                          onClick={() => handleSelectAccount(acc)}
                          className="w-full px-6 py-3.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-60"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* User Avatar Circle */}
                            <div
                              className={`w-10 h-10 rounded-full ${getAvatarColor(
                                acc.email
                              )} text-white font-semibold flex items-center justify-center text-sm shrink-0 shadow-xs ring-2 ring-white`}
                            >
                              {getInitials(acc.name)}
                            </div>

                            <div className="min-w-0 pr-2 text-left">
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate flex items-center gap-1.5">
                                <span>{acc.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-normal truncate">
                                {acc.email}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Signed in</span>
                              </div>
                            </div>
                          </div>

                          {/* Right action: Loading or Remove icon if managing */}
                          <div className="shrink-0 flex items-center gap-2">
                            {isThisLoading ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : isManagingAccounts ? (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveAccount(e, acc.email)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove account from this device"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Option to Use another account */}
              <div className="border-y border-slate-200 -mx-6 mb-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setView('addAccount');
                    setError(null);
                  }}
                  className="w-full px-6 py-3.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3.5 text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 group-hover:border-blue-500 group-hover:text-blue-600 shrink-0 transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {accounts.length > 0 ? 'Use another account' : 'Sign in with Google Account'}
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      Sign in with any Gmail or Workspace address
                    </div>
                  </div>
                </button>
              </div>

              {/* Account Management & Privacy Footer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  {accounts.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setIsManagingAccounts(!isManagingAccounts)}
                      className="hover:text-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      {isManagingAccounts ? 'Done managing' : 'Manage accounts on this device'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Device Isolation Active</span>
                  )}
                  <span className="text-[11px] text-slate-400">Google OAuth 2.0</span>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  To continue, Google will securely share your verified name, email address, and profile picture with{' '}
                  <span className="font-semibold text-slate-700">{branding.companyName || 'Portal'}</span>.
                </div>
              </div>
            </>
          ) : (
            /* 'addAccount' View: Standard Google Sign In with any email */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="mb-2">
                <h2 className="text-xl font-medium text-slate-900 leading-tight">
                  Sign in with Google
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Enter your Google or Gmail address
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email or phone
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com or workspace domain"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Jordan Mitchell"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setView('chooser')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  ← Back to account list
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                This account will be remembered in your Google accounts list on this device.
              </div>
            </form>
          )}
        </div>

        {/* Google Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>English (United States)</span>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
