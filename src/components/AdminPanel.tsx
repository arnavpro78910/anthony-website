import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  Users,
  FileSpreadsheet,
  Trash2,
  Edit3,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  Mail,
  KeyRound,
  Eye,
  Settings,
  PlusCircle,
  Database,
  Hash,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  FormSubmission,
  UserAccount,
  CompanyBranding,
  FormTemplate
} from '../types';
import {
  updateSubmissionStatus,
  deleteSubmission,
  setUserSubmissionLimit,
  resetUserSubmissionQuota,
  deleteUserAccount,
  verifyAdminPassword,
  exportToCSV,
  saveCompanyBranding
} from '../utils/storage';
import {
  getStoredGmailSession,
  requestGmailAccess,
  clearStoredGmailSession,
  GmailSession
} from '../services/gmailService';
import { sendRealVerificationEmail } from '../services/authService';
import { FloatingToast, ToastMessage } from './common/FloatingToast';

interface AdminPanelProps {
  adminUser: UserAccount;
  submissions: FormSubmission[];
  users: UserAccount[];
  templates: FormTemplate[];
  branding: CompanyBranding;
  onRefreshData: () => void;
  onUpdateBranding: (newBranding: CompanyBranding) => void;
  onFillFormAsAdmin: (templateId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  submissions,
  users,
  templates,
  branding,
  onRefreshData,
  onUpdateBranding,
  onFillFormAsAdmin,
}) => {
  // Navigation tabs inside Admin Panel
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'overview' | 'submissions' | 'users' | 'branding' | 'forms'>('overview');

  // Submissions search & filters
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('All');
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState<FormSubmission | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // User search & filters
  const [userSearch, setUserSearch] = useState('');

  // Live branding configuration state (exclusive to Admin Panel)
  const [brandingForm, setBrandingForm] = useState<CompanyBranding>({ ...branding });
  const [brandingSavedNotice, setBrandingSavedNotice] = useState(false);

  // Gmail OAuth integration state
  const [gmailSession, setGmailSession] = useState<GmailSession | null>(() => getStoredGmailSession());
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('arnavpro78910@gmail.com');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setGmailSession(getStoredGmailSession());
  }, []);

  const handleConnectGmail = async () => {
    setGmailLoading(true);
    setGmailError(null);
    try {
      const res = await requestGmailAccess();
      if (res.success && res.session) {
        setGmailSession(res.session);
      } else {
        setGmailError(res.error || 'Failed to authenticate with Gmail OAuth.');
      }
    } catch (err: any) {
      setGmailError(err?.message || 'Failed to authenticate with Gmail OAuth.');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleDisconnectGmail = () => {
    clearStoredGmailSession();
    setGmailSession(null);
  };

  const handleSendTestVerificationEmail = async () => {
    if (!testEmailAddress.trim()) return;
    setTestEmailSending(true);
    setTestEmailResult(null);

    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const res = await sendRealVerificationEmail(
        testEmailAddress,
        testCode,
        'Admin Test Recipient',
        branding.companyName
      );
      if (res.success) {
        setTestEmailResult({
          success: true,
          message: `Verification code successfully dispatched to ${testEmailAddress}! Check your email inbox.`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: res.error || 'Failed to dispatch test verification email.',
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err?.message || 'Error occurred while sending test email.',
      });
    } finally {
      setTestEmailSending(false);
    }
  };

  // Status badge helper
  const getStatusBadge = (status: FormSubmission['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'Under Evaluation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3" />
            Under Evaluation
          </span>
        );
      case 'Acknowledged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            Acknowledged
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3" />
            Action Required
          </span>
        );
      case 'Pending Review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  // Filtered submissions (hides items removed by Admin/CEO or deleted by User)
  const activeSubmissions = submissions.filter((s) => !s.hiddenFromAdminCeo && !s.deletedByAdminOrCeo && !s.deletedByUser);
  const filteredSubmissions = activeSubmissions.filter((s) => {
    const term = submissionSearch.toLowerCase();
    const matchesSearch =
      (s.id || '').toLowerCase().includes(term) ||
      (s.formTitle || '').toLowerCase().includes(term) ||
      (s.userName || '').toLowerCase().includes(term) ||
      (s.userEmail || '').toLowerCase().includes(term) ||
      (s.userId || '').toLowerCase().includes(term) ||
      JSON.stringify(s.data || {}).toLowerCase().includes(term);

    const matchesStatus = submissionFilter === 'All' || s.status === submissionFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      ((u.username || '').toLowerCase().includes(term)) ||
      (u.id || '').toLowerCase().includes(term) ||
      ((u.submittedFormId || '').toLowerCase().includes(term))
    );
  });

  // Admin Actions
  const handleStatusUpdate = (id: string, newStatus: FormSubmission['status']) => {
    updateSubmissionStatus(id, newStatus, adminNoteInput || undefined);
    onRefreshData();
    if (selectedSubmissionModal && selectedSubmissionModal.id === id) {
      setSelectedSubmissionModal({
        ...selectedSubmissionModal,
        status: newStatus,
        statusNotes: adminNoteInput || selectedSubmissionModal.statusNotes,
      });
    }
  };

  const handleDeleteSubmissionAction = (id: string) => {
    if (window.confirm(`Are you sure you want to clear submission ${id} from your desk? It will be cleared from management and locked.`)) {
      deleteSubmission(id, 'Admin', adminUser.name);
      onRefreshData();
      if (selectedSubmissionModal?.id === id) {
        setSelectedSubmissionModal(null);
      }
    }
  };

  const handleResetUserQuota = (user: UserAccount) => {
    const currentLimit = Math.min(9, Math.max(1, user.submissionLimit || 1));
    const promptVal = window.prompt(`Set form submission limit for ${user.name} (1 to 9):`, String(currentLimit));
    if (promptVal !== null) {
      const parsed = parseInt(promptVal.trim(), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 9) {
        setUserSubmissionLimit(user.id, parsed);
        onRefreshData();
      } else {
        alert('Please enter a valid limit between 1 and 9.');
      }
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (user.username === 'aasnc' || user.id === 'usr_admin_master' || user.email === 'admin@company.com') {
      alert('Master admin account cannot be deleted.');
      return;
    }
    const enteredPassword = window.prompt(`Security Verification: Enter administrator password to permanently delete account for ${user.name} (${user.email}):`);
    if (enteredPassword === null) return;
    if (!verifyAdminPassword(enteredPassword)) {
      alert('Action unauthorized: Incorrect administrator password.');
      return;
    }
    deleteUserAccount(user);
    onRefreshData();
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyBranding(brandingForm);
    onUpdateBranding(brandingForm);
    setBrandingSavedNotice(true);
    setTimeout(() => setBrandingSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6" id="master-admin-panel">
      {/* Top Admin Banner */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <KeyRound className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Corporate Admin Control Panel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  ADMIN ACTIVE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Full Authority & Override
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Centralized management hub for all registered accounts, form submission IDs, department templates, and portal configuration controls.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total IDs</span>
              <span className="text-xl font-bold text-blue-400 font-mono">{submissions.length}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Accounts</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{users.length}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Forms</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{templates.length}</span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeAdminSubTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Executive Overview
          </button>
          <button
            id="admin-tab-all-submissions"
            type="button"
            onClick={() => setActiveAdminSubTab('submissions')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeAdminSubTab === 'submissions'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>All Submissions & IDs ({submissions.length})</span>
          </button>
          <button
            id="admin-tab-all-users"
            type="button"
            onClick={() => setActiveAdminSubTab('users')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeAdminSubTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Registered Accounts ({users.length})</span>
          </button>
          <button
            id="admin-tab-all-forms"
            type="button"
            onClick={() => setActiveAdminSubTab('forms')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeAdminSubTab === 'forms'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Active Form Blueprints ({templates.length})</span>
          </button>
          <button
            id="admin-tab-branding-change"
            type="button"
            onClick={() => setActiveAdminSubTab('branding')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeAdminSubTab === 'branding'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dashboard & Branding Change</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeAdminSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Intake Activity
                </span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Hash className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-3xl font-bold text-slate-900 font-mono">
                {submissions.length}
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                Total processed form tracking IDs in the system ledger.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-amber-600 font-medium">
                  {submissions.filter((s) => s.status === 'Pending Review').length} Pending Review
                </span>
                <span className="text-emerald-600 font-medium">
                  {submissions.filter((s) => s.status === 'Approved').length} Approved
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  User Accounts & Quotas
                </span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-3xl font-bold text-slate-900 font-mono">
                {users.length}
              </h4>
              <p className="text-xs text-slate-500 mt-2">
                Total user accounts created across clients and employees.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {users.filter((u) => u.hasSubmitted).length} Submissions Made
                </span>
                <span className="text-emerald-600 font-medium">
                  {users.filter((u) => !u.hasSubmitted).length} Available Quotas
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Portal Identity
                </span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 truncate">
                {branding.companyName}
              </h4>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {branding.tagline}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Exclusive Control:</span>
                <button
                  type="button"
                  onClick={() => setActiveAdminSubTab('branding')}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Edit Branding →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Submissions Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Recent Inbound Submissions
                </h3>
                <p className="text-xs text-slate-500">Real-time submissions created by users</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminSubTab('submissions')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Full Submissions Grid ({submissions.length}) →
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {submissions.slice(0, 5).map((item, idx) => (
                <div key={item.id ? `${item.id}-${idx}` : `sub-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-blue-600">{item.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-800">{item.formTitle}</span>
                    </div>
                    <p className="text-slate-500">
                      By <strong>{item.userName}</strong> ({item.userEmail}) • {new Date(item.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubmissionModal(item);
                        setAdminNoteInput(item.statusNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL SUBMISSIONS & ALL IDs (FULL CONTROL) */}
      {activeAdminSubTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>All Created Form Submissions & Tracking IDs</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {submissions.length} Total IDs
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Admin has full control to change processing statuses, add official notes, inspect all form answers, or delete records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportToCSV(filteredSubmissions)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                placeholder="Search by Tracking ID, Submitter Name, Email, or Field Value..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Under Evaluation">Under Evaluation</option>
                <option value="Approved">Approved</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Action Required">Action Required</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Tracking ID</th>
                  <th className="px-5 py-3.5">Submitter & Account</th>
                  <th className="px-5 py-3.5">Form Category</th>
                  <th className="px-5 py-3.5">Submitted Timestamp</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No submissions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((item, idx) => (
                    <tr key={item.id ? `${item.id}-${idx}` : `srow-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-blue-600">
                        {item.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{item.userName || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-400">{item.userEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono">User ID: {item.userId}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {item.formTitle}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubmissionModal(item);
                            setAdminNoteInput(item.statusNotes || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Inspect & Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubmissionAction(item.id)}
                          title="Permanently Delete Submission"
                          className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED ACCOUNTS & QUOTA CONTROL */}
      {activeAdminSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Registered Accounts & Identity Directory</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {users.length} Users
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Admin has full control to adjust submission limits, monitor status, and manage account access.
              </p>
            </div>
          </div>

          {/* User Search Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by User ID, Name, Username, or Email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Account ID</th>
                  <th className="px-5 py-3.5">User Name & Login ID</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Submission Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id ? `${u.id}-${idx}` : `urow-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {u.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.username === 'aasnc' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                            MASTER ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Email: {u.email}</div>
                      {u.role !== 'admin' && (
                        <div className="text-[11px] text-slate-500 font-mono">Username: {u.username || u.email.split('@')[0]}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role?.toUpperCase() || 'USER'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.hasSubmitted ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-slate-200 text-slate-800">
                            1/1 Submitted (Locked)
                          </span>
                          {u.submittedFormId && (
                            <span className="block font-mono text-[10px] text-blue-600 font-bold">
                              ID: {u.submittedFormId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800">
                          0/1 (Available to submit)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleResetUserQuota(u)}
                        title={`Set submission limit for ${u.name} (currently ${u.submissionLimit || 1}, max 9)`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Set Limit ({u.submissionLimit || 1})</span>
                      </button>
                      {u.username !== 'aasnc' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          title="Delete User Account"
                          className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE FORM BLUEPRINTS & TESTING */}
      {activeAdminSubTab === 'forms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Corporate Form Blueprint Library
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Active templates deployed in the portal. Admin can test fill any form directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl, idx) => (
              <div key={tpl.id ? `${tpl.id}-${idx}` : `tpl-${idx}`} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                      {tpl.department}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {tpl.title}
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                    {tpl.id}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {tpl.subtitle}
                </p>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {tpl.fields.length} Configured Fields • {tpl.sections.length} Sections
                  </span>
                  <button
                    type="button"
                    onClick={() => onFillFormAsAdmin(tpl.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-2xs cursor-pointer transition-colors"
                  >
                    <span>Launch & Fill Form</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DASHBOARD CHANGE & BRANDING SETTINGS (EXCLUSIVE TO ADMIN) */}
      {activeAdminSubTab === 'branding' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Dashboard Change & Brand Configuration
                </h3>
                <span className="text-xs text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Admin-Only Setting
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              The dashboard change option is exclusively accessible here in the Admin Panel. Changes saved here immediately update the portal title, headers, footers, and official receipts.
            </p>
          </div>

          <form onSubmit={handleSaveBranding} className="p-6 sm:p-8 space-y-6">
            {brandingSavedNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Dashboard configuration updated successfully across the entire portal!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandingForm.companyName}
                  onChange={(e) => setBrandingForm({ ...brandingForm, companyName: e.target.value })}
                  placeholder="e.g. Acme Global Corporation"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Displays on portal header, receipts, and form titles.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Portal Tagline / Subtitle *
                </label>
                <input
                  type="text"
                  required
                  value={brandingForm.tagline}
                  onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                  placeholder="Official Intake & Verification Portal"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Displayed directly beneath company header.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Support & Intake Email *
                </label>
                <input
                  type="email"
                  required
                  value={brandingForm.supportEmail}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportEmail: e.target.value })}
                  placeholder="intake@acme.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Inquiry destination displayed on receipts and status dashboard.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Office Location & Jurisdiction *
                </label>
                <input
                  type="text"
                  required
                  value={brandingForm.officeLocation}
                  onChange={(e) => setBrandingForm({ ...brandingForm, officeLocation: e.target.value })}
                  placeholder="San Francisco, CA • Headquarters"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Official jurisdictional location printed on all confirmations.</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Quick Industry Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBrandingForm({
                    ...brandingForm,
                    companyName: 'Apex Enterprise Solutions',
                    tagline: 'Global Operations & Intake Portal',
                    supportEmail: 'contact@apexsolutions.com',
                  })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Tech Enterprise
                </button>
                <button
                  type="button"
                  onClick={() => setBrandingForm({
                    ...brandingForm,
                    companyName: 'Vanguard Capital Partners',
                    tagline: 'Institutional Advisory & Client Intake',
                    supportEmail: 'inquiries@vanguardcp.com',
                  })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Financial Services
                </button>
                <button
                  type="button"
                  onClick={() => setBrandingForm({
                    ...brandingForm,
                    companyName: 'Starlight Media & Studio Group',
                    tagline: 'Creative Inquiries & Talent Casting Portal',
                    supportEmail: 'submissions@starlightmedia.com',
                  })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Creative & Media
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="admin-save-branding-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-black text-amber-400 font-bold text-xs shadow-md border border-amber-500/30 cursor-pointer transition-colors"
              >
                Save & Apply Dashboard Changes
              </button>
            </div>
          </form>

          {/* DEDICATED GMAIL INTEGRATION SETTINGS */}
          <div className="p-6 sm:p-8 border-t border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Official Gmail API Integration</span>
                  {gmailSession ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      Ready / Standby
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500">
                  Deliver registration verification codes directly from your verified Google account.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Google OAuth Gmail Dispatcher
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-lg leading-relaxed">
                    When active, verification codes for new accounts are sent using the official Gmail API (
                    <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">
                      https://www.googleapis.com/auth/gmail.send
                    </code>
                    ). If unauthorized, requests fall back to the secure SMTP gateway.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {gmailSession ? (
                    <button
                      type="button"
                      onClick={handleDisconnectGmail}
                      className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Disconnect Gmail
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectGmail}
                      disabled={gmailLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {gmailLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      <span>Connect Official Gmail</span>
                    </button>
                  )}
                </div>
              </div>

              {gmailError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{gmailError}</span>
                </div>
              )}

              {/* Test Email Dispatch Tool */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Send Test Verification Email
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Enter email to receive test code"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestVerificationEmail}
                    disabled={testEmailSending || !testEmailAddress.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testEmailSending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Dispatch Test Email</span>
                  </button>
                </div>

                {testEmailResult && (
                  <div
                    className={`mt-2.5 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      testEmailResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {testEmailResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testEmailResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SUBMISSION INSPECT & OVERRIDE MODAL */}
      {selectedSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-6 flex items-center justify-between border-b border-amber-500/30">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40">
                    {selectedSubmissionModal.id}
                  </span>
                  <span className="text-xs text-slate-400">Admin Inspection & Status Override</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedSubmissionModal.formTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmissionModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Submitter Credentials */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Submitter User</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSubmissionModal.userName}</span>
                  <span className="text-slate-500 block">{selectedSubmissionModal.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">User Account ID</span>
                  <span className="font-mono text-slate-700">{selectedSubmissionModal.userId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Filing Timestamp</span>
                  <span className="font-medium text-slate-700">
                    {new Date(selectedSubmissionModal.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Admin Authority: Change Processing Status:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(['Pending Review', 'Under Evaluation', 'Approved', 'Acknowledged', 'Action Required'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusUpdate(selectedSubmissionModal.id, st)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedSubmissionModal.status === st
                          ? 'bg-slate-950 text-amber-400 shadow-xs border border-amber-400'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Official Reviewer Note (Appears on submitter's account dashboard):
                  </label>
                  <textarea
                    rows={2}
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Enter formal update, evaluation notes, or action items..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(selectedSubmissionModal.id, selectedSubmissionModal.status)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs cursor-pointer"
                    >
                      Save Admin Note
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmissionAction(selectedSubmissionModal.id)}
                      className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Record Permanently</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Data Fields */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  All Submitted Answers & Uploads
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                  {Object.entries(selectedSubmissionModal.data).map(([key, val]) => {
                    if (val === null || val === undefined || val === '') return null;

                    let displayVal: React.ReactNode = String(val);
                    if (typeof val === 'boolean') {
                      displayVal = val ? 'Yes' : 'No';
                    } else if (typeof val === 'object' && 'name' in (val as any)) {
                      displayVal = `Attached Document: ${(val as any).name}`;
                    }

                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());

                    return (
                      <div key={key} className="grid grid-cols-3 p-3 text-xs">
                        <span className="font-semibold text-slate-500">{formattedKey}</span>
                        <span className="col-span-2 text-slate-900 font-medium break-words">
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmissionModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
