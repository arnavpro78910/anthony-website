import React from 'react';
import {
  Crown,
  Inbox,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileDown,
  Megaphone,
  Lock,
  Zap,
  Check
} from 'lucide-react';
import { FormSubmission, UserAccount, ActivityLog } from '../../types';
import { CEOTabId } from './types';

interface CEOOverviewTabProps {
  ceoUser: UserAccount;
  submissions: FormSubmission[];
  users: UserAccount[];
  activityLogs: ActivityLog[];
  vipUserIds: string[];
  isEmergencyFreeze: boolean;
  onNavigateTab: (tab: CEOTabId) => void;
  onSelectSubmission: (sub: FormSubmission) => void;
  onQuickApprove: (id: string) => void;
  onOpenRejectModal: (sub: FormSubmission) => void;
  onToggleFreeze: () => void;
  onExportReport: () => void;
}

export const CEOOverviewTab: React.FC<CEOOverviewTabProps> = ({
  ceoUser,
  submissions,
  users,
  activityLogs,
  vipUserIds,
  isEmergencyFreeze,
  onNavigateTab,
  onSelectSubmission,
  onQuickApprove,
  onOpenRejectModal,
  onToggleFreeze,
  onExportReport,
}) => {
  const pendingCeoSubmissions = submissions.filter(
    (s) =>
      s.status !== 'Approved' &&
      s.status !== 'Rejected' &&
      (s.isSentToCeo || s.isVipSubmission || s.requestCeoReview || vipUserIds.includes(s.userId || ''))
  );

  const vipSubmissions = submissions.filter(
    (s) => s.isVipSubmission || vipUserIds.includes(s.userId || '')
  );

  const approvedByCeoCount = submissions.filter(
    (s) => s.status === 'Approved' && (s.approvedByCeo || s.isCertified)
  ).length;

  const totalApproved = submissions.filter((s) => s.status === 'Approved').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Executive Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md flex items-center justify-center text-slate-950">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Chief Executive Briefing
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Welcome back, {ceoUser.name || 'Arnav Singh'}
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Executive command center is active with{' '}
              <strong className="text-amber-300 font-bold">{pendingCeoSubmissions.length}</strong> filing(s) awaiting your executive clearance, including{' '}
              <strong className="text-yellow-300 font-bold">{vipSubmissions.filter(s => s.status !== 'Approved' && s.status !== 'Rejected').length}</strong> high-priority VIP submissions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateTab('queue')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
              <span>Open Review Desk ({pendingCeoSubmissions.length})</span>
            </button>

            <button
              type="button"
              onClick={onExportReport}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending CEO Review */}
        <div
          onClick={() => onNavigateTab('queue')}
          className="bg-slate-900 border border-amber-500/30 hover:border-amber-500/70 p-5 rounded-2xl shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              CEO Review Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {pendingCeoSubmissions.length}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Action Required
            </span>
            <span className="text-slate-500 group-hover:text-amber-300 flex items-center gap-0.5">
              Review <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: VIP Strategic Filings */}
        <div
          onClick={() => onNavigateTab('queue')}
          className="bg-slate-900 border border-yellow-500/30 hover:border-yellow-500/70 p-5 rounded-2xl shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              VIP Accounts Active
            </span>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform">
              <Crown className="w-4 h-4 fill-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300 mb-1">
            {vipSubmissions.length}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-400/90 font-medium">
              {vipUserIds.length} VIP Users Monitored
            </span>
            <span className="text-slate-500 group-hover:text-amber-300 flex items-center gap-0.5">
              Inspect <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Approved by CEO */}
        <div
          onClick={() => onNavigateTab('queue')}
          className="bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/70 p-5 rounded-2xl shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Approved by CEO Tag
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mb-1">
            {approvedByCeoCount}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400/90 font-medium">
              {totalApproved} Total Approved
            </span>
            <span className="text-slate-500 group-hover:text-emerald-300 flex items-center gap-0.5">
              Records <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Registered Users & Quotas */}
        <div
          onClick={() => onNavigateTab('user_quotas')}
          className="bg-slate-900 border border-blue-500/30 hover:border-blue-500/70 p-5 rounded-2xl shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Clients
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {users.length}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400/90 font-medium">
              Intake Quotas Active
            </span>
            <span className="text-slate-500 group-hover:text-blue-300 flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* VIP Spotlight Queue Section */}
      {vipSubmissions.some(s => s.status !== 'Approved' && s.status !== 'Rejected') && (
        <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                <Crown className="w-4 h-4 fill-yellow-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                VIP Priority Filings (Direct CEO Desk Routing)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500 text-slate-950">
              4-Hour SLA Target
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {vipSubmissions
              .filter(s => s.status !== 'Approved' && s.status !== 'Rejected')
              .slice(0, 4)
              .map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-yellow-500/30 flex flex-col justify-between gap-3 hover:border-yellow-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {sub.userName}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-yellow-500 text-slate-950">
                          VIP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{sub.formTitle}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Ref #{sub.id} • {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => onSelectSubmission(sub)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenRejectModal(sub)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickApprove(sub.id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Two-Column Grid: Emergency Control & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (1 col): System Controls */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Executive Security Controls</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Emergency Intake Freeze</p>
                  <p className="text-[11px] text-slate-400">
                    Temporarily halt new public filings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleFreeze}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isEmergencyFreeze
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isEmergencyFreeze ? 'FROZEN' : 'NORMAL'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigateTab('announcements')}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Broadcast Corporate Notice
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('company_governance')}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Configure Company Branding
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right (2 cols): Real-Time Activity Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Real-Time Executive Activity Stream</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('activity')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              View All Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                No recorded actions in this session.
              </div>
            ) : (
              activityLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200 uppercase tracking-wide text-[11px]">{log.type.replace('_', ' ')}</p>
                    <p className="text-[11px] text-slate-400">
                      User: <span className="text-slate-300">{log.userName || log.userEmail}</span> • {log.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
