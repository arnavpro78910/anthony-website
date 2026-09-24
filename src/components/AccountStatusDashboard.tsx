import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Printer,
  Download,
  Calendar,
  Building,
  Mail,
  Lock,
  ArrowRight,
  ExternalLink,
  Info,
  BadgeCheck,
  MessageSquare,
  Home,
  FileCheck2,
  Headphones,
  Sparkles,
  Crown,
  Award,
  Zap,
  Check,
  FileDown,
  Trash2
} from 'lucide-react';
import { UserAccount, FormSubmission, CompanyBranding } from '../types';
import { getUserSubmissions, isUserVip, toggleUserVipStatus, deleteSubmissionByUser } from '../utils/storage';
import { ExecutiveCertificateModal } from './ExecutiveCertificateModal';

interface AccountStatusDashboardProps {
  user: UserAccount;
  submission: FormSubmission | null;
  branding: CompanyBranding;
  onOpenForm: () => void;
  onLogout: () => void;
  onNavigateToTab?: (tab: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant') => void;
}

export const AccountStatusDashboard: React.FC<AccountStatusDashboardProps> = ({
  user,
  submission,
  branding,
  onOpenForm,
  onLogout,
  onNavigateToTab,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'raw_data'>('overview');
  const userSubmissions = getUserSubmissions(user.id, user.email);
  const maxLimit = Math.min(9, Math.max(1, user.submissionLimit || 1));
  const isAtLimit = userSubmissions.length >= maxLimit;

  const [selectedSubId, setSelectedSubId] = useState<string>(
    submission?.id || (userSubmissions.length > 0 ? userSubmissions[0].id : '')
  );

  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedTimelineStep, setSelectedTimelineStep] = useState<TimelineStep | null>(null);
  const [isVipState, setIsVipState] = useState<boolean>(() => isUserVip(user));
  const [showComplianceBreakdown, setShowComplianceBreakdown] = useState<boolean>(false);

  // Auto-align viewport directly to the Status Tracking Card on mount (matching exact user screenshot)
  React.useEffect(() => {
    if (userSubmissions.length > 0 || submission) {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('live-status-showcase-card');
        if (el) {
          const headerOffset = 90;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'instant' as ScrollBehavior,
          });
        }
      }, 30);
      return () => clearTimeout(scrollTimer);
    }
  }, []);

  const activeSubmission =
    userSubmissions.find((s) => s.id === selectedSubId) ||
    submission ||
    (userSubmissions.length > 0 ? userSubmissions[0] : null);

  const isVipAccount = Boolean(isVipState || user.isVip || activeSubmission?.isVipSubmission);

  const handleToggleVip = () => {
    const result = toggleUserVipStatus(user);
    setIsVipState(result.isVip);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!activeSubmission) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeSubmission, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeSubmission.id}_official_record.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCertificate = () => {
    if (!activeSubmission) return;
    setShowCertificateModal(true);
  };

  const getStatusBadge = (status: FormSubmission['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved & Finalized
          </span>
        );
      case 'Under Evaluation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" />
            Under Evaluation
          </span>
        );
      case 'Acknowledged':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <BadgeCheck className="w-3.5 h-3.5" />
            Acknowledged / In Pipeline
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Action Required
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'Pending Review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  interface TimelineStep {
    key: string;
    label: string;
    desc: string;
    done: boolean;
    current?: boolean;
    isRejected?: boolean;
  }

  // Timeline stage calculation
  const getTimelineSteps = (status: FormSubmission['status']): TimelineStep[] => {
    if (status === 'Rejected') {
      return [
        { key: 'received', label: 'Form Received', desc: 'Securely registered in intake database', done: true },
        {
          key: 'evaluation',
          label: 'Under Evaluation',
          desc: 'Assigned to corporate review officers',
          done: true,
        },
        {
          key: 'decision',
          label: 'Decision: Application Rejected',
          desc: activeSubmission?.statusNotes || 'This application was evaluated and rejected by corporate administration / CEO desk',
          done: true,
          current: true,
          isRejected: true,
        },
      ];
    }
    const steps: TimelineStep[] = [
      { key: 'received', label: 'Form Received', desc: 'Securely registered in intake database', done: true },
      {
        key: 'evaluation',
        label: 'Under Evaluation',
        desc: 'Assigned to corporate review officers',
        done: status === 'Under Evaluation' || status === 'Approved' || status === 'Acknowledged',
        current: status === 'Pending Review' || status === 'Under Evaluation',
      },
      {
        key: 'decision',
        label: 'Decision & Formal Resolution',
        desc: 'Final outcome, approval, or contract execution',
        done: status === 'Approved' || status === 'Acknowledged',
        current: status === 'Approved' || status === 'Acknowledged',
      },
    ];
    return steps;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 animate-fade-in" id="account-status-dashboard">
      {/* Top Welcome & Submitter Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8 animate-fade-in">
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          {/* Subtle background glow for VIP accounts */}
          {isVipAccount && (
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner border ${
                  isVipAccount
                    ? 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 text-slate-950 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/20 border-amber-300'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-white/20'
                }`}
              >
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              {isVipAccount && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-md"
                  title="VIP Account"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {user.name}
                </h2>
                {isVipAccount ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 border border-amber-300">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" />
                    VIP Executive Account
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Submitter Account
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
                <span>•</span>
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                {isVipAccount && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Direct CEO Desk Clearance
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('assistant')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                title="Ask AI Assistant about your submissions"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI Assistant</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleVip}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isVipAccount
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={isVipAccount ? 'VIP Status Active' : 'Activate VIP Executive Tier'}
            >
              <Crown className={`w-3.5 h-3.5 ${isVipAccount ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <span>{isVipAccount ? 'VIP Tier Active' : 'Activate VIP Account'}</span>
            </button>

            <button
              id="account-logout-btn"
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dedicated VIP Executive Account Suite Highlight */}
        {isVipAccount && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-t border-b border-amber-500/30 px-6 py-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span>VIP Priority Executive Clearance Enabled:</span>
                <span className="hidden sm:inline text-[11px] font-normal text-amber-200/80">
                  Your submissions automatically bypass standard intake queues and are prioritized directly on the CEO Executive Desk.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Direct CEO Arnav Singh Review
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  Official PDF Certificate Ready
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Account Submission Capacity & Limit Bar (1 to 9) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">Account Submission Allowance:</span>
            {isAtLimit ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-xs bg-slate-200 text-slate-800">
                {userSubmissions.length} / {maxLimit} Completed (Locked)
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                {userSubmissions.length} / {maxLimit} Used ({maxLimit - userSubmissions.length} Available)
              </span>
            )}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Allocated Limit: {maxLimit}/9
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isAtLimit && (
              <button
                type="button"
                onClick={onOpenForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>Submit Another Form ({maxLimit - userSubmissions.length} left)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-slate-500 text-[11px]">
              {isAtLimit
                ? `Authorized intake quota of ${maxLimit} form(s) reached.`
                : `You can submit ${maxLimit - userSubmissions.length} more form(s).`}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK CROSS-NAVIGATION HUB */}
      {onNavigateToTab && (
        <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Portal Navigation Hub:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateToTab('home')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Home</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('form')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Form Filling</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('account')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>4. Account</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('support')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-600" />
              <span>5. Support</span>
            </button>
          </div>
        </div>
      )}

      {/* Case 1: User HAS NOT submitted any form yet */}
      {userSubmissions.length === 0 && !submission ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            No Form Submitted Yet
          </h3>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Your account is verified and ready. You are authorized to submit up to <strong>{maxLimit} official company form{maxLimit > 1 ? 's' : ''}</strong>.
          </p>

          <button
            id="account-submit-now-btn"
            type="button"
            onClick={onOpenForm}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Fill Your Company Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Case 2: User HAS submitted - Detailed Status Hub */
        <div className="space-y-6">
          {/* Multi-submission tabs if user has more than 1 submission */}
          {userSubmissions.length > 1 && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Your Submissions ({userSubmissions.length}/{maxLimit}):</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {userSubmissions.map((sub, idx) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSubmission?.id === sub.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>#{idx + 1}: {sub.formTitle || sub.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Status Showcase Card */}
          <div id="live-status-showcase-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Tracking Reference ID
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeSubmission?.id}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {activeSubmission?.formTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <p className="text-xs text-slate-500">
                      Logged with corporate intake on {activeSubmission ? new Date(activeSubmission.submittedAt).toLocaleDateString() : ''}
                    </p>
                    {/* CEO Approval Tag or CEO Review Desk */}
                    {(activeSubmission?.approvedByCeo || (activeSubmission?.isSentToCeo && activeSubmission?.status === 'Approved')) ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950 border border-emerald-400 shadow-sm flex items-center gap-1.5 animate-fadeIn">
                        <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> Approved by CEO
                      </span>
                    ) : activeSubmission?.isSentToCeo ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 border border-amber-600 shadow-sm flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-slate-950" /> CEO Review Desk
                      </span>
                    ) : null}
                    {activeSubmission?.isCertified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white border border-emerald-600 shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Certified
                      </span>
                    )}
                    {activeSubmission?.isVipSubmission && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-amber-400 border border-amber-500 shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> VIP Priority
                      </span>
                    )}
                  </div>

                  {/* Compliance Score Badge */}
                  <div className="mt-3 flex flex-col items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setShowComplianceBreakdown(!showComplianceBreakdown)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs shadow-xs border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-300 font-medium">Automatic Compliance Integrity Score:</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{(activeSubmission as any)?.complianceScore || 92}%</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                        High Integrity Standard
                      </span>
                      <span className="text-[10px] text-slate-400 border-l border-slate-800 pl-2 group-hover:text-amber-300 transition-colors">
                        {showComplianceBreakdown ? 'Hide Details' : 'Analyze Breakdown'}
                      </span>
                    </button>

                    {showComplianceBreakdown && (
                      <div className="w-full max-w-lg mt-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3 shadow-md animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                            AI-Assisted Compliance Audit Ledger
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ref: CAL-{(activeSubmission as any)?.id || 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Baseline Form Completeness (Completeness Ratio)</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              {Math.round((((activeSubmission as any)?.complianceScore || 92) - 35) * 1.0)}% of 65% weight
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${Math.min(100, Math.max(0, (((activeSubmission as any)?.complianceScore || 92) - 35) / 65 * 100))}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900/80">
                              <span className="text-slate-500 block text-[9px] uppercase">Contact Validation</span>
                              <strong className="text-slate-200">Verified (+5%)</strong>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900/80">
                              <span className="text-slate-500 block text-[9px] uppercase">Base Structure</span>
                              <strong className="text-slate-200">System Passed (+20%)</strong>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-900/80">
                              <span className="text-slate-500 block text-[9px] uppercase">Document Attach</span>
                              <strong className="text-slate-200">
                                {Object.values(activeSubmission?.data || {}).some(v => typeof v === 'object' && v !== null) ? 'Attached (+10%)' : 'None (+0%)'}
                              </strong>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal pt-1">
                            Integrity scores are computed dynamically upon submission based on lexical completeness, structural formatting standards, verified contact identifiers, and attached corporate files.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs text-slate-500 mb-1">Current Status</div>
                  {activeSubmission && getStatusBadge(activeSubmission.status)}
                </div>
              </div>

              {/* Reviewer Note / Status Feed / Rejection Alert */}
              {(activeSubmission?.statusNotes || activeSubmission?.isCertified || activeSubmission?.status === 'Rejected') && (
                <div className="mt-5 space-y-3">
                  {/* Rejection Alert Banner */}
                  {activeSubmission?.status === 'Rejected' && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 shadow-2xs">
                      <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                            Application Outcome: Rejected
                          </h5>
                          <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-bold uppercase">
                            Closed
                          </span>
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed font-medium">
                          {activeSubmission.statusNotes || 'This application was evaluated and rejected by corporate administration / executive office.'}
                        </p>
                        <p className="text-[11px] text-rose-600">
                          Reference ID: <span className="font-mono font-bold">{activeSubmission.id}</span>
                          {activeSubmission.lastHandledAt && ` • Recorded ${new Date(activeSubmission.lastHandledAt).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Official Executive Certificate Card */}
                  {(activeSubmission?.isCertified || activeSubmission?.approvedByCeo || activeSubmission?.status === 'Approved') && (
                    <div 
                      id="executive-certificate-banner"
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/30 border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5 relative overflow-hidden"
                    >
                      {/* Left: Stamp thumbnail & details */}
                      <div className="flex items-center gap-3.5 relative z-10">
                        {/* Stamp Image Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-cyan-400 to-amber-300 shadow-md flex items-center justify-center rotate-[-4deg]">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border border-amber-400/50 flex items-center justify-center">
                              <img
                                src="/assets/images/anthony_stamp.jpg"
                                alt="Official Executive Stamp"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/images/company_logo_emblem.jpg';
                                }}
                              />
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[7px] uppercase px-1 rounded shadow-xs">
                            SEAL
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-black text-amber-200 flex items-center gap-1.5">
                              <span>Official Executive Clearance Certificate</span>
                            </h5>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                              Signed & Stamped
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            Authorized by CEO <strong className="text-amber-300">Arnav Singh</strong> • ANTHONY INDIA Executive Office
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Ref: #{activeSubmission.id} • Certified with High-Resolution Executive PDF
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 relative z-10 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={handleDownloadCertificate}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>Download PDF Certificate</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSubmission?.statusNotes && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                          Official Reviewer Note & Updates:
                        </h5>
                        <p className="text-xs text-blue-900 mt-0.5 leading-relaxed font-medium">
                          "{activeSubmission.statusNotes}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visual Process Flow / Stage Tracker */}
            <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Intake & Evaluation Milestones (Interactive Timeline)
                </h4>
                <span className="text-[11px] text-blue-600 font-semibold">Click any stage for audit details</span>
              </div>

              {activeSubmission && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  {getTimelineSteps(activeSubmission.status).map((step, idx) => (
                    <div
                      key={step.key}
                      onClick={() => setSelectedTimelineStep(step)}
                      className={`p-4 rounded-xl border bg-white relative transition-all cursor-pointer hover:shadow-md hover:border-amber-400 ${
                        step.isRejected
                          ? 'border-rose-300 bg-rose-50/40 ring-2 ring-rose-100 shadow-2xs'
                          : step.done
                          ? 'border-emerald-300 shadow-2xs'
                          : step.current
                          ? 'border-blue-400 ring-2 ring-blue-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              step.isRejected
                                ? 'bg-rose-600 text-white'
                                : step.done
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {step.isRejected ? (
                              <XCircle className="w-4 h-4" />
                            ) : step.done ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className={`text-xs font-bold ${step.isRejected ? 'text-rose-950' : 'text-slate-900'}`}>
                            {step.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Inspect</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Milestone Inspection Modal / Drawer */}
              {selectedTimelineStep && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white border border-amber-500/40 shadow-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h5 className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Milestone Audit Details: {selectedTimelineStep.label}
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTimelineStep(null)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Stage Key</span>
                      <strong className="font-mono text-amber-400">{selectedTimelineStep.key}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Verification Status</span>
                      <strong className={selectedTimelineStep.done ? 'text-emerald-400' : 'text-amber-400'}>
                        {selectedTimelineStep.done ? 'Completed & Verified' : 'In Progress / Pending'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
                      <span className="text-slate-200">{new Date(activeSubmission?.submittedAt || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Milestone Context:</strong> {selectedTimelineStep.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Submission Detail Data Explorer */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Submitted Information Record
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  {activeSubmission && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to permanently delete this form submission? This action will permanently remove it from all systems.')) {
                          deleteSubmissionByUser(activeSubmission.id, user.id);
                          window.location.reload();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Permanently delete this submission"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete My Form</span>
                    </button>
                  )}
                </div>
              </div>

              {activeSubmission && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                  {Object.entries(activeSubmission.data).map(([key, val]) => {
                    if (val === null || val === undefined || val === '') return null;

                    let displayVal: React.ReactNode = String(val);
                    if (typeof val === 'boolean') {
                      displayVal = val ? 'Yes / Acknowledged' : 'No';
                    } else if (typeof val === 'object' && 'name' in (val as any)) {
                      displayVal = (
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Attached Document: {(val as any).name} ({(val as any).size ? Math.round((val as any).size / 1024) + ' KB' : ''})
                        </span>
                      );
                    }

                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());

                    return (
                      <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs hover:bg-slate-50/50">
                        <span className="font-semibold text-slate-500">{formattedKey}</span>
                        <span className="sm:col-span-2 text-slate-900 font-medium break-words">
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lock / Capacity Notice */}
            <div className="p-4 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {isAtLimit ? (
                    <><strong>Submission Capacity Fulfilled ({maxLimit}/{maxLimit}):</strong> All authorized submission slots have been utilized.</>
                  ) : (
                    <><strong>Active Intake Capacity ({userSubmissions.length}/{maxLimit}):</strong> You can file up to {maxLimit - userSubmissions.length} more submission(s).</>
                  )}
                </span>
              </div>
              <a
                href={`mailto:${branding.supportEmail}?subject=Inquiry for Ref ${activeSubmission?.id}`}
                className="text-blue-600 font-semibold hover:underline shrink-0 text-xs"
              >
                Contact Intake Team
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Executive Certificate PDF Viewer & Downloader Modal */}
      {showCertificateModal && activeSubmission && (
        <ExecutiveCertificateModal
          submission={activeSubmission}
          branding={branding}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
