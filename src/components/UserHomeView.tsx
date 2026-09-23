import React, { useState } from 'react';
import {
  FileCheck2,
  ClipboardList,
  Headphones,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  FileText,
  HelpCircle,
  Layers,
  Crown,
  Bell,
  Search,
  AlertTriangle,
  Info,
  Download,
  Check,
  Bot,
  Plus,
  Linkedin,
  Twitter,
  Youtube,
  X,
  Briefcase,
  UserCheck,
  User,
  Shield,
  Lock,
  ExternalLink
} from 'lucide-react';
import { UserAccount, FormSubmission, CompanyBranding, FormTemplate } from '../types';
import { CEOSignature } from './CEOSignature';
import aiRobotBannerImg from '../assets/images/ai_assistant_robot_banner_1790096124328.jpg';
import {
  getUserSubmissions,
  isUserVip,
  loadActivityLogsLocally,
  detectClientDevice
} from '../utils/storage';

interface UserHomeViewProps {
  currentUser: UserAccount;
  branding: CompanyBranding;
  templates: FormTemplate[];
  userSubmission: FormSubmission | null;
  onNavigateToTab: (tab: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant', targetSectionId?: string) => void;
  onSelectCategoryAndNavigate?: (categoryId: string) => void;
}

const TEMPLATE_IMAGES: Record<string, string> = {
  'client-inquiry': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
  'job-application': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
  'internal-request': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
  'vendor-partner': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
};

const TEMPLATE_ICONS: Record<string, any> = {
  'client-inquiry': Briefcase,
  'job-application': UserCheck,
  'internal-request': ClipboardList,
  'vendor-partner': Building2,
};

export const UserHomeView: React.FC<UserHomeViewProps> = ({
  currentUser,
  branding,
  templates,
  userSubmission,
  onNavigateToTab,
  onSelectCategoryAndNavigate,
}) => {
  // Modal states for full functional working experience
  const [selectedDetailTemplate, setSelectedDetailTemplate] = useState<FormTemplate | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Real user submissions
  const userSubmissions = getUserSubmissions(currentUser.id, currentUser.email);
  const activeSub = userSubmissions[0] || userSubmission;

  // Max submission quota calculation
  const maxLimit = Math.min(9, Math.max(1, currentUser?.submissionLimit || 1));
  const isLimitReached = userSubmissions.length >= maxLimit;

  // Retrieve active broadcast notice from CEO Arnav Sharma (if set in portal)
  const activeNotice = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('company_ceo_broadcast_notice_v1');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Time-based personalized greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const companyName = branding.companyName || 'Anthony India';

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

  // 1. REAL RECENT ACTIVITY TIMELINE
  const realActivities = React.useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      timestamp: number;
      icon: any;
      color: string;
      tab?: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant';
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

      // Check uploaded files
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

    // Add activity logs recorded in storage for this user
    try {
      const logs = loadActivityLogsLocally();
      logs
        .filter(
          (l) =>
            l.userId === currentUser.id ||
            (l.userEmail && currentUser.email && l.userEmail.toLowerCase() === currentUser.email.toLowerCase())
        )
        .forEach((log) => {
          if (log.type === 'submission') return; // Handled directly above

          const logTime = new Date(log.timestamp).getTime() || Date.now();
          let title = 'Portal Activity';
          let icon = Info;
          let color = 'bg-slate-50 text-slate-600 border-slate-100';
          let tab: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant' = 'home';

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

    // Fallback account registration event if no log was recorded
    if (currentUser.createdAt) {
      const createdTime = new Date(currentUser.createdAt).getTime();
      if (!items.some((i) => i.title === 'Account Registered' || i.title === 'Account Initialized')) {
        items.push({
          id: `user-created-${currentUser.id}`,
          title: 'Account Initialized',
          desc: `Account registered via ${currentUser.authProvider === 'google' ? 'Google Authentication' : 'Email & Password'}`,
          time: formatActivityTime(currentUser.createdAt),
          timestamp: createdTime,
          icon: CheckCircle2,
          color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          tab: 'account',
        });
      }
    }

    // Session sign-in event
    if (currentUser.lastLoginAt) {
      const loginTime = new Date(currentUser.lastLoginAt).getTime();
      if (!items.some((i) => i.title === 'User Signed In' || i.title === 'Session Sign-In')) {
        items.push({
          id: `user-login-${currentUser.id}`,
          title: 'Active Session',
          desc: `Signed in from ${currentUser.lastLoginDevice || detectClientDevice()}`,
          time: formatActivityTime(currentUser.lastLoginAt),
          timestamp: loginTime,
          icon: ShieldCheck,
          color: 'bg-blue-50 text-blue-600 border-blue-100',
          tab: 'account',
        });
      }
    }

    const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);
    return sortedItems;
  }, [userSubmissions, currentUser]);

  const recentActivities = realActivities.slice(0, 5);

  // 2. REAL USER DOCUMENTS LIST
  const realDocuments = React.useMemo(() => {
    const docs: Array<{
      id: string;
      name: string;
      sizeText: string;
      subId: string;
      date: string;
      verified: boolean;
      type: string;
      isCertificate?: boolean;
    }> = [];

    userSubmissions.forEach((sub) => {
      // Check attached files in form data
      if (sub.data) {
        Object.entries(sub.data).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object' && val.name) {
            const sizeInKb = val.size ? `${(val.size / 1024).toFixed(1)} KB` : 'Attached Document';
            docs.push({
              id: `${sub.id}-${key}`,
              name: val.name,
              sizeText: sizeInKb,
              subId: sub.id,
              date: formatActivityTime(sub.submittedAt),
              verified: sub.status === 'Approved' || sub.status === 'Under Evaluation' || sub.status === 'Acknowledged',
              type: val.type || 'Document File',
            });
          }
        });
      }

      // Check official certification
      if (sub.isCertified || sub.status === 'Approved') {
        docs.push({
          id: `${sub.id}-cert`,
          name: `Official_${sub.id}_Verification_Certificate.pdf`,
          sizeText: 'Executive Verification Certificate',
          subId: sub.id,
          date: formatActivityTime(sub.certifiedAt || sub.lastHandledAt || sub.submittedAt),
          verified: true,
          type: 'Official Certificate',
          isCertificate: true,
        });
      }
    });

