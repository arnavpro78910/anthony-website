import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Radio,
  Users,
  LogIn,
  FileText,
  UserPlus,
  ShieldAlert,
  Sliders,
  Search,
  Filter,
  Clock,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  CheckCircle,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowUpRight,
  Shield,
  Eye,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { ActivityLog, UserAccount, FormSubmission } from '../types';
import { isUserOnline } from '../utils/storage';
import { clearAllActivityLogs } from '../services/firestoreService';

interface LiveActivityFeedProps {
  activityLogs: ActivityLog[];
  users: UserAccount[];
  submissions: FormSubmission[];
  onInspectSubmission?: (sub: FormSubmission) => void;
  onInspectUser?: (user: UserAccount) => void;
  onRefresh?: () => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  activityLogs,
  users,
  submissions,
  onInspectSubmission,
  onInspectUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastSeenLogId, setLastSeenLogId] = useState<string | null>(activityLogs[0]?.id || null);
  const [newLogPill, setNewLogPill] = useState<boolean>(false);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  const handleClearAllLogs = async () => {
    try {
      await clearAllActivityLogs();
      setShowConfirmClear(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to clear activity logs:', err);
    }
  };

  // Play a gentle web audio chime on new cross-device event
  const playAlertChime = (type: string) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'login') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      } else if (type === 'submission') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio context might be restricted before first click
    }
  };

  // Monitor for incoming cross-device live events
  useEffect(() => {
    if (activityLogs.length > 0) {
      const newest = activityLogs[0];
      if (lastSeenLogId && newest.id !== lastSeenLogId) {
        setNewLogPill(true);
        playAlertChime(newest.type);
        const timer = setTimeout(() => setNewLogPill(false), 4000);
        return () => clearTimeout(timer);
      }
      setLastSeenLogId(newest.id);
    }
  }, [activityLogs]);

  // Online active users
  const onlineUsers = useMemo(() => {
    return users.filter(u => isUserOnline(u));
  }, [users]);

  // Filtered activity logs (limited to latest 100 items to maintain excellent rendering performance)
  const filteredLogs = useMemo(() => {
    const filtered = activityLogs.filter(log => {
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesUser = (log.userName || '').toLowerCase().includes(query) || (log.userEmail || '').toLowerCase().includes(query);
        const matchesDetail = (log.details || '').toLowerCase().includes(query);
        const matchesDevice = (log.device || '').toLowerCase().includes(query);
        const matchesType = (log.type || '').toLowerCase().includes(query);
        return matchesUser || matchesDetail || matchesDevice || matchesType;
      }
      return true;
    });
    return filtered.slice(0, 100);
  }, [activityLogs, typeFilter, searchTerm]);

  // Helper to format relative time
  const getRelativeTime = (isoString: string) => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 5) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDays = Math.floor(diffHour / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  // Device icon helper
  const getDeviceIcon = (deviceStr?: string) => {
    if (!deviceStr) return <Laptop className="w-3.5 h-3.5 text-slate-500" />;
    const lower = deviceStr.toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('android') || lower.includes('ios')) {
      return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-slate-700" />;
  };

  // Event type icon and theme
  const getEventBadge = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login':
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'User Sign-In',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'submission':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Form Submission',
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          dot: 'bg-blue-500',
        };
      case 'register':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-purple-600" />,
          label: 'New Registration',
          bg: 'bg-purple-50 border-purple-200 text-purple-800',
          dot: 'bg-purple-500',
        };
      case 'ban':
      case 'unban':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
          label: type === 'ban' ? 'Account Suspended' : 'Suspension Lifted',
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
        };
      case 'quota_change':
        return {
          icon: <Sliders className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Quota Adjusted',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
        };
      case 'status_change':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />,
          label: 'Status Updated',
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          dot: 'bg-indigo-500',
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-slate-600" />,
          label: 'System Event',
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="space-y-6" id="live-activity-stream-panel">
      {/* 1. REAL-TIME TELEMETRY STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Online Now Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-700/50 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Radio className="w-20 h-20 text-emerald-300" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              Connected Now
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {onlineUsers.length} <span className="text-xs font-normal text-emerald-300">online</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-200/80 font-medium">
            Cross-device session synchronization active
          </div>
        </div>

        {/* Total Events in Stream */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Audit Events</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{activityLogs.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Real-time event stream logs</span>
        </div>

        {/* Total Submissions Intake */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Intake Submissions</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{submissions.length}</div>
          <span className="text-[11px] text-amber-700 mt-1 block">Received from users</span>
        </div>

        {/* Registered User Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">User Directory</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 font-mono">{users.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Accounts registered</span>
        </div>
      </div>

      {/* 2. WHO IS ONLINE RIGHT NOW - ACTIVE CROSS-DEVICE SESSIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Who Logged In & Active Sessions (Real-Time Presence)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Devices currently active or authenticated within the corporate network
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title="Toggle audio tone on new login or form submission"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Live Audio: ON' : 'Live Audio: OFF'}</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {onlineUsers.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
            No external user sessions currently active. When users log in on phones, tablets, or other computers, they will appear here instantly.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {onlineUsers.map(user => {
              const isMasterAdmin = user.username === 'aasnc' || user.role === 'admin';
              return (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 to-white shadow-2xs hover:border-emerald-300 transition-all flex items-start gap-3"
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs truncate">{user.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        ONLINE
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>

                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-600 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                        {getDeviceIcon(user.lastLoginDevice)}
                        <span>{user.lastLoginDevice || 'Desktop Browser'}</span>
                      </span>
                      {user.lastAction && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {user.lastAction}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last active {user.lastActiveAt ? getRelativeTime(new Date(user.lastActiveAt).toISOString()) : 'recently'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. REAL-TIME ACTIVITY STREAM & AUDIT LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Stream Header & Filters */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Live Event Stream (Who Logged In, Registered & Submitted)</span>
              </h3>
              {newLogPill && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white animate-bounce">
                  NEW EVENT!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredLogs.length} of {activityLogs.length} events
              </span>
              
              {activityLogs.length > 0 && (
                <div className="relative">
                  {!showConfirmClear ? (
                    <button
                      type="button"
                      onClick={() => setShowConfirmClear(true)}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear all activity logs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-150">
                      <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Clear all?</span>
                      <button
                        type="button"
                        onClick={handleClearAllLogs}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded shadow-xs cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmClear(false)}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search live events by user, device, action or email..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Events ({activityLogs.length})
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('login')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === 'login'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
                }`}
              >
                🔑 Logins ({activityLogs.filter(l => l.type === 'login').length})
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('submission')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === 'submission'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 border border-blue-200/60 hover:bg-blue-100'
                }`}
              >
                📝 Submissions ({activityLogs.filter(l => l.type === 'submission').length})
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('register')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === 'register'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 border border-purple-200/60 hover:bg-purple-100'
                }`}
              >
                👤 Registrations ({activityLogs.filter(l => l.type === 'register').length})
              </button>

              <button
                type="button"
                onClick={() => setTypeFilter('ban')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === 'ban'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100'
                }`}
              >
                ⚡ Bans ({activityLogs.filter(l => l.type === 'ban' || l.type === 'unban').length})
              </button>
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No real-time events match the selected criteria.
            </div>
          ) : (
            filteredLogs.map(log => {
              const badge = getEventBadge(log.type);
              const matchingUser = users.find(u => u.id === log.userId || (u.email && log.userEmail && u.email.toLowerCase() === log.userEmail.toLowerCase()));
              const isCurrentlyOnline = matchingUser ? isUserOnline(matchingUser) : false;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Event Icon Badge */}
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                      {badge.icon}
                    </div>

                    {/* Event Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs">
                          {log.userName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({log.userEmail})
                        </span>
                        {isCurrentlyOnline && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🟢 ACTIVE NOW
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 mt-1 font-medium">
                        {log.details}
                      </p>

                      {/* Device & Client Telemetry */}
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 flex-wrap font-mono">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {getDeviceIcon(log.device)}
                          <span>{log.device || 'Desktop Browser'}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span>({getRelativeTime(log.timestamp)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Deep Links */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {log.meta?.submissionId && onInspectSubmission && (
                      <button
                        type="button"
                        onClick={() => {
                          const sub = submissions.find(s => s.id === log.meta?.submissionId);
                          if (sub) onInspectSubmission(sub);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Form #{log.meta.submissionId}</span>
                      </button>
                    )}

                    {matchingUser && onInspectUser && (
                      <button
                        type="button"
                        onClick={() => onInspectUser(matchingUser)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Manage user account"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>User Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
