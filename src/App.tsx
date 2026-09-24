/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FormSubmission, CompanyBranding, UserAccount, ActivityLog, FormTemplate } from './types';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CEODashboard } from './components/CEODashboard';
import { LoginFirstGate } from './components/LoginFirstGate';
import { SuspendedAccountNotice } from './components/SuspendedAccountNotice';
import { CertificateVerificationModal } from './components/CertificateVerificationModal';
import { ExecutiveCertificateModal } from './components/ExecutiveCertificateModal';
import { UserHomeView } from './components/UserHomeView';
import { UserAccountView } from './components/UserAccountView';
import { SupportView } from './components/SupportView';
import { FloatingToast, ToastMessage } from './components/common/FloatingToast';
import {
  getCompanyBranding,
  saveCompanyBranding,
  loadSubmissions,
  loadUsers,
  loadTemplates,
  getCurrentUser,
  logoutUser,
  getUserSubmission,
  isUserBanned,
  loadActivityLogsLocally,
} from './utils/storage';
import {
  initFirestoreSync,
  sendUserPresenceHeartbeat
} from './services/firestoreService';

export default function App() {
  const [branding, setBranding] = useState<CompanyBranding>(getCompanyBranding());
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>(loadTemplates());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(loadActivityLogsLocally());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [publicVerificationSub, setPublicVerificationSub] = useState<FormSubmission | null | undefined>(undefined);
  const [activeCertModalSub, setActiveCertModalSub] = useState<FormSubmission | null>(null);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  // Global toast listener
  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        setActiveToast(e.detail);
      }
    };
    window.addEventListener('app-notification', handleToast);
    return () => window.removeEventListener('app-notification', handleToast);
  }, []);

  // Check URL query parameters for public QR code verification (?verify=SUB_ID or ?cert=CERT_NUM)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyId = urlParams.get('verify') || urlParams.get('cert');
      if (verifyId) {
        const all = loadSubmissions();
        const found = all.find(
          (s) =>
            s.id.toLowerCase() === verifyId.toLowerCase() ||
            `#${s.id.toLowerCase()}` === verifyId.toLowerCase() ||
            `cert-${s.id.toLowerCase()}` === verifyId.toLowerCase() ||
            (s.certificateSerialNumber && s.certificateSerialNumber.toLowerCase() === verifyId.toLowerCase())
        );
        if (found) {
          setPublicVerificationSub(found);
        } else {
          setPublicVerificationSub(null);
        }
      }
    } catch (e) {
      console.error('Failed to parse verification URL params:', e);
    }
  }, []);

  // Load initial state on mount and hook up cloud firestore synchronization
  useEffect(() => {
    // Initial load from local storage for instant UI
    const initialSubmissions = loadSubmissions();
    const initialUsers = loadUsers();
    const initialTemplates = loadTemplates();
    const initialLogs = loadActivityLogsLocally();
    const initialBranding = getCompanyBranding();
    const initialUser = getCurrentUser();

    setSubmissions(initialSubmissions);
    setUsers(initialUsers);
    setTemplates(initialTemplates);
    setActivityLogs(initialLogs);
    setBranding(initialBranding);
    setCurrentUser(initialUser);

    const unsubscribe = initFirestoreSync({
      onUsersUpdate: (cloudUsers) => {
        setUsers(cloudUsers);
        const active = getCurrentUser();
        if (active) {
          const fresh = cloudUsers.find(u => u.id === active.id);
          if (fresh) {
            setCurrentUser(fresh);
          } else if (active.role !== 'admin' && active.role !== 'ceo' && active.username !== 'aasnc' && active.username !== 'ceo') {
            logoutUser();
            setCurrentUser(null);
          }
        }
      },
      onSubmissionsUpdate: (cloudSubs) => {
        setSubmissions(cloudSubs);
      },
      onTemplatesUpdate: (cloudTemplates) => {
        setTemplates(cloudTemplates);
      },
      onBrandingUpdate: (cloudBranding) => {
        setBranding(cloudBranding);
      },
      onActivitiesUpdate: (cloudLogs) => {
        setActivityLogs(cloudLogs);
      },
    });

    return () => unsubscribe();
  }, []);

  // Periodic heartbeat to broadcast live presence across all connected devices
  useEffect(() => {
    if (!currentUser) return;

    // Send immediate heartbeat on session start
    sendUserPresenceHeartbeat(currentUser.id, true);

    const interval = setInterval(() => {
      sendUserPresenceHeartbeat(currentUser.id, true);
    }, 25000); // every 25s

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const refreshAllData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setBranding(getCompanyBranding());
  };

  const handleBrandingSave = (newBranding: CompanyBranding) => {
    setBranding(newBranding);
    saveCompanyBranding(newBranding);
  };

  const handleFormSubmitted = () => {
    refreshAllData();
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    refreshAllData();
  };

  const handleLogout = () => {
    if (currentUser) {
      sendUserPresenceHeartbeat(currentUser.id, false);
    }
    logoutUser();
    setCurrentUser(null);
    refreshAllData();
  };

  // Lookup active user's single submission if logged in
  const userSubmission = currentUser
    ? getUserSubmission(currentUser.id, currentUser.email)
    : null;

  // 0. PUBLIC VERIFICATION PORTAL OVERLAY (Accessible to anyone verifying via QR code or direct URL)
  const renderVerificationModals = () => (
    <>
      {publicVerificationSub !== undefined && (
        <CertificateVerificationModal
          submission={publicVerificationSub}
          allSubmissions={submissions}
          branding={branding}
          onClose={() => {
            setPublicVerificationSub(undefined);
            const url = new URL(window.location.href);
            url.searchParams.delete('verify');
            url.searchParams.delete('cert');
            window.history.replaceState({}, '', url.pathname);
          }}
          onOpenCertificateModal={(sub) => setActiveCertModalSub(sub)}
        />
      )}

      {activeCertModalSub && (
        <ExecutiveCertificateModal
          submission={activeCertModalSub}
          branding={branding}
          onClose={() => setActiveCertModalSub(null)}
        />
      )}
    </>
  );

  // 1. GATEWAY: If user is not authenticated, render Login First Gate
  if (!currentUser) {
    return (
      <>
        <LoginFirstGate
          branding={branding}
          onAuthSuccess={handleAuthSuccess}
        />
        {renderVerificationModals()}
      </>
    );
  }

  // Check if authenticated user is CEO or Administrator
  const isCeo = currentUser.role === 'ceo';
  const isAdmin = currentUser.role === 'admin' || currentUser.username === 'aasnc';

  // 1.5 CEO DASHBOARD: Dedicated Executive Command Center for CEO
  if (isCeo) {
    return (
      <>
        <CEODashboard
          ceoUser={currentUser}
          submissions={submissions}
          users={users}
          templates={templates}
          branding={branding}
          activityLogs={activityLogs}
          onRefreshData={refreshAllData}
          onUpdateBranding={handleBrandingSave}
          onLogout={handleLogout}
        />
        {renderVerificationModals()}
      </>
    );
  }

  // 2. ADMIN DASHBOARD: Dedicated purely to administration, metrics, submissions, and user accounts
  // Strictly NO form filling.
  if (isAdmin) {
    return (
      <>
        <AdminDashboard
          adminUser={currentUser}
          submissions={submissions}
          users={users}
          templates={templates}
          branding={branding}
          activityLogs={activityLogs}
          onRefreshData={refreshAllData}
          onUpdateBranding={handleBrandingSave}
          onLogout={handleLogout}
        />
        {renderVerificationModals()}
      </>
    );
  }

  // 2.5 SUSPENSION GATE: If standard user is banned/suspended by timer
  const banStatus = isUserBanned(currentUser);
  if (banStatus.banned) {
    return (
      <>
        <SuspendedAccountNotice
          currentUser={currentUser}
          branding={branding}
          onLogout={handleLogout}
          onRefresh={refreshAllData}
        />
        {renderVerificationModals()}
      </>
    );
  }

  // 3. USER DASHBOARD: Dedicated to user form filling, receipts, and personal submission tracking
  // Strictly NO admin panel at top or anywhere else.
  return (
    <>
      <UserDashboard
        currentUser={currentUser}
        branding={branding}
        templates={templates}
        userSubmission={userSubmission}
        onFormSubmitted={handleFormSubmitted}
        onLogout={handleLogout}
        refreshAllData={refreshAllData}
      />
      {renderVerificationModals()}
      <FloatingToast toast={activeToast} onClose={() => setActiveToast(null)} />
    </>
  );
}