    return docs;
  }, [userSubmissions]);

  // 3. REAL ATTENTION ITEMS
  const attentionItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      desc: string;
      type: 'urgent' | 'warning' | 'info' | 'success';
      actionLabel: string;
      onAction: () => void;
    }> = [];

    if (activeSub) {
      if (activeSub.status === 'Action Required') {
        items.push({
          id: 'action-req',
          title: 'Reviewer Action Required',
          desc: `Application #${activeSub.id}: Reviewer has requested additional information or verified document clarification.`,
          type: 'urgent',
          actionLabel: 'Review',
          onAction: () => onNavigateToTab('status'),
        });
      }

      if (activeSub.isCertified) {
        items.push({
          id: 'cert-ready',
          title: 'Official Certificate Issued',
          desc: `CEO Arnav Sharma has signed your executive verification certificate for #${activeSub.id}.`,
          type: 'success',
          actionLabel: 'Download',
          onAction: () => onNavigateToTab('status'),
        });
      } else if (activeSub.status === 'Approved') {
        items.push({
          id: 'approved',
          title: 'Application Approved',
          desc: `Application #${activeSub.id} has completed audit evaluation and is fully approved.`,
          type: 'success',
          actionLabel: 'View Status',
          onAction: () => onNavigateToTab('status'),
        });
      } else if (activeSub.status === 'Rejected') {
        items.push({
          id: 'rejected',
          title: 'Application Status Notice',
          desc: `Application #${activeSub.id} was not approved. Please inspect reviewer feedback notes.`,
          type: 'warning',
          actionLabel: 'Inspect',
          onAction: () => onNavigateToTab('status'),
        });
      }
    }

    if (currentUser.authProvider === 'google' && !currentUser.password) {
      items.push({
        id: 'set-password',
        title: 'Direct Password Setup (Optional)',
        desc: 'Configure a direct account password to enable manual email sign-in alongside Google.',
        type: 'info',
        actionLabel: 'Configure',
        onAction: () => onNavigateToTab('account', 'security-password-section'),
      });
    }

    if (isLimitReached) {
      items.push({
        id: 'quota-reached',
        title: 'Submission Quota Utilized',
        desc: `You have submitted ${userSubmissions.length} of ${maxLimit} allowed intake applications.`,
        type: 'info',
        actionLabel: 'My Status',
        onAction: () => onNavigateToTab('status'),
      });
    }

    return items;
  }, [activeSub, currentUser, userSubmissions, isLimitReached, maxLimit, onNavigateToTab]);

  // Quick Actions matching portal website navigation tabs
  const quickActions = [
    {
      id: 'form-filling',
      title: 'Form Filling',
      desc: 'Official category forms & instant submission',
      badge: 'Tab 2',
      icon: FileCheck2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300',
      action: () => onNavigateToTab('form'),
    },
    {
      id: 'submission-status',
      title: 'Submission Status',
      desc: 'Live tracking, SLA & reviewer audit notes',
      badge: 'Tab 3',
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300',
      action: () => onNavigateToTab('status'),
    },
    {
      id: 'my-documents',
      title: 'My Documents',
      desc: 'View attached files & verified certificates',
      badge: 'Files',
      icon: Layers,
      color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300',
      action: () => {
        const docSection = document.getElementById('your-documents-section');
        if (docSection) {
          docSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          onNavigateToTab('status');
        }
      },
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      desc: '24/7 intelligent portal assistant',
      badge: 'AI Support',
      icon: Bot,
      color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300',
      action: () => onNavigateToTab('assistant'),
    },
    {
      id: 'company-info',
      title: 'Company Info',
      desc: 'About company, CEO message & governance',
      badge: 'Details',
      icon: Building2,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300',
      action: () => onNavigateToTab('company'),
    },
    {
      id: 'account-management',
      title: 'Account Management',
      desc: 'Profile settings, quota allowance & security',
      badge: 'Tab 4',
      icon: User,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300',
      action: () => onNavigateToTab('account'),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-10" id="user-home-view-root">
      {/* 0. CEO EXECUTIVE BROADCAST / ANNOUNCEMENT (If published) */}
      {activeNotice && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
            activeNotice.type === 'urgent'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : activeNotice.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              activeNotice.type === 'urgent'
                ? 'bg-rose-100 border-rose-300 text-rose-600'
                : activeNotice.type === 'info'
                ? 'bg-blue-100 border-blue-300 text-blue-600'
                : 'bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <Building2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                  activeNotice.type === 'urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : activeNotice.type === 'info'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {activeNotice.type === 'urgent' ? 'Urgent Notice' : 'Corporate Announcement'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Published {new Date(activeNotice.createdAt).toLocaleDateString()} by {activeNotice.author || 'CEO Arnav Sharma'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight pt-0.5">{activeNotice.title}</h4>
            <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{activeNotice.body}</p>
            <div className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-200/80">
              <div className="h-8 flex items-center">
                <CEOSignature className="w-16 h-8 opacity-80" color="#2563eb" />
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Chief Executive Officer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. STRATEGIC VIP ACCOUNT BANNER (If VIP) */}
      {isUserVip(currentUser) && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-inner shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>STRATEGIC VIP ACCOUNT ACTIVE</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 font-extrabold uppercase tracking-wider">
                  VIP Priority
                </span>
              </h3>
              <p className="text-xs text-slate-900 font-medium mt-0.5 leading-relaxed">
                Your account is designated as a VIP partner. All form submissions automatically route directly to Strategic Administration for priority executive review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. WELCOME SECTION (Greeting, Title, Description, Real Action Buttons & Quote Card) */}
      <section
        className="relative rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-8 md:p-10 border border-slate-800 shadow-xl overflow-hidden"
        id="welcome-section"
      >
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-radial-gradient from-blue-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Greeting, Title, Description & Action Buttons */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-slate-300 font-medium">
              <span>{greeting}, {currentUser.name || 'User'}</span>
              <span className="text-base">👋</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome to {companyName}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Manage your applications, services, documents and support — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-start-new-application"
                onClick={() => {
                  if (isLimitReached) {
                    onNavigateToTab('status');
                  } else {
                    onNavigateToTab('form');
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{isLimitReached ? 'View My Application' : 'Start New Application'}</span>
              </button>

              <button
                type="button"
                id="btn-track-application"
                onClick={() => onNavigateToTab('status')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Track Application</span>
              </button>
            </div>
          </div>

          {/* Right Column: Quote Card with Corporate Branding */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-base sm:text-lg font-semibold italic text-white/95 leading-snug">
                "Building trusted partnerships for a better tomorrow."
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs font-bold text-blue-300 tracking-wide uppercase">
                  — {companyName}
                </span>
                <span className="text-[10px] text-slate-400 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                  Executive Governance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTIONS (6 Organized Cards in Grid with real Website Action Names) */}
      <section className="space-y-4" id="quick-actions-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Quick Actions</h2>
            <p className="text-xs text-slate-500">Direct shortcuts to all portal modules.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.action}
                id={`quick-action-${action.id}`}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {action.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {action.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {action.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4 & 5. CURRENT APPLICATION & NEEDS YOUR ATTENTION (Side-by-Side Responsive Layout) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="current-application-and-attention">
        {/* 4. CURRENT APPLICATION (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Current Application</h2>
            <button
              type="button"
              onClick={() => onNavigateToTab('status')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
            >
              <span>View Full Status</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeSub ? (
            <div className="space-y-5">
              {/* Header info with Icon, Title, ID and Status badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {activeSub.formTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Tracking ID: <span className="font-bold text-slate-800">{activeSub.id}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    activeSub.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : activeSub.status === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : activeSub.status === 'Action Required'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {activeSub.status || 'Under Review'}
                </span>
              </div>

              {/* Stepper Timeline (Submitted -> Under Review -> Decision) */}
              <div className="pt-2">
                <div className="relative flex items-center justify-between">
                  {/* Connecting track line */}
                  <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-200 -z-0" />
                  <div
                    className="absolute left-6 top-3 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
                    style={{
                      width:
                        activeSub.status === 'Approved' || activeSub.status === 'Rejected'
                          ? 'calc(100% - 48px)'
                          : '50%',
                    }}
                  />

                  {/* Step 1: Submitted */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-2">Submitted</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(activeSub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                        activeSub.status === 'Approved' || activeSub.status === 'Rejected'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-600 text-white animate-pulse'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-2">Under Review</span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {activeSub.status === 'Approved' || activeSub.status === 'Rejected' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Step 3: Decision */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        activeSub.status === 'Approved'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : activeSub.status === 'Rejected'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {activeSub.status === 'Approved' || activeSub.status === 'Rejected' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 mt-2">Decision</span>
                    <span className="text-[10px] text-slate-400">
                      {activeSub.status === 'Approved'
                        ? 'Approved'
                        : activeSub.status === 'Rejected'
                        ? 'Rejected'
                        : 'Final Audit'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="mt-6 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Verification Progress</span>
                    <span className="text-slate-900 font-mono">
                      {activeSub.status === 'Approved'
                        ? '100%'
                        : activeSub.status === 'Rejected'
                        ? '100%'
                        : activeSub.status === 'Under Evaluation' || activeSub.status === 'Acknowledged'
                        ? '65%'
                        : '35%'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeSub.status === 'Approved'
                          ? 'bg-emerald-600'
                          : activeSub.status === 'Rejected'
                          ? 'bg-rose-600'
                          : 'bg-blue-600'
                      }`}
                      style={{
                        width:
                          activeSub.status === 'Approved' || activeSub.status === 'Rejected'
                            ? '100%'
                            : activeSub.status === 'Under Evaluation' || activeSub.status === 'Acknowledged'
                            ? '65%'
                            : '35%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Application & Track Status */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTab('status')}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors cursor-pointer"
                >
                  View Details & Audit
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('status')}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs text-center transition-colors cursor-pointer"
                >
                  Track Live Status
                </button>
              </div>
            </div>
          ) : (
            /* REAL EMPTY STATE WHEN USER HAS NO ACTIVE SUBMISSIONS */
            <div className="py-8 px-4 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-900">No Active Applications</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have not submitted an application yet. Choose from our 4 available service categories below to start your official submission.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTab('form')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Application</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const servicesEl = document.getElementById('our-services-section');
                    if (servicesEl) servicesEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Explore Services
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. NEEDS YOUR ATTENTION (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  attentionItems.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Needs Your Attention</h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {attentionItems.length} Notice{attentionItems.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {attentionItems.length > 0 ? (
              attentionItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    item.type === 'urgent'
                      ? 'bg-rose-50/70 border-rose-100 text-rose-900'
                      : item.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-100 text-amber-900'
                      : item.type === 'success'
                      ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                      : 'bg-blue-50/70 border-blue-100 text-blue-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'urgent'
                          ? 'bg-rose-100 text-rose-600'
                          : item.type === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : item.type === 'success'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {item.type === 'urgent' || item.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : item.type === 'success' ? (
                        <Crown className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shrink-0 shadow-2xs transition-colors cursor-pointer"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))
            ) : (
              /* REAL CAUGHT UP STATE */
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950">All Caught Up</h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    No pending actions required. All your profile credentials and portal records are current.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. RECENT ACTIVITY (Optimized for better visual scanability) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6" id="recent-activity-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-500">Real history of your applications, status updates & sign-ins.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('activity')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>View All History</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
              <p className="text-xs font-semibold">No recent activity detected.</p>
            </div>
          ) : (
            recentActivities.map((act) => {
              const Icon = act.icon || Clock;
              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (act.tab) onNavigateToTab(act.tab);
                  }}
                  className="flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div className="w-28 sm:w-36 shrink-0 text-left">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors whitespace-nowrap">
                      {act.time}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {act.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5 truncate">
                      {act.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all self-center" />
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 7. OUR SERVICES (Only Real Available Templates from the Portal) */}
      <section className="space-y-4" id="our-services-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Our Services</h2>
            <p className="text-xs text-slate-500">Only showing the 4 official enterprise services available in this portal.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('form')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Go to Form Filling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => {
            const Icon = TEMPLATE_ICONS[template.id] || Briefcase;
            const bgImage =
              TEMPLATE_IMAGES[template.id] ||
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={bgImage}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    <div className="absolute top-2.5 right-2.5">
                      <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-xs text-white flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-blue-600/90 px-2 py-0.5 rounded backdrop-blur-xs">
                        {template.department || 'Official Service'}
                      </span>
                      <span className="text-[10px] font-bold text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{template.estimatedTime || '3-4 mins'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {template.subtitle}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 font-medium">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{template.sections?.length || 3} Structured Sections</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  {/* Learn More: Opens Dedicated Service Modal */}
                  <button
                    type="button"
                    onClick={() => setSelectedDetailTemplate(template)}
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer py-1"
                  >
                    <span>Learn More</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Apply Now / Fill Now: Starts the form or opens the designated filing section */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCategoryAndNavigate) {
                        onSelectCategoryAndNavigate(template.id);
                      } else {
                        onNavigateToTab('form');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
                  >
                    <span>Fill Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. YOUR DOCUMENTS (REAL Recently Uploaded or Generated Documents) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5" id="your-documents-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Your Documents</h2>
            <p className="text-xs text-slate-500">Official files attached during submission and verified certificates issued by administration.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('status')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View in Status Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {realDocuments.length > 0 ? (
            realDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigateToTab('status')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.isCertificate ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {doc.isCertificate ? <Crown className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      Application #{doc.subId} • {doc.sizeText} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      doc.isCertificate
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : doc.verified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {doc.isCertificate ? 'Official Issued' : doc.verified ? 'Verified' : 'Attached'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          ) : (
            /* REAL CLEAN PLACEHOLDER WHEN NO DOCUMENTS ATTACHED YET */
            <div className="py-8 px-4 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-xs font-bold text-slate-800">No Documents Uploaded Yet</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  When you submit an application with file attachments (e.g. Resume, Project RFP, W-9) or receive an official executive certificate, it will appear here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('form')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Application with Documents</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 9. AI SUPPORT BANNER (Callout to Full-Screen AI Assistant with 3D Robot Visual) */}
      <section
        className="rounded-3xl bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-100/90 p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs overflow-hidden relative"
        id="ai-support-banner"
      >
        <div className="space-y-2.5 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
            <Bot className="w-3 h-3" />
            <span>24/7 Intelligent AI Support</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Need help? {companyName} AI Assistant
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Get instant help with applications, documents, status and portal navigation in English, Hindi, and Hinglish.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              id="btn-open-ai-assistant"
              onClick={() => onNavigateToTab('assistant')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Open AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-blue-100/80 text-[11px] font-medium text-emerald-600 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instant response (&lt;2s)</span>
            </div>
          </div>
        </div>

        {/* 3D Robot Mascot Visual Matching Image 1 */}
        <div className="w-full md:w-auto flex justify-center shrink-0 z-10">
          <div
            onClick={() => onNavigateToTab('assistant')}
            className="group relative rounded-2xl overflow-hidden border border-blue-200/80 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer w-full max-w-[260px] sm:max-w-[300px] md:w-64"
          >
            <img
              src={aiRobotBannerImg}
              alt="3D AI Support Assistant Robot"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover rounded-xl group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">AI Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. IMPORTANT INFORMATION (4 Real Interactive Cards with functional modals) */}
      <section className="space-y-4" id="important-info-section">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Important Information</h2>
          <p className="text-xs text-slate-500">Quick access to key resources, security protocols and support channels.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Security & Compliance */}
          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 group hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Security & Compliance
                </h3>
                <p className="text-[11px] text-slate-500">256-bit encryption & audit standards</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Card 2: Help Center (Navigates to Support & Company) */}
          <button
            type="button"
            onClick={() => onNavigateToTab('support')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 group hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Help Center
                </h3>
                <p className="text-[11px] text-slate-500">FAQs, guidebooks & CEO message</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Card 3: Contact Support (Navigates to Support Desk) */}
          <button
            type="button"
            onClick={() => onNavigateToTab('support')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 group hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Contact Support
                </h3>
                <p className="text-[11px] text-slate-500">{branding.supportEmail || 'arnavpro78910@gmail.com'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Card 4: Terms & Privacy (Opens interactive policy dialog) */}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 group hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Terms & Privacy
                </h3>
                <p className="text-[11px] text-slate-500">Corporate intake policies & governance</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 11. CORPORATE FOOTER (With Direct Navigation Links) */}
      <footer className="rounded-3xl bg-[#0b1727] text-white p-8 sm:p-10 border border-slate-800 shadow-xl space-y-8" id="corporate-footer">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Slogan */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                AI
              </div>
              <span className="text-base font-black tracking-tight uppercase">
                {companyName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Trusted Today, Stronger Tomorrow.
            </p>
            <p className="text-[11px] text-slate-500">
              Official intake workflows, enterprise cloud engineering, and executive governance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button type="button" onClick={() => onNavigateToTab('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home Overview
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('form')} className="hover:text-white transition-colors cursor-pointer">
                  Form Filling
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('status')} className="hover:text-white transition-colors cursor-pointer">
                  Submission Status
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('account')} className="hover:text-white transition-colors cursor-pointer">
                  Account Management
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('support')} className="hover:text-white transition-colors cursor-pointer">
                  Support Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Company</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button type="button" onClick={() => onNavigateToTab('company', 'company-about-section')} className="hover:text-white transition-colors cursor-pointer">
                  About {companyName}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('company', 'ceo-message-section')} className="hover:text-white transition-colors cursor-pointer">
                  CEO Arnav Sharma Message
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('company', 'mission-vision-section')} className="hover:text-white transition-colors cursor-pointer">
                  Mission & Vision
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('company', 'corporate-governance-section')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Corporate Governance
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateToTab('company', 'careers-section')} className="hover:text-white transition-colors cursor-pointer">
                  Careers & Employment
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Follow Us */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Support</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button type="button" onClick={() => onNavigateToTab('support')} className="hover:text-white transition-colors cursor-pointer">
                    Help Center
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateToTab('support')} className="hover:text-white transition-colors cursor-pointer">
                    Contact Desk
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateToTab('assistant')} className="hover:text-white transition-colors cursor-pointer">
                    AI Assistant Chat
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigateToTab('status')} className="hover:text-white transition-colors cursor-pointer">
                    Track Submissions
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Follow Us</h4>
              <div className="flex items-center gap-2">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 {companyName}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setShowSecurityModal(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Security
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: SERVICE DETAILS & REQUIREMENTS MODAL (Solves "learn more pe click ke baad wrong page") */}
      {selectedDetailTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  {React.createElement(TEMPLATE_ICONS[selectedDetailTemplate.id] || Briefcase, {
                    className: 'w-6 h-6',
                  })}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {selectedDetailTemplate.department || 'Official Service'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                    {selectedDetailTemplate.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Description */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About this Service</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                {selectedDetailTemplate.subtitle}
              </p>
            </div>

            {/* Key Specifications & Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Estimated Completion</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {selectedDetailTemplate.estimatedTime || '3-4 mins'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Routing Department</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{selectedDetailTemplate.department}</span>
                </span>
              </div>
            </div>

            {/* Sections Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Form Sections</h4>
              <div className="space-y-1.5">
                {selectedDetailTemplate.sections?.map((sec, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quota Notice if reached */}
            {isLimitReached && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold block">Account Quota Active ({userSubmissions.length}/{maxLimit})</span>
                  <span>You have already submitted an active intake application. You can track its live review progress on the Status tab.</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetailTemplate(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = selectedDetailTemplate.id;
                  setSelectedDetailTemplate(null);
                  if (onSelectCategoryAndNavigate) {
                    onSelectCategoryAndNavigate(targetId);
                  } else {
                    onNavigateToTab('form');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Fill Now (Apply)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SECURITY & COMPLIANCE MODAL */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Security & Compliance</h3>
                  <p className="text-xs text-slate-500">Enterprise data protection & governance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>256-Bit Intake Data Encryption</span>
                </h4>
                <p className="leading-relaxed">
                  All submission data, confidential attachments, and personal contact information are encrypted during transit and at rest using bank-grade AES-256 protocols.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Role-Based Reviewer Separation</span>
                </h4>
                <p className="leading-relaxed">
                  Submissions are automatically routed to verified department officers. Strategic applications are protected with CEO executive audit trails.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>Cryptographic Verification Certificates</span>
                </h4>
                <p className="leading-relaxed">
                  Upon approval, verified applications receive a tamper-proof verification certificate personally signed and certified by Chief Executive Officer Arnav Sharma.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TERMS & PRIVACY POLICY MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Terms & Privacy Policy</h3>
                  <p className="text-xs text-slate-500">Corporate portal governance standards</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. Information Collection & Usage</h4>
                <p>
                  {companyName} collects and processes data provided in official intake filings solely for the purpose of application evaluation, commercial quotation, candidate assessment, or vendor onboarding.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Submission Quotas & Integrity</h4>
                <p>
                  To maintain rigorous verification throughput, accounts are subject to administrative quota limits. All submitted records undergo automated audit validation.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. Document Confidentiality</h4>
                <p>
                  Files submitted (such as RFPs, CVs, and tax compliance certificates) are strictly classified as confidential corporate documents and are never shared with external third parties without explicit authorization.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">4. Executive Governance</h4>
                <p>
                  All corporate policies and approval workflows are governed under the executive oversight of Founder & CEO Arnav Sharma.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Policies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
