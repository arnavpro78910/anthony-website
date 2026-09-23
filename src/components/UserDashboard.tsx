import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileCheck2,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileCheck,
  Users,
  Headphones,
  Building,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ClipboardList,
  ChevronDown,
  Key,
  Trash2,
  X,
  Info,
  Menu,
  Home,
  ArrowRight,
  Crown,
  Bot
} from 'lucide-react';
import { FormCategory, FormSubmission, CompanyBranding, UserAccount, FormTemplate } from '../types';
import { AppLayout } from './layout/AppLayout';
import { FormSelector } from './FormSelector';
import { ActiveForm } from './ActiveForm';
import { SubmissionSuccess } from './SubmissionSuccess';
import { AccountStatusDashboard } from './AccountStatusDashboard';
import { AboutCompanyView } from './AboutCompanyView';
import { UserHomeView } from './UserHomeView';
import { UserAccountView } from './UserAccountView';
import { SupportView } from './SupportView';
import { ActivityHistoryView } from './ActivityHistoryView';
import { CompanyInfoView } from './CompanyInfoView';
import { ChatbotAssistant } from './ChatbotAssistant';
import { updateUserPassword, deleteUserAccount, isUserVip, toggleUserVipStatus, getUserSubmissions } from '../utils/storage';
import { getThemeClasses } from '../utils/theme';

export type UserTab = 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant' | 'company' | 'activity';

