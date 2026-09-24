import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Trash2,
  Lock,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  ClipboardList,
  Headphones,
  Home,
  Shield,
  Sparkles,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { UserAccount, FormSubmission, CompanyBranding } from '../types';
import { updateUserPassword, deleteUserAccount, getUserSubmissions } from '../utils/storage';
import { getThemeClasses } from '../utils/theme';

interface UserAccountViewProps {
  currentUser: UserAccount;
  branding: CompanyBranding;
  userSubmission: FormSubmission | null;
  onNavigateToTab: (tab: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant') => void;
  onLogout: () => void;
  refreshAllData: () => void;
}

export const UserAccountView: React.FC<UserAccountViewProps> = ({
  currentUser,
  branding,
  userSubmission,
  onNavigateToTab,
  onLogout,
  refreshAllData,
}) => {
  const theme = getThemeClasses(branding.themePreset);
  const userSubmissions = getUserSubmissions(currentUser.id, currentUser.email);
  const maxLimit = Math.min(9, Math.max(1, currentUser.submissionLimit || 1));

  // Password Update State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Google Set Password State
  const [googlePassNew, setGooglePassNew] = useState('');
  const [googlePassConfirm, setGooglePassConfirm] = useState('');
  const [googlePassError, setGooglePassError] = useState<string | null>(null);
  const [googlePassSuccess, setGooglePassSuccess] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = updateUserPassword(currentUser.id, newPassword, oldPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordSuccess('Password successfully updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  const handleSetGooglePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setGooglePassError(null);
    setGooglePassSuccess(null);

    if (!googlePassNew || googlePassNew.length < 6) {
      setGooglePassError('Password must be at least 6 characters.');
      return;
    }
    if (googlePassNew !== googlePassConfirm) {
      setGooglePassError('Passwords do not match.');
      return;
    }

    const res = updateUserPassword(currentUser.id, googlePassNew);
    if (res.success) {
      setGooglePassSuccess('Direct password successfully set for your Google account!');
      setGooglePassNew('');
      setGooglePassConfirm('');
      refreshAllData();
      setTimeout(() => setGooglePassSuccess(null), 4000);
    } else {
      setGooglePassError(res.error || 'Failed to set password.');
    }
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteInputText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }
    deleteUserAccount(currentUser.id, true);
    onLogout();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in" id="user-account-view-root">
      {/* 1. TOP HEADER & QUICK CONNECT BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Profile
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Submitter
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Submission Quota Meter */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Intake Submission Allowance</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {userSubmissions.length} of {maxLimit} Submissions Used
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                userSubmissions.length >= maxLimit
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.min(100, Math.max(8, (userSubmissions.length / maxLimit) * 100))}%`,
              }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-2">
            {userSubmissions.length >= maxLimit
              ? `You have utilized all ${maxLimit} authorized intake submission slots. Contact administrator if an extension or quota reset is required.`
              : `You have ${maxLimit - userSubmissions.length} authorized submission slot(s) remaining.`}
          </p>
        </div>
      </div>

      {/* 2. INTERCONNECTED QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateToTab('home')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-sm text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <Home className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-900">Home Portal</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Return to central overview and services.</p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Open Home</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab('form')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-sm text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <FileCheck2 className="w-5 h-5 text-indigo-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-900">Form Filling</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Submit new project or inquiry details.</p>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Go to Form</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab('status')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-sm text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <ClipboardList className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-900">Submission Status</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Inspect real-time evaluation and review.</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Status</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab('support')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-sm text-left transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <Headphones className="w-5 h-5 text-amber-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-900">Support & CEO</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Executive message, hotlines and help desk.</p>
          </div>
          <span className="text-[11px] font-bold text-amber-600 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Contact Support</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* 3. SECURITY & PASSWORD MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="security-password-section">
        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentUser.authProvider === 'google' && !currentUser.password
                  ? 'Set Direct Password'
                  : 'Change Account Password'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser.authProvider === 'google' && !currentUser.password
                  ? 'Add direct email/password login to your Google profile'
                  : 'Update and refresh your access credentials'}
              </p>
            </div>
          </div>

          {currentUser.authProvider === 'google' && !currentUser.password ? (
            <form onSubmit={handleSetGooglePassword} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900">
                <p className="font-semibold">Optional Direct Sign-In</p>
                <p className="mt-0.5 text-blue-800">
                  You signed in via Google. You can optionally set a password to also log in directly via email.
                </p>
              </div>

              {googlePassError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{googlePassError}</span>
                </div>
              )}

              {googlePassSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{googlePassSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={googlePassNew}
                  onChange={(e) => setGooglePassNew(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={googlePassConfirm}
                  onChange={(e) => setGooglePassConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Set Account Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* Profile & Danger Zone */}
        <div className="space-y-6">
          {/* Account Details Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Authentication & Metadata</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Sign-In Method:</span>
                <span className="font-bold text-slate-800 uppercase tracking-wider">
                  {currentUser.authProvider || 'Email/Password'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Account ID:</span>
                <span className="font-mono text-slate-700 text-[11px] truncate max-w-[180px]">
                  {currentUser.id}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Intake Policy:</span>
                <span className="font-semibold text-slate-800">
                  Strict 1 to 9 Quota Control
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Corporate Portal:</span>
                <span className="font-semibold text-blue-600">
                  {branding.companyName || 'Anthony India'}
                </span>
              </div>
            </div>
          </div>

          {/* Permanent Delete Account */}
          <div className="bg-rose-50/70 rounded-3xl border border-rose-200 p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950">Delete Submitter Account</h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Permanently erase your account, login credentials, and all recorded form history from this portal.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Initiate Account Deletion
                  </button>
                ) : (
                  <form onSubmit={handleDeleteAccount} className="mt-4 space-y-3">
                    {deleteError && (
                      <div className="p-2.5 bg-white border border-rose-300 rounded-lg text-xs text-rose-700">
                        {deleteError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-rose-900 mb-1">
                        Type <span className="font-mono text-rose-700 font-black">DELETE</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteInputText}
                        onChange={(e) => setDeleteInputText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-rose-300 text-xs font-mono uppercase focus:ring-2 focus:ring-rose-600 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteInputText('');
                          setDeleteError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
