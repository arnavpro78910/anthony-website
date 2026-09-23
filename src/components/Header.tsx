import React from 'react';
import {
  Building2,
  FileCheck2,
  History,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
  Lock,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { CompanyBranding, UserAccount } from '../types';
import { CompanyLogo } from './CompanyLogo';

interface HeaderProps {
  branding: CompanyBranding;
  activeTab: 'form' | 'submissions' | 'account' | 'admin';
  setActiveTab: (tab: 'form' | 'submissions' | 'account' | 'admin') => void;
  submissionCount: number;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode?: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
  draftStatus: 'idle' | 'saving' | 'saved';
}

export const Header: React.FC<HeaderProps> = ({
  branding,
  activeTab,
  setActiveTab,
  submissionCount,
  currentUser,
  onOpenAuthModal,
  onLogout,
  draftStatus,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'aasnc';

  return (
    <header id="company-portal-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 gap-3">
          {/* Company Brand & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <CompanyLogo branding={branding} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
                  {branding.companyName || 'Anthony India'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">
                  Intake Portal
                </span>
                {isAdmin && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 whitespace-nowrap shrink-0 shadow-2xs">
                    <KeyRound className="w-2.5 h-2.5" />
                    ADMINISTRATOR
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-md">
                {branding.tagline}
              </p>
            </div>
          </div>

          {/* Center Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {draftStatus === 'saved' && (
              <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Draft saved
              </span>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
              <button
                id="tab-fill-form-btn"
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'form'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Fill Form</span>
                <span className="sm:hidden">Form</span>
                {currentUser?.hasSubmitted && !isAdmin && (
                  <span title="1 Submission Limit Reached">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>

              <button
                id="tab-account-status-btn"
                type="button"
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="hidden md:inline">My Account & Status</span>
                <span className="md:hidden">Status</span>
                {currentUser?.hasSubmitted && !isAdmin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>

              {/* Admin Panel Tab Option */}
              <button
                id="tab-admin-panel-btn"
                type="button"
                onClick={() => {
                  if (isAdmin) {
                    setActiveTab('admin');
                  } else {
                    // Open Auth Modal in dedicated admin mode with prompt
                    onOpenAuthModal('admin');
                  }
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-slate-950 text-amber-400 shadow-xs border border-amber-500/40'
                    : isAdmin
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>

            {/* Auth / Account Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  id="header-user-profile-btn"
                  type="button"
                  onClick={() => setActiveTab(isAdmin ? 'admin' : 'account')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isAdmin
                      ? 'bg-slate-950 text-amber-300 border-amber-500/30'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                  }`}>
                    {isAdmin ? 'A' : (currentUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {isAdmin ? 'Administrator' : currentUser.name}
                  </span>
                </button>
                <button
                  id="header-logout-btn"
                  type="button"
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Standard Sign in button */}
                <button
                  id="header-login-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In / Register</span>
                  <span className="sm:hidden">Sign In</span>
                </button>

                {/* Direct 'Log In as Admin' button in Header login area */}
                <button
                  id="header-admin-login-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('admin')}
                  title="Admin Log In"
                  className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-black text-amber-400 text-xs font-bold shadow-xs transition-colors cursor-pointer border border-amber-500/30"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Log in as admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar with Security Badge & Location */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-3 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700 whitespace-nowrap">Encrypted Intake Protocol</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">1 Submission per Account Rule Enforced</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Corporate Inquiries:</span>
            <a href={`mailto:${branding.supportEmail}`} className="text-blue-600 hover:underline font-medium truncate max-w-[220px]">
              {branding.supportEmail}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
