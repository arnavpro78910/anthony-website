import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Users, 
  Settings,
  Bell,
  Activity,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  FormSubmission, 
  UserAccount, 
  CompanyBranding, 
  ActivityLog,
  AdminControlLevel,
  FormTemplate
} from '../types';
import { 
  loadSubmissions, 
  saveSubmission, 
  deleteSubmission,
  loadUsers,
  saveUsers,
  setUserSubmissionLimit,
  unbanUser,
  banUser,
  deleteUser,
  recordLiveActivity,
  loadActivityLogs,
  toggleUserVipStatus,
  loadBranding,
  saveBranding
} from '../utils/storage';
import { initFirestoreSync } from '../services/firestoreService';
import { notify } from '../utils/notifications';

// Refactored Components
import { AdminHeader } from './admin/AdminHeader';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminSubmissionsTab } from './admin/AdminSubmissionsTab';
import { AdminUsersTab } from './admin/AdminUsersTab';

export type AdminTabId = 'overview' | 'submissions' | 'users' | 'settings';

export interface TabConfigMeta {
  id: AdminTabId;
  label: string;
  icon: any;
  description: string;
}

interface AdminDashboardProps {
  adminUser: UserAccount;
  submissions: FormSubmission[];
  users: UserAccount[];
  templates: FormTemplate[];
  branding: CompanyBranding;
  activityLogs: ActivityLog[];
  onRefreshData: () => void;
  onUpdateBranding: (newBranding: CompanyBranding) => void;
  onLogout: () => void;
}

const TABS: TabConfigMeta[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, description: 'Executive summary & telemetry' },
  { id: 'submissions', label: 'Submissions', icon: FileSpreadsheet, description: 'Intake audit & evaluation' },
  { id: 'users', label: 'Personnel', icon: Users, description: 'Access control & directory' },
  { id: 'settings', label: 'System Settings', icon: Settings, description: 'Portal branding & configuration' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  submissions: initialSubmissions,
  users: initialUsers,
  templates,
  branding: initialBranding,
  activityLogs: initialLogs,
  onRefreshData,
  onUpdateBranding,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [submissions, setSubmissions] = useState<FormSubmission[]>(initialSubmissions);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialLogs);
  const [branding, setBranding] = useState<CompanyBranding>(initialBranding);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Sync state with props changes
  useEffect(() => {
    setSubmissions(initialSubmissions);
    setUsers(initialUsers);
    setActivityLogs(initialLogs);
    setBranding(initialBranding);
  }, [initialSubmissions, initialUsers, initialLogs, initialBranding]);

  // Core Data Fetching
  const refreshData = () => {
    onRefreshData();
  };

  useEffect(() => {
    // Optimized sync with proper callback object
    const unsubscribe = initFirestoreSync({
      onSubmissionsUpdate: setSubmissions,
      onUsersUpdate: setUsers,
      onActivitiesUpdate: setActivityLogs,
      onBrandingUpdate: setBranding
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleUpdateStatus = (id: string, status: FormSubmission['status']) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    
    const updated = { ...sub, status, reviewedAt: new Date().toISOString(), reviewedBy: adminUser.name };
    saveSubmission(updated);
    notify.success(`Submission ${id} marked as ${status}`);
    
    recordLiveActivity(
      'status_change',
      adminUser,
      `Updated submission ${id} status to ${status}`
    );
  };

  const handleEscalateToCeo = (submission: FormSubmission) => {
    const updated = { 
      ...submission, 
      isSentToCeo: true, 
      workflowStage: 'ceo_desk' as const,
      status: 'Under Evaluation' as const,
      statusNotes: `Escalated to Chief Executive Officer by ${adminUser.name} for strategic review.`
    };
    saveSubmission(updated);
    notify.success('Case escalated to CEO Executive Desk');
    recordLiveActivity('escalation', adminUser, `Escalated submission ${submission.id} to CEO`);
  };

  const handleBanUser = (userId: string, reason: string, duration: number) => {
    banUser(userId, duration, reason);
    refreshData();
    notify.error('User account has been suspended');
  };

  const handleUnbanUser = (userId: string) => {
    unbanUser(userId);
    refreshData();
    notify.success('User suspension revoked');
  };

  const handleUpdateUserLimit = (userId: string, limit: number) => {
    const target = users.find(u => u.id === userId);
    if (target) {
       const updatedUsers = setUserSubmissionLimit(userId, limit);
       setUsers(updatedUsers);
       refreshData();
       notify.success(`Quota limit updated to ${limit} for ${target.name}`);
    }
  };

  const activeTabMeta = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <AdminSidebar 
        activeTab={activeTab} 
        tabs={TABS} 
        onTabChange={setActiveTab}
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          adminUser={adminUser}
          branding={branding}
          activeTabLabel={activeTabMeta.label}
          isRefreshing={isRefreshing}
          isNavDrawerOpen={isNavDrawerOpen}
          onToggleNavDrawer={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
          onRefresh={refreshData}
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-fade-in">
          {activeTab === 'overview' && (
            <AdminOverviewTab 
              submissions={submissions}
              users={users}
              activityLogs={activityLogs}
            />
          )}

          {activeTab === 'submissions' && (
            <AdminSubmissionsTab 
              submissions={submissions}
              users={users}
              onStatusUpdate={handleUpdateStatus}
              onDelete={deleteSubmission}
              onEscalate={handleEscalateToCeo}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab 
              users={users}
              onToggleVip={toggleUserVipStatus}
              onBan={handleBanUser}
              onUnban={handleUnbanUser}
              onDelete={deleteUser}
              onUpdateLimit={handleUpdateUserLimit}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Portal Configuration</h2>
                  <p className="text-slate-500 font-medium mt-1">Global branding, contact protocols, and system behavior.</p>
               </div>
               <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <div className="max-w-2xl space-y-8">
                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Branding & Identity</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700">Company Legal Name</label>
                              <input 
                                type="text"
                                value={branding.companyName}
                                onChange={(e) => setBranding({...branding, companyName: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700">Tagline / Motto</label>
                              <input 
                                type="text"
                                value={branding.tagline}
                                onChange={(e) => setBranding({...branding, tagline: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Communications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700">Official Support Email</label>
                              <input 
                                type="email"
                                value={branding.supportEmail}
                                onChange={(e) => setBranding({...branding, supportEmail: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700">Support Hotline</label>
                              <input 
                                type="text"
                                value={branding.phoneSupport}
                                onChange={(e) => setBranding({...branding, phoneSupport: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
                        <button 
                          onClick={() => {
                            saveBranding(branding);
                            notify.success('System configuration deployed successfully');
                            recordLiveActivity('settings_update', adminUser, 'Updated portal branding settings');
                          }}
                          className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer shadow-lg shadow-slate-950/20"
                        >
                           Deploy Configuration
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