interface UserDashboardProps {
  currentUser: UserAccount;
  branding: CompanyBranding;
  templates: FormTemplate[];
  userSubmission: FormSubmission | null;
  onFormSubmitted: (submission: FormSubmission) => void;
  onLogout: () => void;
  refreshAllData: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  branding,
  templates,
  userSubmission,
  onFormSubmitted,
  onLogout,
  refreshAllData,
}) => {
  const theme = getThemeClasses(branding.themePreset);
  // Default to Home page view as requested
  const [activeTab, setActiveTab] = useState<UserTab>('home');
  const [selectedTemplateId, setSelectedTemplateId] = useState<FormCategory>('client-inquiry');
  const [isFillingActive, setIsFillingActive] = useState<boolean>(false);
  const [lastSubmission, setLastSubmission] = useState<FormSubmission | null>(null);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [navigationPayload, setNavigationPayload] = useState<string | undefined>(undefined);

  // Navigation drawer (3 lines menu) state
  const [showNavDrawer, setShowNavDrawer] = useState(false);

  // User menu and account action modal states
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Google Set Password States
  const [showSetPasswordPrompt, setShowSetPasswordPrompt] = useState(false);
  const [setPassNew, setSetPassNew] = useState('');
  const [setPassConfirm, setSetPassConfirm] = useState('');
  const [setPassError, setSetPassError] = useState<string | null>(null);
  const [setPassSuccess, setSetPassSuccess] = useState<string | null>(null);
  const [setPassLoading, setSetPassLoading] = useState(false);

  // Navigation definitions in exact requested order:
  // 1. Home Page -> 2. Form Filling -> 3. Status -> 4. Account -> 5. Support
  const navItems = [
    {
      id: 'home' as const,
      num: '1',
      label: 'Home',
      fullName: 'Home Page',
      icon: Home,
      color: 'text-blue-600',
      desc: 'Central overview, quick start & portal hub',
    },
    {
      id: 'form' as const,
      num: '2',
      label: 'Form Filling',
      fullName: 'Form Filling',
      icon: FileCheck2,
      color: 'text-indigo-600',
      desc: 'Official category forms & instant submission',
    },
    {
      id: 'status' as const,
      num: '3',
      label: 'Status',
      fullName: 'Submission Status',
      icon: ClipboardList,
      color: 'text-emerald-600',
      desc: 'Live tracking, SLA & reviewer audit notes',
    },
    {
      id: 'account' as const,
      num: '4',
      label: 'Account',
      fullName: 'Account Management',
      icon: User,
      color: 'text-purple-600',
      desc: 'Profile settings, quota allowance & security',
    },
    {
      id: 'support' as const,
      num: '5',
      label: 'Support',
      fullName: 'Support & Company',
      icon: Headphones,
      color: 'text-amber-600',
      desc: 'About company, CEO message & help desk',
    },
    {
      id: 'assistant' as const,
      num: 'AI',
      label: 'AI Assistant',
      fullName: 'AI Support Assistant',
      icon: Bot,
      color: 'text-blue-500',
      desc: '24/7 intelligent portal assistant',
    },
  ];

  const handleNavigateToTab = (
    tab: UserTab,
    targetSectionId?: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
    }
    
    // Set payload for tabs that might need it (e.g., Company, Account)
    setNavigationPayload(targetSectionId);

    // Automatically select the exact status showcase card if navigating to status and user has submissions
    const effectiveTargetId = 
      targetSectionId || 
      (tab === 'status' && (userSubmissions.length > 0 || userSubmission) ? 'live-status-showcase-card' : undefined);

    // Simultaneously update active tab state and trigger exact instant scroll positioning
    setActiveTab(tab);
    setShowNavDrawer(false);
    setShowUserMenu(false);

    if (effectiveTargetId) {
      // Use double RAF or short timeout to guarantee DOM is rendered in new tab view
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(effectiveTargetId);
          if (el) {
            const headerOffset = 90; // account for sticky header height
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'instant' as ScrollBehavior
            });
          }
        }, 50);
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'instant' as ScrollBehavior
      });
    }
  };

  // Trigger optional Set Password modal on load for Google users without a password set
  // This shows exactly once per session to avoid popping up on minimize/re-open
  useEffect(() => {
    if (currentUser.authProvider === 'google' && !currentUser.password) {
      const sessionShownKey = `password_prompt_shown_${currentUser.id}`;
      const alreadyShownInSession = sessionStorage.getItem(sessionShownKey);
      
      if (!alreadyShownInSession) {
        setShowSetPasswordPrompt(true);
        sessionStorage.setItem(sessionShownKey, 'true');
      }
    }
  }, [currentUser]);

  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSubmissionComplete = (submission: FormSubmission) => {
    setLastSubmission(submission);
    onFormSubmitted(submission);
    refreshAllData();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!oldPassword) {
      setPasswordError('Old password is required.');
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
    const res = updateUserPassword(currentUser.id, newPassword, oldPassword);
    if (res.success) {
      setPasswordSuccess('Password successfully updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess(null);
      }, 1500);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSetPassError(null);
    setSetPassSuccess(null);
    if (!setPassNew || setPassNew.length < 6) {
      setSetPassError('Password must be at least 6 characters.');
      return;
    }
    if (setPassNew !== setPassConfirm) {
      setSetPassError('Passwords do not match.');
      return;
    }
    setSetPassLoading(true);
    const res = updateUserPassword(currentUser.id, setPassNew);
    setSetPassLoading(false);
    if (res.success) {
      setSetPassSuccess('Password successfully set!');
      setSetPassNew('');
      setSetPassConfirm('');
      setTimeout(() => {
        setShowSetPasswordPrompt(false);
        setSetPassSuccess(null);
        refreshAllData();
      }, 1500);
    } else {
      setSetPassError(res.error || 'Failed to set password.');
    }
  };

  const handleSkipSetPassword = () => {
    setShowSetPasswordPrompt(false);
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }
    deleteUserAccount(currentUser.id, true);
    onLogout();
  };

  const userSubmissions = getUserSubmissions(currentUser.id, currentUser.email);
  const maxLimit = Math.min(9, Math.max(1, currentUser?.submissionLimit || 1));
  const isLimitReached = userSubmissions.length >= maxLimit;

  const currentTabLabel = navItems.find(n => n.id === activeTab)?.label || 'Dashboard';

  if (activeTab === 'assistant') {
    return (
      <ChatbotAssistant
        branding={branding}
        currentUser={currentUser}
        userSubmission={userSubmission}
        onExit={() => handleNavigateToTab('support')}
        onNavigateToTab={handleNavigateToTab}
      />
    );
  }

  return (
    <AppLayout
      branding={branding}
      currentUser={currentUser}
      onLogout={onLogout}
      activeTabTitle={`${branding.companyName || 'Anthony India'} • ${currentTabLabel}`}
      navItems={navItems.map(item => ({
        label: item.label,
        icon: <item.icon className="w-4 h-4" />,
        active: activeTab === item.id,
        onClick: () => handleNavigateToTab(item.id)
      }))}
    >
      <div className="animate-fade-in">
        {activeTab === 'home' ? (
          <UserHomeView
            currentUser={currentUser}
            branding={branding}
            templates={templates}
            userSubmission={userSubmission}
            onNavigateToTab={handleNavigateToTab}
            onSelectCategoryAndNavigate={(categoryId) => {
              setSelectedTemplateId(categoryId as FormCategory);
              setIsFillingActive(true);
              handleNavigateToTab('form');
            }}
          />
        ) : activeTab === 'form' ? (
          /* 2. FORM FILLING VIEW */
          <div>
            {lastSubmission ? (
              <SubmissionSuccess
                submission={lastSubmission}
                branding={branding}
                currentUser={currentUser}
                onViewAccountDashboard={() => {
                  setLastSubmission(null);
                  setIsFillingActive(false);
                  handleNavigateToTab('home');
                }}
                onViewAllSubmissions={() => {
                  setLastSubmission(null);
                  setIsFillingActive(false);
                  handleNavigateToTab('status');
                }}
              />
            ) : isFillingActive && !isLimitReached ? (
              /* ACTIVE FORM FILLING WIZARD */
              <ActiveForm
                key={`${currentTemplate.id}_${currentUser.id}`}
                template={currentTemplate}
                branding={branding}
                currentUser={currentUser}
                existingSubmission={userSubmission}
                onOpenAuthModal={() => {}}
                onViewSubmission={() => handleNavigateToTab('status')}
                onSubmitSuccess={(sub) => {
                  handleSubmissionComplete(sub);
                  setIsFillingActive(false);
                }}
                onDraftStatusChange={setDraftStatus}
                onCloseWizard={() => setIsFillingActive(false)}
              />
            ) : (
              /* FORM TYPE CATALOGUE CARDS */
              <>
                {/* Dynamic Brand Customizable Welcome Hero Card */}
                <div className={`p-6 rounded-2xl border ${theme.primaryBorder} ${theme.pillBg} text-slate-800 mb-6 relative overflow-hidden shadow-xs`}>
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-48 h-48" />
                  </div>
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-lg sm:text-xl font-black ${theme.primaryText} tracking-tight`}>
                        {branding.primaryWelcomeMessage || 'Welcome to the Corporate Intake & Filing Portal'}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-4xl">
                        {branding.instructionsText || 'Please select a service category below to expand details and click "Start Filling" to begin your step-by-step application.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Selector (Choose department template) */}
                <FormSelector
                  templates={templates}
                  selectedId={selectedTemplateId}
                  isLimitReached={isLimitReached}
                  userSubmissionsCount={userSubmissions.length}
                  maxLimit={maxLimit}
                  onViewStatus={() => handleNavigateToTab('status')}
                  onSelect={(id) => {
                    setSelectedTemplateId(id);
                    setDraftStatus('idle');
                  }}
                  onStartFilling={(tpl) => {
                    if (isLimitReached) {
                      handleNavigateToTab('status');
                      return;
                    }
                    setSelectedTemplateId(tpl.id as FormCategory);
                    setIsFillingActive(true);
                  }}
                />
              </>
            )}
          </div>
        ) : activeTab === 'status' ? (
          /* 3. STATUS TRACKING VIEW */
          <AccountStatusDashboard
            user={currentUser}
            submission={userSubmission}
            branding={branding}
            onOpenForm={() => {
              setLastSubmission(null);
              handleNavigateToTab('form');
            }}
            onLogout={onLogout}
            onNavigateToTab={handleNavigateToTab}
          />
        ) : activeTab === 'account' ? (
          /* 4. ACCOUNT MANAGEMENT VIEW */
          <UserAccountView
            currentUser={currentUser}
            branding={branding}
            userSubmission={userSubmission}
            onNavigateToTab={handleNavigateToTab}
            onLogout={onLogout}
            refreshAllData={refreshAllData}
          />
        ) : activeTab === 'support' ? (
          /* 5. SUPPORT & CONTACT DESK VIEW */
          <SupportView
            branding={branding}
            currentUser={currentUser}
            onNavigateToTab={handleNavigateToTab}
          />
        ) : activeTab === 'company' ? (
          /* 6. COMPANY INFORMATION VIEW */
          <CompanyInfoView
            branding={branding}
            onBack={() => handleNavigateToTab('home')}
            onNavigateToTab={handleNavigateToTab}
            initialSection={navigationPayload}
          />
        ) : (
          /* 7. ACTIVITY HISTORY VIEW */
          <ActivityHistoryView
            currentUser={currentUser}
            userSubmissions={userSubmissions}
            onBack={() => handleNavigateToTab('home')}
            onNavigateToTab={handleNavigateToTab}
          />
        )}
      </div>

      {/* USER FOOTER (Strictly no admin controls or links) */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100 text-xs text-slate-500">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Encrypted Intake Protocol</h4>
                <p className="mt-0.5 text-slate-500">Submissions are protected with 256-bit encryption and strict audit tracking.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Controlled Submission Quota</h4>
                <p className="mt-0.5 text-slate-500">Each account is allocated an administrator-controlled intake limit (up to 9).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Direct Department Queue</h4>
                <p className="mt-0.5 text-slate-500">Automatically routed to authorized staff reviewers upon receipt.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Headphones className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-800">Support Desk & FAQ</h4>
                <p className="mt-0.5 text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleNavigateToTab('support')}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    View Help Desk & Contact Channels
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <Building className="w-4 h-4 text-slate-400" />
              <span>© {new Date().getFullYear()} {branding.companyName}. All rights reserved.</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleNavigateToTab('company')}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                About Company & CEO
              </button>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{branding.officeLocation}</span>
            </div>
            <div className="text-slate-400 text-xs">
              Logged in as <span className="font-semibold text-slate-600">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">Update your account login password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Account</h3>
                  <p className="text-xs text-rose-600">This action is permanent and irreversible</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Warning: Account Deletion
                </p>
                <p className="leading-relaxed text-rose-700">
                  Deleting your account will permanently remove your user profile, authentication credentials, and all submitted intake forms from this portal.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent uppercase"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Permanently Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Password Prompt Modal (For Google users with no password set) */}
      {showSetPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Set Account Password</h3>
                  <p className="text-xs text-slate-500">Secure your Google-linked account with a direct password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSkipSetPassword}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Skip this step"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSetPassword} className="mt-5 space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Optional: Quick Direct Login
                </p>
                <p className="leading-relaxed text-blue-800">
                  Setting a password is completely optional. It allows you to sign in directly with your email as well as "Continue with Google".
                </p>
              </div>

              {setPassError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" />
                  <span>{setPassError}</span>
                </div>
              )}

              {setPassSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{setPassSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={setPassNew}
                  onChange={(e) => setSetPassNew(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                  disabled={setPassLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={setPassConfirm}
                  onChange={(e) => setSetPassConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                  disabled={setPassLoading}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSkipSetPassword}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={setPassLoading}
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  disabled={setPassLoading}
                >
                  {setPassLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Set Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
