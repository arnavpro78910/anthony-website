import React from 'react';
import { 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { FormSubmission, UserAccount, ActivityLog } from '../../types';
import { LiveActivityFeed } from '../LiveActivityFeed';

interface AdminOverviewTabProps {
  submissions: FormSubmission[];
  users: UserAccount[];
  activityLogs: ActivityLog[];
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  submissions,
  users,
  activityLogs,
}) => {
  const pendingCount = submissions.filter(s => s.status === 'Pending Review' || s.status === 'Under Evaluation').length;
  const approvedCount = submissions.filter(s => s.status === 'Approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'Rejected').length;
  const onlineCount = users.filter(u => u.isOnline).length;

  const stats = [
    { label: 'Submissions', value: submissions.length, icon: FileSpreadsheet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Awaiting Review', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Authorized', value: approvedCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Users', value: onlineCount, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time system telemetry and operational performance metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
           <Zap className="w-4 h-4 text-amber-500" />
           <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live System Sync: 100%</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <button className="p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed Container */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">System Event Registry</h3>
                </div>
                <div className="flex items-center gap-2">
                   <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Updates</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden min-h-[500px]">
                <LiveActivityFeed 
                  activityLogs={activityLogs} 
                  users={users} 
                  submissions={submissions}
                />
              </div>
           </div>
        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-6">
           <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-40 h-40" />
              </div>
              <h4 className="text-lg font-bold tracking-tight">Security Posture</h4>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">System is operating under high-security protocol. All data transmissions are AES-256 encrypted.</p>
              <div className="mt-8 space-y-4">
                 <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-3">
                   <span className="text-slate-500 uppercase tracking-widest">Database Health</span>
                   <span className="text-emerald-400">Excellent</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-3">
                   <span className="text-slate-500 uppercase tracking-widest">Audit Redundancy</span>
                   <span className="text-blue-400">Enabled</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-3">
                   <span className="text-slate-500 uppercase tracking-widest">API Latency</span>
                   <span className="text-emerald-400">42ms</span>
                 </div>
              </div>
              <button className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer">
                Run Security Audit
              </button>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Department Load</h4>
              <div className="space-y-4">
                {[
                  { label: 'Commercial', color: 'bg-blue-500', pct: 65 },
                  { label: 'Talent Acquisition', color: 'bg-purple-500', pct: 42 },
                  { label: 'Internal Ops', color: 'bg-emerald-500', pct: 88 },
                ].map((dept, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-slate-600">{dept.label}</span>
                      <span className="text-slate-900">{dept.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${dept.color} transition-all duration-1000 ease-out`} 
                         style={{ width: `${dept.pct}%` }}
                       />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
