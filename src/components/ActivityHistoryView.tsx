import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  Crown, 
  FileText, 
  Info, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  Home,
  Headphones,
  User,
  FileCheck,
  Bot
} from 'lucide-react';
import { UserAccount, FormSubmission } from '../types';
import { loadActivityLogsLocally } from '../utils/storage';

interface ActivityHistoryViewProps {
  currentUser: UserAccount;
  userSubmissions: FormSubmission[];
  onBack: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  currentUser,
  userSubmissions,
  onBack,
  onNavigateToTab,
}) => {
  // Helper for human-readable real date formatting
  const formatActivityTime = (isoString?: string): string => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Recently';
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) return `Today, ${timeStr}`;
      if (isYesterday) return `Yesterday, ${timeStr}`;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
    } catch {
      return 'Recently';
    }
  };

  const realActivities = React.useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      timestamp: number;
      icon: any;
      color: string;
      tab?: any;
    }> = [];

    // Add activities from actual user submissions
    userSubmissions.forEach((sub) => {
      const subTime = new Date(sub.submittedAt).getTime() || Date.now();
      items.push({
        id: `sub-${sub.id}`,
        title: 'Application Submitted',
        desc: `${sub.formTitle} (#${sub.id})`,
        time: formatActivityTime(sub.submittedAt),
        timestamp: subTime,
        icon: FileCheck2,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        tab: 'status',
      });

      if (sub.status && sub.status !== 'Pending Review') {
        const updateTime = sub.lastHandledAt ? new Date(sub.lastHandledAt).getTime() : subTime + 3600000;
        items.push({
          id: `status-${sub.id}`,
          title: `Status: ${sub.status}`,
          desc: sub.statusNotes || `Application #${sub.id} is now ${sub.status}`,
          time: formatActivityTime(sub.lastHandledAt || sub.submittedAt),
          timestamp: updateTime,
          icon: sub.status === 'Approved' ? CheckCircle2 : sub.status === 'Rejected' ? AlertTriangle : Clock,
          color:
            sub.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : sub.status === 'Rejected'
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : 'bg-blue-50 text-blue-600 border-blue-100',
          tab: 'status',
        });
      }

      if (sub.isCertified && sub.certifiedAt) {
        items.push({
          id: `cert-${sub.id}`,
          title: 'Official Certificate Issued',
          desc: `Executive Certificate signed by CEO for #${sub.id}`,
          time: formatActivityTime(sub.certifiedAt),
          timestamp: new Date(sub.certifiedAt).getTime(),
          icon: Crown,
          color: 'bg-amber-50 text-amber-600 border-amber-100',
          tab: 'status',
        });
      }

      if (sub.data) {
        Object.entries(sub.data).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object' && val.name) {
            items.push({
              id: `doc-${sub.id}-${key}`,
              title: 'Document Uploaded',
              desc: `${val.name} (Application #${sub.id})`,
              time: formatActivityTime(sub.submittedAt),
              timestamp: subTime - 30000,
              icon: FileText,
              color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
              tab: 'status',
            });
          }
        });
      }
    });

    try {
      const logs = loadActivityLogsLocally(currentUser.id);
      logs.forEach((log) => {
        if (log.type === 'submission') return;

        const logTime = new Date(log.timestamp).getTime() || Date.now();
        let title = 'Portal Activity';
        let icon = Info;
        let color = 'bg-slate-50 text-slate-600 border-slate-100';
        let tab: any = 'home';

        if (log.type === 'login') {
          title = 'User Signed In';
          icon = ShieldCheck;
          color = 'bg-blue-50 text-blue-600 border-blue-100';
          tab = 'account';
        } else if (log.type === 'register') {
          title = 'Account Registered';
          icon = CheckCircle2;
          color = 'bg-emerald-50 text-emerald-600 border-emerald-100';
          tab = 'account';
        } else if (log.type === 'quota_change') {
          title = 'Quota Allowance Updated';
          icon = Layers;
          color = 'bg-purple-50 text-purple-600 border-purple-100';
          tab = 'account';
        }

        items.push({
          id: `log-${log.id}`,
          title,
          desc: log.details || `${currentUser.name} performed an action`,
          time: formatActivityTime(log.timestamp),
          timestamp: logTime,
          icon,
          color,
          tab,
        });
      });
    } catch {}

    if (currentUser.createdAt) {
      items.push({
        id: `user-created-${currentUser.id}`,
        title: 'Account Initialized',
        desc: `Account registered via ${currentUser.authProvider === 'google' ? 'Google' : 'Email'}`,
        time: formatActivityTime(currentUser.createdAt),
        timestamp: new Date(currentUser.createdAt).getTime(),
        icon: CheckCircle2,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        tab: 'account',
      });
    }

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [userSubmissions, currentUser]);

  const quickNav = [
    { label: 'Home', icon: Home, tab: 'home' },
    { label: 'Form', icon: FileCheck, tab: 'form' },
    { label: 'Status', icon: Layers, tab: 'status' },
    { label: 'Account', icon: User, tab: 'account' },
    { label: 'Support', icon: Headphones, tab: 'support' },
    { label: 'AI Bot', icon: Bot, tab: 'assistant' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-20 pt-4 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Activity History</h1>
        <div className="w-10" /> 
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Complete Action Log</h3>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
            {realActivities.length} Records Found
          </span>
        </div>
        <div className="divide-y divide-slate-100 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {realActivities.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No activity history recorded yet.</p>
            </div>
          ) : (
            realActivities.map((act) => {
              const Icon = act.icon || Clock;
              return (
                <div 
                  key={act.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer group"
                  onClick={() => act.tab && onNavigateToTab(act.tab)}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${act.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{act.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{act.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors self-center" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="pt-8 border-t border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Quick Portal Navigation</h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickNav.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigateToTab(item.tab)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
