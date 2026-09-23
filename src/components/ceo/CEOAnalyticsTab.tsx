import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  Award,
  Activity,
  Zap,
  FileDown
} from 'lucide-react';
import { FormSubmission, UserAccount } from '../../types';

interface CEOAnalyticsTabProps {
  submissions: FormSubmission[];
  users: UserAccount[];
  vipUserIds: string[];
  onExportReport: () => void;
}

export const CEOAnalyticsTab: React.FC<CEOAnalyticsTabProps> = ({
  submissions,
  users,
  vipUserIds,
  onExportReport,
}) => {
  const stats = useMemo(() => {
    const total = submissions.length || 1;
    const approved = submissions.filter((s) => s.status === 'Approved').length;
    const pending = submissions.filter(
      (s) => s.status === 'Pending Review' || s.status === 'Under Evaluation'
    ).length;
    const rejected = submissions.filter((s) => s.status === 'Rejected').length;
    const certified = submissions.filter((s) => s.isCertified).length;
    const vipCount = submissions.filter((s) => s.isVipSubmission || vipUserIds.includes(s.userId || '')).length;

    // Categories
    const categoriesMap: Record<string, number> = {};
    submissions.forEach((s) => {
      const cat = s.templateId || 'General';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    return {
      total: submissions.length,
      approved,
      approvedPct: Math.round((approved / total) * 100),
      pending,
      pendingPct: Math.round((pending / total) * 100),
      rejected,
      rejectedPct: Math.round((rejected / total) * 100),
      certified,
      certifiedPct: Math.round((certified / total) * 100),
      vipCount,
      vipPct: Math.round((vipCount / total) * 100),
      categoriesMap,
    };
  }, [submissions, vipUserIds]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Executive Intelligence & Operational Velocity
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Operational Performance Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Real-time analytics on filing throughput, approval velocity, VIP SLA compliance, and category distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportReport}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
        >
          <FileDown className="w-4 h-4 text-amber-400" />
          <span>Export Analytics Digest</span>
        </button>
      </div>

      {/* Grid: Status Distribution Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">Clearance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.approvedPct}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${stats.approvedPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">{stats.approved} filings approved</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">Pending Intake</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{stats.pendingPct}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${stats.pendingPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">{stats.pending} filings awaiting review</p>
        </div>

        <div className="bg-slate-900 border border-yellow-500/30 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">VIP Priority Share</span>
            <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="text-3xl font-black text-yellow-400">{stats.vipPct}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full"
              style={{ width: `${stats.vipPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">{stats.vipCount} VIP filings handled</p>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">Rejection Ratio</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{stats.rejectedPct}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${stats.rejectedPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">{stats.rejected} filings rejected</p>
        </div>
      </div>

      {/* Category Volume Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Filing Intake by Category</span>
        </h3>

        <div className="space-y-3">
          {Object.entries(stats.categoriesMap).map(([category, count]) => {
            const pct = Math.round((count / (stats.total || 1)) * 100);
            return (
              <div key={category} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-300">{category}</span>
                  <span className="text-amber-400 font-mono">{count} ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
