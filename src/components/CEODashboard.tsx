import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FormSubmission,
  CompanyBranding,
  UserAccount,
  ActivityLog,
  FormTemplate
} from '../types';
import {
  saveCompanyBranding,
  saveUsers,
  setUserSubmissionLimit,
  updateSubmissionStatus,
  deleteSubmission,
  certifySubmission,
  createAdminAccount,
  updateAdminControlLevel,
  banUser,
  unbanUser,
  deleteUserAccount,
  isUserVip,
  toggleUserVipStatus,
  saveTemplate,
  deleteTemplate
} from '../utils/storage';
import {
  syncBrandingToFirestore,
  deleteUserFromFirestore,
  deleteSubmissionFromFirestore
} from '../services/firestoreService';
import { sendSubmissionStatusEmail } from '../services/gmailService';

import { CEOTabId, CEONotification } from './ceo/types';
import { CEONavigation } from './ceo/CEONavigation';
import { CEOOverviewTab } from './ceo/CEOOverviewTab';
import { CEOQueueTab } from './ceo/CEOQueueTab';
import { CEOGovernanceTab } from './ceo/CEOGovernanceTab';
import { CEOUsersTab } from './ceo/CEOUsersTab';
import { CEOAnnouncementsTab } from './ceo/CEOAnnouncementsTab';
import { CEOAnalyticsTab } from './ceo/CEOAnalyticsTab';
import { CEOAuditLogsTab } from './ceo/CEOAuditLogsTab';
import { CEOAdminManagementTab } from './ceo/CEOAdminManagementTab';
import { CEOFormManagementTab } from './ceo/CEOFormManagementTab';
import { CEOSubmissionModal } from './ceo/CEOSubmissionModal';
import { CEORejectModal } from './ceo/CEORejectModal';
import { ExecutiveCertificateModal } from './ExecutiveCertificateModal';
import { FloatingToast, ToastMessage } from './common/FloatingToast';

export interface CEODashboardProps {
  ceoUser: UserAccount;
  submissions: FormSubmission[];
  users: UserAccount[];
  templates: FormTemplate[];
  branding: CompanyBranding;
  activityLogs: ActivityLog[];
  onRefreshData: () => void;
  onUpdateBranding: (newBranding: CompanyBranding) => void;
  onLogout: () => void;
}

export const CEODashboard: React.FC<CEODashboardProps> = ({
  ceoUser,
  submissions,
  users,
  templates,
  branding,
  activityLogs,
  onRefreshData,
  onUpdateBranding,
  onLogout,
}) => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<CEOTabId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<CEONotification | null>(null);

  // Selected Submission Modals
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [submissionToReject, setSubmissionToReject] = useState<FormSubmission | null>(null);
  const [pdfCertificateSubmission, setPdfCertificateSubmission] = useState<FormSubmission | null>(null);

  // Emergency Intake Freeze State
  const [isEmergencyFreeze, setIsEmergencyFreeze] = useState<boolean>(() => {
    return localStorage.getItem('company_ceo_emergency_freeze') === 'true';
  });

  // VIP Client Accounts List (Synced with storage and props)
  const [vipUsers, setVipUsers] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('company_ceo_vip_users_v1');
      const storedIds = stored ? JSON.parse(stored) : [];
      const userPropVips = users.filter((u) => u.isVip || isUserVip(u)).map((u) => u.id);
      
      // Combine both sources
      const combined = Array.from(new Set([...storedIds, ...userPropVips]));
      setVipUsers(combined);
    } catch {
      setVipUsers(users.filter((u) => u.isVip || isUserVip(u)).map((u) => u.id));
    }
  }, [users]);

  // Broadcast Notice
  const [activeBroadcastNotice, setActiveBroadcastNotice] = useState<{
    id: string;
    title: string;
    body: string;
    type: string;
    createdAt: string;
    author: string;
    expiry: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem('company_ceo_broadcast_notice_v1');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Toast Notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Active submissions filtered for CEO view
  const activeSubmissions = useMemo(() => {
    return submissions.filter((s) => !s.hiddenFromAdminCeo && !s.deletedByAdminOrCeo && !s.deletedByUser);
  }, [submissions]);

  // Compute pending counts
  const pendingCount = useMemo(() => {
    return activeSubmissions.filter(
      (s) =>
        s.status !== 'Approved' &&
        s.status !== 'Rejected' &&
        (s.isSentToCeo || s.isVipSubmission || s.requestCeoReview || vipUsers.includes(s.userId || ''))
    ).length;
  }, [activeSubmissions, vipUsers]);

  const vipPendingCount = useMemo(() => {
    return activeSubmissions.filter(
      (s) =>
        s.status !== 'Approved' &&
        s.status !== 'Rejected' &&
        (s.isVipSubmission || vipUsers.includes(s.userId || ''))
    ).length;
  }, [activeSubmissions, vipUsers]);

  // Admin users (strictly administrative staff accounts, excluding CEO and regular users)
  const adminUsers = useMemo(() => {
    return users.filter((u) => u.role === 'admin');
  }, [users]);

  // Quick Approve Submission (Adds CEO Clearance tag)
  const handleQuickApprove = useCallback((id: string, note?: string) => {
    const defaultNote = `Executive Clearance Approved by CEO Arnav Singh [Ref: CEO-ACT-${Date.now().toString().slice(-6)}]`;
    updateSubmissionStatus(id, 'Approved', note || defaultNote, ceoUser.name || 'Arnav Singh', true);
    
    // Find target submission for email notification
    const targetSub = submissions.find((s) => s.id === id) || (selectedSubmission?.id === id ? selectedSubmission : null);
    if (targetSub) {
      sendSubmissionStatusEmail({
        email: targetSub.userEmail,
        userName: targetSub.userName,
        submissionId: targetSub.id,
        formTitle: targetSub.formTitle,
        status: 'Approved',
        statusNotes: note || defaultNote,
        companyName: branding.companyName,
        isCeo: true,
        isVip: targetSub.isVipSubmission || vipUsers.includes(targetSub.userId || ''),
      }).catch((e) => console.warn('Email dispatch warning:', e));
    }

    onRefreshData();
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(null);
    }
    showNotification(`Filing #${id} Approved with "Approved by CEO" tag activated!`, 'success');
  }, [ceoUser.name, onRefreshData, selectedSubmission, showNotification, submissions, branding.companyName, vipUsers]);

  // Rejection Handler (Sets status to Rejected and removes from queue so submitter sees Rejected)
  const handleConfirmReject = useCallback((id: string, note: string) => {
    const feedbackNote = note || `Application evaluated and rejected by CEO Executive Office (${ceoUser.name || 'Arnav Singh'}).`;
    updateSubmissionStatus(id, 'Rejected', feedbackNote, ceoUser.name || 'Arnav Singh', true);
    
    // Find target submission for email notification
    const targetSub = submissions.find((s) => s.id === id) || submissionToReject;
    if (targetSub) {
      sendSubmissionStatusEmail({
        email: targetSub.userEmail,
        userName: targetSub.userName,
        submissionId: targetSub.id,
        formTitle: targetSub.formTitle,
        status: 'Rejected',
        statusNotes: feedbackNote,
        companyName: branding.companyName,
        isCeo: true,
        isVip: targetSub.isVipSubmission || vipUsers.includes(targetSub.userId || ''),
      }).catch((e) => console.warn('Email dispatch warning:', e));
    }

    deleteSubmission(id, 'CEO', ceoUser.name || 'Arnav Singh');
    deleteSubmissionFromFirestore(id).catch(() => {});
    onRefreshData();
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(null);
    }
    setSubmissionToReject(null);
    showNotification(`Submission #${id} rejected and removed from review desk. Submitter status updated to "Rejected".`, 'info');
  }, [ceoUser.name, onRefreshData, selectedSubmission?.id, showNotification, submissions, submissionToReject, branding.companyName, vipUsers]);

  // Certify Submission
  const handleCertify = useCallback((sub: FormSubmission) => {
    certifySubmission(sub.id);
    sendSubmissionStatusEmail({
      email: sub.userEmail,
      userName: sub.userName,
      submissionId: sub.id,
      formTitle: sub.formTitle,
      status: 'Approved',
      statusNotes: `Official Executive Certification conferred by CEO Arnav Singh. Verification QR Code active.`,
      companyName: branding.companyName,
      isCeo: true,
      isVip: sub.isVipSubmission || vipUsers.includes(sub.userId || ''),
    }).catch((e) => console.warn('Email dispatch warning:', e));

    onRefreshData();
    showNotification(`Filing #${sub.id} officially CEO-Certified!`, 'success');
    setPdfCertificateSubmission(sub);
  }, [onRefreshData, showNotification, branding.companyName, vipUsers]);

  // Toggle Emergency Intake Freeze
  const handleToggleFreeze = useCallback(() => {
    const nextState = !isEmergencyFreeze;
    setIsEmergencyFreeze(nextState);
    localStorage.setItem('company_ceo_emergency_freeze', nextState ? 'true' : 'false');
    if (nextState) {
      showNotification('EMERGENCY LOCKDOWN ACTIVATED: Public filings are now frozen portal-wide.', 'error');
    } else {
      showNotification('Emergency freeze lifted: Intake operations fully restored.', 'success');
    }
  }, [isEmergencyFreeze, showNotification]);

  // Toggle User VIP Status
  const handleToggleVip = useCallback((userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      toggleUserVipStatus(targetUser);
    }
    let updated: string[];
    if (vipUsers.includes(userId)) {
      updated = vipUsers.filter((id) => id !== userId);
      showNotification('User removed from VIP Strategic Watchlist.', 'info');
    } else {
      updated = [...vipUsers, userId];
      showNotification('User designated as VIP Strategic Account with Direct CEO Routing!', 'success');
    }
    setVipUsers(updated);
    localStorage.setItem('company_ceo_vip_users_v1', JSON.stringify(updated));
    onRefreshData();
  }, [onRefreshData, showNotification, users, vipUsers]);

  // Update User Quota Limit
  const handleUpdateQuota = useCallback((userId: string, limit: number) => {
    const targetUser = users.find((u) => u.id === userId);
    setUserSubmissionLimit(userId, limit);
    onRefreshData();
    showNotification(`Filing quota set to ${limit} for ${targetUser?.name || 'user'}.`, 'success');
  }, [onRefreshData, showNotification, users]);

  // Ban User or Admin Account
  const handleBanUser = useCallback((userId: string, durationMinutes: number, reason: string) => {
    const targetUser = users.find((u) => u.id === userId);
    banUser(userId, durationMinutes, reason);
    onRefreshData();
    const roleLabel = targetUser?.role === 'admin' ? 'Admin' : 'User';
    const nameLabel = targetUser?.name || 'Account';
    showNotification(`${roleLabel} account (${nameLabel}) suspended for ${durationMinutes} min.`, 'error');
  }, [onRefreshData, showNotification, users]);

  // Unban User or Admin Account
  const handleUnbanUser = useCallback((userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    unbanUser(userId);
    onRefreshData();
    const roleLabel = targetUser?.role === 'admin' ? 'Admin' : 'User';
    const nameLabel = targetUser?.name || 'Account';
    showNotification(`${roleLabel} account (${nameLabel}) suspension lifted successfully.`, 'success');
  }, [onRefreshData, showNotification, users]);

  // Delete User
  const handleDeleteUser = useCallback((userId: string) => {
    deleteUserAccount(userId);
    deleteUserFromFirestore(userId).catch(() => {});
    onRefreshData();
    showNotification('User account permanently deleted.', 'info');
  }, [onRefreshData, showNotification]);

  // Save Governance & Branding
  const handleSaveGovernance = useCallback(async (updated: CompanyBranding) => {
    // 1. Instantly update local state and storage for zero-latency UI
    saveCompanyBranding(updated);
    onUpdateBranding(updated);
    
    // 2. Perform cloud synchronization in the background to avoid "stuck on syncing" UI
    // We don't await this so the caller (UI) can finish immediately
    syncBrandingToFirestore(updated)
      .then(() => {
        showNotification('Company Governance directives synchronized live!', 'success');
      })
      .catch((err) => {
        console.warn('Background sync failed:', err);
        showNotification('Settings saved locally. Cloud sync pending connection.', 'info');
      });
      
    return Promise.resolve(); // Return instantly to satisfy any awaiters
  }, [onUpdateBranding, showNotification]);

  // Publish Corporate Announcement
  const handlePublishNotice = useCallback((noticeData: {
    title: string;
    body: string;
    type: 'gold' | 'urgent' | 'info' | 'amber';
    expiry: '24h' | '7d' | 'permanent';
  }) => {
    const notice = {
      id: `notice_${Date.now()}`,
      title: noticeData.title,
      body: noticeData.body,
      type: noticeData.type,
      createdAt: new Date().toISOString(),
      author: ceoUser.name || 'Arnav Singh (CEO)',
      expiry: noticeData.expiry,
    };
    localStorage.setItem('company_ceo_broadcast_notice_v1', JSON.stringify(notice));
    setActiveBroadcastNotice(notice);
    showNotification('CEO Executive Broadcast published portal-wide!', 'success');
  }, [ceoUser.name, showNotification]);

  // Clear Notice
  const handleClearNotice = useCallback(() => {
    localStorage.removeItem('company_ceo_broadcast_notice_v1');
    setActiveBroadcastNotice(null);
    showNotification('Active broadcast cleared.', 'info');
  }, [showNotification]);

  // Create Admin
  const handleCreateAdmin = useCallback((
    name: string,
    email: string,
    username: string,
    pass: string,
    controlLevel: 'half' | 'full'
  ) => {
    const res = createAdminAccount(name, email, username, pass, controlLevel);
    if (res.success) {
      onRefreshData();
      showNotification(`Administrator account "${name}" created with ${controlLevel} control!`, 'success');
      return true;
    } else {
      showNotification(res.error || 'Failed to create administrator account', 'error');
      return false;
    }
  }, [onRefreshData, showNotification]);

  // Update Admin Control
  const handleUpdateAdminControl = useCallback((userId: string, controlLevel: 'half' | 'full') => {
    updateAdminControlLevel(userId, controlLevel);
    onRefreshData();
    showNotification(`Admin control scope updated to ${controlLevel.toUpperCase()}.`, 'success');
  }, [onRefreshData, showNotification]);

  // Export Executive Briefing Digest
  const handleExportBriefing = useCallback(() => {
    const digest = {
      generatedAt: new Date().toISOString(),
      chiefExecutive: ceoUser.name || 'Arnav Singh',
      organization: branding.companyName || 'ANTHONY INDIA',
      metrics: {
        totalSubmissions: submissions.length,
        approved: submissions.filter((s) => s.status === 'Approved').length,
        pendingReview: pendingCount,
        registeredUsers: users.length,
        vipClientsCount: vipUsers.length,
      },
      filings: submissions.map((s) => ({
        id: s.id,
        user: s.userName,
        email: s.userEmail,
        form: s.formTitle,
        category: s.templateId,
        status: s.status,
        submittedAt: s.submittedAt,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(digest, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `executive_briefing_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    showNotification('Executive briefing report downloaded successfully.', 'success');
  }, [branding.companyName, ceoUser.name, pendingCount, showNotification, submissions, users.length, vipUsers.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification Bar */}
      <FloatingToast toast={notification} onClose={() => setNotification(null)} />

      {/* Navigation Header */}
      <CEONavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ceoUser={ceoUser}
        branding={branding}
        pendingCount={pendingCount}
        vipPendingCount={vipPendingCount}
        isEmergencyFreeze={isEmergencyFreeze}
        onRefreshData={onRefreshData}
        onLogout={onLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <CEOOverviewTab
            ceoUser={ceoUser}
            submissions={activeSubmissions}
            users={users}
            activityLogs={activityLogs}
            vipUserIds={vipUsers}
            isEmergencyFreeze={isEmergencyFreeze}
            onNavigateTab={setActiveTab}
            onSelectSubmission={setSelectedSubmission}
            onQuickApprove={handleQuickApprove}
            onOpenRejectModal={setSubmissionToReject}
            onToggleFreeze={handleToggleFreeze}
            onExportReport={handleExportBriefing}
          />
        )}

        {activeTab === 'queue' && (
          <CEOQueueTab
            submissions={activeSubmissions}
            vipUserIds={vipUsers}
            onSelectSubmission={setSelectedSubmission}
            onQuickApprove={handleQuickApprove}
            onOpenRejectModal={setSubmissionToReject}
            onCertifySubmission={handleCertify}
            onOpenPdfCertificate={setPdfCertificateSubmission}
          />
        )}

        {activeTab === 'company_governance' && (
          <CEOGovernanceTab
            branding={branding}
            onSaveGovernance={handleSaveGovernance}
          />
        )}

        {activeTab === 'user_quotas' && (
          <CEOUsersTab
            users={users}
            vipUserIds={vipUsers}
            onToggleVipUser={handleToggleVip}
            onUpdateUserQuota={handleUpdateQuota}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'announcements' && (
          <CEOAnnouncementsTab
            ceoUser={ceoUser}
            activeNotice={activeBroadcastNotice}
            isEmergencyFreeze={isEmergencyFreeze}
            onPublishNotice={handlePublishNotice}
            onClearNotice={handleClearNotice}
            onToggleEmergencyFreeze={handleToggleFreeze}
          />
        )}

        {activeTab === 'analytics' && (
          <CEOAnalyticsTab
            submissions={submissions}
            users={users}
            vipUserIds={vipUsers}
            onExportReport={handleExportBriefing}
          />
        )}

        {activeTab === 'activity' && (
          <CEOAuditLogsTab
            activityLogs={activityLogs}
            onRefresh={onRefreshData}
          />
        )}

        {activeTab === 'admin' && (
          <CEOAdminManagementTab
            admins={adminUsers}
            onCreateAdmin={handleCreateAdmin}
            onUpdateAdminControl={handleUpdateAdminControl}
            onDeleteAdmin={handleDeleteUser}
            onBanAdmin={(id) => handleBanUser(id, 1440, 'CEO Administrative Action')}
            onUnbanAdmin={handleUnbanUser}
          />
        )}

        {activeTab === 'form_management' && (
          <CEOFormManagementTab
            templates={templates}
            onSaveTemplate={(tpl) => {
              saveTemplate(tpl);
              onRefreshData();
              showNotification(`Form Blueprint Scheme "${tpl.title}" saved!`, 'success');
            }}
            onDeleteTemplate={(id) => {
              deleteTemplate(id);
              onRefreshData();
              showNotification('Form Blueprint Scheme removed from portal.', 'info');
            }}
          />
        )}
      </main>

      {/* Submission Inspector Drawer/Modal */}
      {selectedSubmission && (
        <CEOSubmissionModal
          submission={selectedSubmission}
          branding={branding}
          isVip={
            selectedSubmission.isVipSubmission ||
            vipUsers.includes(selectedSubmission.userId || '')
          }
          onClose={() => setSelectedSubmission(null)}
          onApprove={handleQuickApprove}
          onOpenReject={setSubmissionToReject}
          onOpenPdf={setPdfCertificateSubmission}
        />
      )}

      {/* Rejection Modal */}
      {submissionToReject && (
        <CEORejectModal
          submission={submissionToReject}
          onClose={() => setSubmissionToReject(null)}
          onConfirmReject={handleConfirmReject}
        />
      )}

      {/* Executive PDF Certificate Modal (with Stamp & Arnav Singh signature) */}
      {pdfCertificateSubmission && (
        <ExecutiveCertificateModal
          submission={pdfCertificateSubmission}
          branding={branding}
          onClose={() => setPdfCertificateSubmission(null)}
        />
      )}

      {/* Modern Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-5 px-6 text-center text-xs text-slate-500">
        Authenticated CEO Executive Session •{' '}
        <span className="text-amber-400 font-semibold">{ceoUser.name || 'Arnav Singh'}</span> •{' '}
        {branding.companyName || 'ANTHONY INDIA'} Command Architecture
      </footer>
    </div>
  );
};
