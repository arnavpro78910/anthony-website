import { FormSubmission, CompanyBranding, UserAccount, ActivityLog, FormTemplate } from '../types';
import { DEFAULT_BRANDING, FORM_TEMPLATES } from '../data/templates';

export interface FirestoreCallbacks {
  syncUserToFirestore?: (user: UserAccount) => Promise<void>;
  deleteUserFromFirestore?: (userId: string) => Promise<void>;
  syncSubmissionToFirestore?: (submission: FormSubmission) => Promise<void>;
  deleteSubmissionFromFirestore?: (submissionId: string) => Promise<void>;
  syncBrandingToFirestore?: (branding: CompanyBranding) => Promise<void>;
  syncTemplateToFirestore?: (template: FormTemplate) => Promise<void>;
  deleteTemplateFromFirestore?: (templateId: string) => Promise<void>;
  recordLiveActivity?: (type: any, user: { id: string; name: string; email: string }, details: string, meta?: any) => Promise<any>;
  sendUserPresenceHeartbeat?: (userId: string, isOnline: boolean, lastAction?: string) => Promise<void>;
}

const firestoreRegistry: FirestoreCallbacks = {};

export function registerFirestoreCallbacks(callbacks: FirestoreCallbacks) {
  Object.assign(firestoreRegistry, callbacks);
}

const ACTIVITY_LOGS_KEY = 'company_portal_activity_logs_v1';

export function loadActivityLogsLocally(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveActivityLogsLocally(logs: ActivityLog[]): void {
  try {
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to save activity logs locally', e);
  }
}

export function syncTemplateToFirestore(template: FormTemplate): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.syncTemplateToFirestore) {
    const promise = firestoreRegistry.syncTemplateToFirestore(template);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function deleteTemplateFromFirestore(templateId: string): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.deleteTemplateFromFirestore) {
    const promise = firestoreRegistry.deleteTemplateFromFirestore(templateId);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function getCustomSmtpFromStorage(): any {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('company_custom_smtp_settings') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.enabled) {
        return parsed;
      }
    }
  } catch {}
  return undefined;
}

export function syncUserToFirestore(user: UserAccount): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.syncUserToFirestore) {
    const promise = firestoreRegistry.syncUserToFirestore(user);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function deleteUserFromFirestore(userId: string): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.deleteUserFromFirestore) {
    const promise = firestoreRegistry.deleteUserFromFirestore(userId);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function syncSubmissionToFirestore(submission: FormSubmission): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.syncSubmissionToFirestore) {
    const promise = firestoreRegistry.syncSubmissionToFirestore(submission);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function deleteSubmissionFromFirestore(submissionId: string): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.deleteSubmissionFromFirestore) {
    const promise = firestoreRegistry.deleteSubmissionFromFirestore(submissionId);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function syncBrandingToFirestore(branding: CompanyBranding): { catch: (cb: (err?: any) => void) => void } {
  if (firestoreRegistry.syncBrandingToFirestore) {
    const promise = firestoreRegistry.syncBrandingToFirestore(branding);
    return {
      catch: (cb: (err?: any) => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function recordLiveActivity(
  type: any,
  user: { id: string; name: string; email: string },
  details: string,
  meta?: any
): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.recordLiveActivity) {
    const promise = firestoreRegistry.recordLiveActivity(type, user, details, meta);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

export function sendUserPresenceHeartbeat(
  userId: string,
  isOnline: boolean,
  lastAction?: string
): { catch: (cb: () => void) => void } {
  if (firestoreRegistry.sendUserPresenceHeartbeat) {
    const promise = firestoreRegistry.sendUserPresenceHeartbeat(userId, isOnline, lastAction);
    return {
      catch: (cb: () => void) => { promise.catch(cb); }
    };
  }
  return { catch: () => {} };
}

/**
 * Detect client device, browser, and OS for detailed real-time telemetry
 */
export function detectClientDevice(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Desktop • Browser';
  }
  const ua = navigator.userAgent;
  let deviceType = 'Desktop';
  if (/mobile/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/ipad|tablet/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/.test(ua))) {
    deviceType = 'Tablet';
  }

  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  let os = 'OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return `${deviceType} • ${browser} (${os})`;
}

const SUBMISSIONS_KEY = 'company_portal_submissions_v4';
const USERS_KEY = 'company_portal_users_v6';
const CURRENT_USER_KEY = 'company_portal_current_user_v4';
const DRAFT_PREFIX = 'company_portal_draft_';
const BRANDING_KEY = 'company_portal_branding_v2';
const LAST_EMAIL_NOTICE_KEY = 'company_portal_last_email_notice_v2';
const GOOGLE_SAVED_ACCOUNTS_KEY = 'company_portal_saved_google_accounts_v3';
const DELETED_USERS_KEY = 'company_portal_deleted_users_v4';
const DELETED_SUBMISSIONS_KEY = 'company_portal_deleted_submissions_v3';
const TEMPLATES_KEY = 'company_portal_templates_v3';
const DELETED_TEMPLATES_KEY = 'company_portal_deleted_templates_v3';

export function getDeletedSubmissionIdentifiers(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function recordDeletedSubmissionIdentifier(id: string): void {
  try {
    if (!id || typeof id !== 'string') return;
    const existing = getDeletedSubmissionIdentifiers();
    if (!existing.includes(id)) {
      localStorage.setItem(DELETED_SUBMISSIONS_KEY, JSON.stringify([...existing, id]));
    }
  } catch (e) {
    console.error('Failed to record deleted submission identifier', e);
  }
}

export function clearDeletedSubmissionIdentifier(id: string): void {
  try {
    if (!id || typeof id !== 'string') return;
    const existing = getDeletedSubmissionIdentifiers();
    localStorage.setItem(DELETED_SUBMISSIONS_KEY, JSON.stringify(existing.filter(x => x !== id)));
  } catch (e) {
    console.error('Failed to clear deleted submission identifier', e);
  }
}

export function getDeletedTemplateIdentifiers(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function recordDeletedTemplateIdentifier(id: string): void {
  try {
    if (!id || typeof id !== 'string') return;
    const existing = getDeletedTemplateIdentifiers();
    if (!existing.includes(id)) {
      localStorage.setItem(DELETED_TEMPLATES_KEY, JSON.stringify([...existing, id]));
    }
  } catch (e) {
    console.error('Failed to record deleted template identifier', e);
  }
}

export function clearDeletedTemplateIdentifier(id: string): void {
  try {
    if (!id || typeof id !== 'string') return;
    const existing = getDeletedTemplateIdentifiers();
    localStorage.setItem(DELETED_TEMPLATES_KEY, JSON.stringify(existing.filter(x => x !== id)));
  } catch (e) {
    console.error('Failed to clear deleted template identifier', e);
  }
}

export function loadTemplates(): FormTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const deleted = getDeletedTemplateIdentifiers();
        return parsed.filter(t => t && t.id && !deleted.includes(t.id));
      }
    }
    // Initialize default templates if storage is empty
    const deleted = getDeletedTemplateIdentifiers();
    const defaults = FORM_TEMPLATES.filter(t => !deleted.includes(t.id));
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    console.error('Failed to load templates', e);
    return FORM_TEMPLATES;
  }
}

export function saveTemplatesLocally(templates: FormTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates locally', e);
  }
}

export function saveTemplates(templates: FormTemplate[]): void {
  saveTemplatesLocally(templates);
  for (const t of templates) {
    syncTemplateToFirestore(t).catch(() => {});
  }
}

export function saveTemplate(template: FormTemplate): FormTemplate[] {
  try {
    const existing = loadTemplates();
    clearDeletedTemplateIdentifier(template.id);
    const index = existing.findIndex(t => t.id === template.id);
    let updated: FormTemplate[];
    const now = new Date().toISOString();
    const enrichedTemplate: FormTemplate = {
      ...template,
      updatedAt: now,
      createdAt: template.createdAt || now,
    };
    if (index >= 0) {
      updated = existing.map((t, idx) => (idx === index ? enrichedTemplate : t));
    } else {
      updated = [...existing, enrichedTemplate];
    }
    saveTemplatesLocally(updated);
    syncTemplateToFirestore(enrichedTemplate).catch(() => {});
    return updated;
  } catch (e) {
    console.error('Failed to save template', e);
    return loadTemplates();
  }
}

export function deleteTemplate(templateId: string): FormTemplate[] {
  try {
    recordDeletedTemplateIdentifier(templateId);
    const existing = loadTemplates();
    const updated = existing.filter(t => t.id !== templateId);
    saveTemplatesLocally(updated);
    deleteTemplateFromFirestore(templateId).catch(() => {});
    return updated;
  } catch (e) {
    console.error('Failed to delete template', e);
    return loadTemplates();
  }
}

export function resetTemplatesToDefault(): FormTemplate[] {
  try {
    localStorage.removeItem(DELETED_TEMPLATES_KEY);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(FORM_TEMPLATES));
    for (const t of FORM_TEMPLATES) {
      syncTemplateToFirestore(t).catch(() => {});
    }
    return FORM_TEMPLATES;
  } catch (e) {
    console.error('Failed to reset templates to default', e);
    return FORM_TEMPLATES;
  }
}

export function getDeletedUserIdentifiers(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(x => x.trim().toLowerCase());
  } catch {
    return [];
  }
}

export function recordDeletedUserIdentifier(idOrEmailOrUser?: string): void {
  try {
    if (!idOrEmailOrUser || typeof idOrEmailOrUser !== 'string') return;
    const norm = idOrEmailOrUser.trim().toLowerCase();
    if (!norm) return;
    const existing = getDeletedUserIdentifiers();
    if (!existing.includes(norm)) {
      const updated = [...existing, norm];
      localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to record deleted user identifier', e);
  }
}

export function clearDeletedUserIdentifier(idOrEmailOrUser?: string): void {
  try {
    if (!idOrEmailOrUser || typeof idOrEmailOrUser !== 'string') return;
    const norm = idOrEmailOrUser.trim().toLowerCase();
    if (!norm) return;
    const existing = getDeletedUserIdentifiers();
    const updated = existing.filter(x => x !== norm);
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to clear deleted user identifier', e);
  }
}

/**
 * Check if a user is currently online/active in real-time
 * Considers online flag and heartbeat within 3 minutes (180,000ms)
 */
export function isUserOnline(user: UserAccount): boolean {
  if (!user.isOnline) return false;
  if (!user.lastActiveAt) return false;
  return (Date.now() - user.lastActiveAt) < 180000;
}

export interface GoogleSavedAccount {
  name: string;
  email: string;
  avatarUrl?: string;
  accountType?: 'Personal' | 'Workspace' | 'Developer';
  isSignedIn?: boolean;
  lastUsed?: number;
}

export function loadGoogleSavedAccounts(_preferredEmail?: string): GoogleSavedAccount[] {
  const deleted = getDeletedUserIdentifiers();

  try {
    const raw = localStorage.getItem(GOOGLE_SAVED_ACCOUNTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: GoogleSavedAccount[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out deleted users AND legacy mock accounts
    const filtered = parsed.filter(
      (a) =>
        a &&
        a.email &&
        typeof a.email === 'string' &&
        !deleted.includes(a.email.trim().toLowerCase()) &&
        a.email.toLowerCase() !== 'arnav.work@gmail.com' &&
        a.email.toLowerCase() !== 'arnav.dev@gmail.com'
    );

    return filtered;
  } catch {
    return [];
  }
}

export function saveGoogleSavedAccount(account: GoogleSavedAccount): GoogleSavedAccount[] {
  try {
    const accounts = loadGoogleSavedAccounts(account.email);
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase());
    let updated: GoogleSavedAccount[];
    if (existingIndex >= 0) {
      updated = accounts.map((a, i) =>
        i === existingIndex ? { ...a, ...account, lastUsed: Date.now(), isSignedIn: true } : a
      );
    } else {
      updated = [{ ...account, lastUsed: Date.now(), isSignedIn: true }, ...accounts];
    }
    localStorage.setItem(GOOGLE_SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save Google account', e);
    return [];
  }
}

export function removeGoogleSavedAccount(email: string): GoogleSavedAccount[] {
  try {
    const accounts = loadGoogleSavedAccounts();
    const updated = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(GOOGLE_SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export interface DispatchedEmailNotice {
  to: string;
  code: string;
  timestamp: number;
  subject: string;
}

export function getLastDispatchedEmailNotice(): DispatchedEmailNotice | null {
  try {
    const raw = localStorage.getItem(LAST_EMAIL_NOTICE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function recordDispatchedEmailNotice(to: string, code: string): void {
  try {
    const notice: DispatchedEmailNotice = {
      to,
      code,
      timestamp: Date.now(),
      subject: `Your Security Verification Code: ${code}`,
    };
    localStorage.setItem(LAST_EMAIL_NOTICE_KEY, JSON.stringify(notice));
  } catch (e) {
    console.error('Failed to save email notice', e);
  }
}

// Default designated Admin account: Username = aasnc, Password = 9559
export const ADMIN_USER_ACCOUNT: UserAccount = {
  id: 'usr_admin_master',
  username: 'admin1',
  email: 'admin@company.com',
  name: 'Corporate Administrator',
  password: '101010',
  role: 'admin',
  authProvider: 'email',
  emailVerified: true,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  hasSubmitted: false,
};

// Default designated CEO Executive account: Username = Arnav, Password = 22122
export const CEO_USER_ACCOUNT: UserAccount = {
  id: 'usr_ceo_master',
  username: 'Arnav',
  email: 'ceo@anthonyindia.com',
  name: 'Arnav Sharma',
  password: '22122',
  role: 'ceo',
  authProvider: 'email',
  emailVerified: true,
  createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  hasSubmitted: false,
};

// Preset sample user accounts for quick testing
export const INITIAL_USERS: UserAccount[] = [
  CEO_USER_ACCOUNT,
  ADMIN_USER_ACCOUNT,
  {
    id: 'usr_demo_1',
    username: 'alexwright',
    name: 'Alexander Wright',
    email: 'alex.wright@example.com',
    password: 'password123',
    role: 'user',
    authProvider: 'email',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    hasSubmitted: true,
    submittedFormId: 'INQ-2026-8812',
  },
  {
    id: 'usr_demo_2',
    username: 'sophiam',
    name: 'Sophia Martinez',
    email: 'sophia.martinez@example.com',
    password: 'password123',
    role: 'user',
    authProvider: 'email',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    hasSubmitted: false,
  },
];

export const INITIAL_SUBMISSION: FormSubmission = {
  id: 'INQ-2026-8812',
  userId: 'usr_demo_1',
  userEmail: 'alex.wright@example.com',
  userName: 'Alexander Wright',
  templateId: 'client-inquiry',
  formTitle: 'Client Project & Service Inquiry',
  submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  status: 'Under Evaluation',
  statusNotes: 'Initial requirements verified by Solutions Architecture team. Scheduling technical discovery call for next Tuesday.',
  data: {
    clientName: 'Alexander Wright',
    companyName: 'AeroSphere Global Innovations',
    workEmail: 'alex.wright@example.com',
    phoneNumber: '+1 (555) 942-0193',
    serviceType: 'cloud-devops',
    projectObjectives: 'Migrating monolithic core billing workloads to multi-region Kubernetes clusters with zero downtime deployment pipelines.',
    budgetRange: '75k-150k',
    targetLaunchDate: '2026-11-15',
    ndaRequired: true,
    projectBriefFile: {
      name: 'AeroSphere_Cloud_Modernization_RFP.pdf',
      size: 3120000,
      type: 'application/pdf',
    }
  },
  companyName: DEFAULT_BRANDING.companyName,
};

function isValidUser(u: any): u is UserAccount {
  if (!u || typeof u !== 'object') return false;
  const uId = u.id && typeof u.id === 'string' ? u.id.trim() : (u.id ? String(u.id).trim() : '');
  const uEmail = u.email && typeof u.email === 'string' ? u.email.trim() : (u.email ? String(u.email).trim() : '');
  const uUsername = u.username && typeof u.username === 'string' ? u.username.trim() : (u.username ? String(u.username).trim() : '');

  // Must have at least one valid identifier (id, email, or username)
  return Boolean(uId || uEmail || uUsername);
}

// Users Storage
export function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return INITIAL_USERS.filter(isValidUser);
      }
      const active = parsed.filter(isValidUser);

      // Ensure the master admin account with username aasnc and password 9559 is always intact
      /*
      const hasAdmin = active.some(
        u => u && (u.username === 'aasnc' || u.email === 'admin@company.com') && u.role === 'admin'
      );
      if (!hasAdmin) {
        const withAdmin = [ADMIN_USER_ACCOUNT, ...active];
        saveUsersLocally(withAdmin);
        return withAdmin;
      }
      */
      if (active.length !== parsed.length) {
        saveUsersLocally(active);
      }
      return active;
    }
    // initialize defaults
    const filteredInitial = INITIAL_USERS.filter(isValidUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredInitial));
    return filteredInitial;
  } catch (e) {
    console.error('Failed to load users', e);
    return INITIAL_USERS.filter(isValidUser);
  }
}

/**
 * Save users strictly to local storage without triggering cloud sync (used for incoming Firestore snapshots).
 */
export function saveUsersLocally(users: UserAccount[]): void {
  try {
    if (!Array.isArray(users)) return;
    const activeIncoming = users.filter(isValidUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(activeIncoming));
  } catch (e) {
    console.error('Failed to save users locally', e);
  }
}

/**
 * Save users locally and sync a specific user (or list) to Firestore without looping all users.
 */
export function saveUsers(users: UserAccount[], userToSync?: UserAccount): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    if (userToSync) {
      syncUserToFirestore(userToSync).catch(() => {});
    }
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      // Sync with latest data in users list in case of state updates
      const allUsers = loadUsers();
      const updated = allUsers.find(u => u.id === user.id);
      return updated || user;
    }
  } catch (e) {
    console.error('Failed to get current user', e);
  }
  return null;
}

export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}

export function getUserByEmail(email: string): UserAccount | null {
  try {
    if (!email) return null;
    const users = loadUsers();
    const normalized = email.trim().toLowerCase();
    return users.find((u) => u.email && u.email.toLowerCase() === normalized) || null;
  } catch {
    return null;
  }
}

export function registerUser(
  name: string,
  email: string,
  password?: string,
  username?: string
): {
  success: boolean;
  user?: UserAccount;
  requiresVerification?: boolean;
  verificationCode?: string;
  error?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUser = username ? username.trim().toLowerCase() : '';

  // Clear any previous deletion flags when registering a brand new user account
  clearDeletedUserIdentifier(normalizedEmail);
  if (normalizedUser) clearDeletedUserIdentifier(normalizedUser);

  const users = loadUsers();
  
  const existing = users.find(
    u => (u.email && u.email.trim().toLowerCase() === normalizedEmail) || (normalizedUser && u.username && u.username.trim().toLowerCase() === normalizedUser)
  );
  if (existing) {
    return {
      success: false,
      error: 'An account with this email address already exists. You cannot create a new account or log in via Create Account. Please switch to the Sign In tab to log in.',
    };
  }

  // Generate 6-digit security code for email verification
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    username: username ? username.trim() : email.split('@')[0],
    name: name.trim(),
    email: normalizedEmail,
    password: password || 'defaultpass',
    role: 'user',
    authProvider: 'email',
    emailVerified: false,
    verificationCode,
    verificationCodeExpires,
    createdAt: nowIso,
    hasSubmitted: false,
    submissionLimit: 1,
    lastLoginAt: undefined,
    lastActiveAt: nowMs,
    isOnline: false,
    lastLoginDevice: currentDevice,
    loginCount: 0,
    lastAction: 'Registered Account',
    lastActionAt: nowIso,
  };

  // Clear any previous deletion flags when registering a brand new user account
  clearDeletedUserIdentifier(normalizedEmail);
  if (normalizedUser) clearDeletedUserIdentifier(normalizedUser);

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers, newUser);
  recordDispatchedEmailNotice(normalizedEmail, verificationCode);
  
  // Real-time activity log for cross-device visibility
  recordLiveActivity(
    'register',
    { id: newUser.id, name: newUser.name, email: newUser.email },
    `New account registered by ${newUser.name} (${newUser.email}) from ${currentDevice}`,
    { authProvider: 'email', device: currentDevice }
  );

  // Email verification is required before access is granted
  return {
    success: true,
    user: newUser,
    requiresVerification: true,
    verificationCode,
  };
}

export function verifyEmailCode(
  email: string,
  code: string
): { success: boolean; user?: UserAccount; error?: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email && u.email.trim().toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Account not found. This account may have been deleted or not registered yet. Please click Change Email / Back and register first.' };
  }

  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  if (user.emailVerified) {
    const activeUser: UserAccount = {
      ...user,
      isOnline: true,
      lastActiveAt: nowMs,
      lastLoginAt: nowIso,
      lastLoginDevice: currentDevice,
      loginCount: (user.loginCount || 0) + 1,
      lastAction: 'Logged In (Email)',
      lastActionAt: nowIso,
    };
    const updatedUsers = users.map(u => (u.id === activeUser.id ? activeUser : u));
    saveUsers(updatedUsers, activeUser);
    setCurrentUser(activeUser);
    recordLiveActivity(
      'login',
      { id: activeUser.id, name: activeUser.name, email: activeUser.email },
      `${activeUser.name} signed in from ${currentDevice}`,
      { authProvider: 'email', device: currentDevice }
    );
    return { success: true, user: activeUser };
  }

  if (!user.verificationCode) {
    return { success: false, error: 'No active verification code found. Please request a new code.' };
  }

  if (user.verificationCodeExpires && Date.now() > user.verificationCodeExpires) {
    return { success: false, error: 'Verification code has expired. Please click Resend Code to receive a new one.' };
  }

  if (user.verificationCode.trim() !== code.trim()) {
    return { success: false, error: 'Invalid verification code. Please check the 6-digit code and try again.' };
  }

  // Verification passed: mark account verified, set online, and update real-time telemetry
  const updatedUser: UserAccount = {
    ...user,
    emailVerified: true,
    verificationCode: undefined,
    verificationCodeExpires: undefined,
    isOnline: true,
    lastActiveAt: nowMs,
    lastLoginAt: nowIso,
    lastLoginDevice: currentDevice,
    loginCount: (user.loginCount || 0) + 1,
    lastAction: 'Verified Email & Logged In',
    lastActionAt: nowIso,
  };

  const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(updatedUsers, updatedUser);
  setCurrentUser(updatedUser);

  recordLiveActivity(
    'login',
    { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    `${updatedUser.name} completed verification and signed in from ${currentDevice}`,
    { authProvider: 'email', device: currentDevice }
  );

  return { success: true, user: updatedUser };
}

export function resendEmailVerificationCode(email: string): { success: boolean; code?: string; error?: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'No account registered with this email address.' };
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 15 * 60 * 1000;

  const updatedUser: UserAccount = {
    ...user,
    verificationCode: newCode,
    verificationCodeExpires: expires,
  };

  const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(updatedUsers, updatedUser);
  recordDispatchedEmailNotice(normalizedEmail, newCode);

  return { success: true, code: newCode };
}

export function generateAccountRecoveryCode(email: string): { success: boolean; code?: string; name?: string; error?: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'No account registered with this email address.' };
  }

  // Check if user or admin account is banned/suspended
  const banStatus = isUserBanned(user);
  if (banStatus.banned) {
    const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
    return {
      success: false,
      error: `ACCOUNT BANNED / SUSPENDED: Your account has been suspended by Administration. Time Remaining: ${timeDisplay}. Reason: ${banStatus.reason}. Recovery is disabled while banned.`,
    };
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 15 * 60 * 1000;

  const updatedUser: UserAccount = {
    ...user,
    recoveryCode: newCode,
    recoveryCodeExpires: expires,
  };

  const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(updatedUsers, updatedUser);
  recordDispatchedEmailNotice(normalizedEmail, newCode);

  return { success: true, code: newCode, name: user.name };
}

export function verifyAccountRecoveryCode(email: string, code: string): { success: boolean; error?: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Account not found.' };
  }

  const banStatus = isUserBanned(user);
  if (banStatus.banned) {
    const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
    return {
      success: false,
      error: `ACCOUNT BANNED / SUSPENDED: Your account is suspended. Time Remaining: ${timeDisplay}. Reason: ${banStatus.reason}. Recovery is blocked.`,
    };
  }

  if (!user.recoveryCode) {
    return { success: false, error: 'No recovery process has been requested for this email.' };
  }

  if (user.recoveryCodeExpires && Date.now() > user.recoveryCodeExpires) {
    return { success: false, error: 'The recovery code has expired. Please request a new one.' };
  }

  if (user.recoveryCode.trim() !== code.trim()) {
    return { success: false, error: 'Invalid recovery code. Please check your email and try again.' };
  }

  return { success: true };
}

export function updateAccountPassword(email: string, newPassword: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Account not found.' };
  }

  const banStatus = isUserBanned(user);
  if (banStatus.banned) {
    const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
    return {
      success: false,
      error: `ACCOUNT BANNED / SUSPENDED: Your account is suspended. Time Remaining: ${timeDisplay}. Reason: ${banStatus.reason}. Password update blocked.`,
    };
  }

  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const updatedUser: UserAccount = {
    ...user,
    password: newPassword,
    recoveryCode: undefined,
    recoveryCodeExpires: undefined,
    emailVerified: true,
    isOnline: true,
    lastActiveAt: nowMs,
    lastLoginAt: nowIso,
    lastLoginDevice: currentDevice,
    loginCount: (user.loginCount || 0) + 1,
    lastAction: 'Recovered Account (Password Updated)',
    lastActionAt: nowIso,
  };

  const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(updatedUsers, updatedUser);
  setCurrentUser(updatedUser);

  recordLiveActivity(
    'login',
    { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    `${updatedUser.name} recovered account and updated password from ${currentDevice}`,
    { authProvider: 'email', device: currentDevice }
  );

  return { success: true, user: updatedUser };
}

export function loginAfterRecoveryWithOldPassword(email: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Account not found.' };
  }

  const banStatus = isUserBanned(user);
  if (banStatus.banned) {
    const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
    return {
      success: false,
      error: `ACCOUNT BANNED / SUSPENDED: Your account is suspended. Time Remaining: ${timeDisplay}. Reason: ${banStatus.reason}. Login blocked.`,
    };
  }

  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const updatedUser: UserAccount = {
    ...user,
    recoveryCode: undefined,
    recoveryCodeExpires: undefined,
    emailVerified: true,
    isOnline: true,
    lastActiveAt: nowMs,
    lastLoginAt: nowIso,
    lastLoginDevice: currentDevice,
    loginCount: (user.loginCount || 0) + 1,
    lastAction: 'Recovered Account (Used Old Password)',
    lastActionAt: nowIso,
  };

  const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(updatedUsers, updatedUser);
  setCurrentUser(updatedUser);

  recordLiveActivity(
    'login',
    { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    `${updatedUser.name} recovered account and logged in with existing password from ${currentDevice}`,
    { authProvider: 'email', device: currentDevice }
  );

  return { success: true, user: updatedUser };
}

export function authenticateWithGoogle(
  profile: {
    name: string;
    email: string;
    avatarUrl?: string;
  },
  mode: 'login' | 'register' = 'login'
): {
  success: boolean;
  user?: UserAccount;
  error?: string;
  isBanned?: boolean;
  bannedInfo?: BanStatus;
} {
  const users = loadUsers();
  const normalizedEmail = profile.email.trim().toLowerCase();
  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  // Clear any lingering deletion flags for this email or username
  clearDeletedUserIdentifier(normalizedEmail);

  let user = users.find(u => u.email && u.email.trim().toLowerCase() === normalizedEmail);

  // If user does not exist (e.g. account was deleted or new user), automatically treat as new account registration via Google
  if (!user && mode === 'login') {
    mode = 'register';
  }

  // Mode: REGISTER - If user already exists, allow seamless sign in
  if (mode === 'register' && user) {
    // Account exists, proceed to login flow below
  }

  if (user) {
    // Check if account is suspended/banned with timer
    const banStatus = isUserBanned(user);
    if (banStatus.banned) {
      const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
      return {
        success: false,
        error: `Account Suspended: ${banStatus.reason}. Duration remaining: ${timeDisplay}.`,
        isBanned: true,
        bannedInfo: banStatus,
      };
    }

    // Google accounts have pre-verified email addresses
    const updatedUser: UserAccount = {
      ...user,
      emailVerified: true,
      authProvider: user.authProvider || 'google',
      avatarUrl: profile.avatarUrl || user.avatarUrl,
      isOnline: true,
      lastActiveAt: nowMs,
      lastLoginAt: nowIso,
      lastLoginDevice: currentDevice,
      loginCount: (user.loginCount || 0) + 1,
      lastAction: 'Logged In (Google)',
      lastActionAt: nowIso,
    };
    const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    saveUsers(updatedUsers, updatedUser);
    saveGoogleSavedAccount({
      name: updatedUser.name,
      email: normalizedEmail,
      avatarUrl: updatedUser.avatarUrl,
      isSignedIn: true,
    });
    setCurrentUser(updatedUser);

    recordLiveActivity(
      'login',
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
      `${updatedUser.name} signed in via Google Account from ${currentDevice}`,
      { authProvider: 'google', device: currentDevice }
    );

    return { success: true, user: updatedUser };
  }

  // Create brand new Google-authenticated user account (only when mode is register or user did not exist in register mode)
  const newUser: UserAccount = {
    id: `usr_g_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    username: normalizedEmail.split('@')[0],
    name: profile.name.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: 'user',
    authProvider: 'google',
    emailVerified: true,
    avatarUrl: profile.avatarUrl,
    createdAt: nowIso,
    hasSubmitted: false,
    submissionLimit: 1,
    isOnline: true,
    lastActiveAt: nowMs,
    lastLoginAt: nowIso,
    lastLoginDevice: currentDevice,
    loginCount: 1,
    lastAction: 'Created Google Account & Logged In',
    lastActionAt: nowIso,
  };

  clearDeletedUserIdentifier(normalizedEmail);
  if (newUser.username) clearDeletedUserIdentifier(newUser.username);

  saveUsers([...users, newUser], newUser);
  saveGoogleSavedAccount({
    name: newUser.name,
    email: normalizedEmail,
    avatarUrl: newUser.avatarUrl,
    isSignedIn: true,
  });
  setCurrentUser(newUser);

  recordLiveActivity(
    'register',
    { id: newUser.id, name: newUser.name, email: newUser.email },
    `New user registered via Google: ${newUser.name} (${newUser.email}) from ${currentDevice}`,
    { authProvider: 'google', device: currentDevice }
  );

  recordLiveActivity(
    'login',
    { id: newUser.id, name: newUser.name, email: newUser.email },
    `${newUser.name} signed in via Google from ${currentDevice}`,
    { authProvider: 'google', device: currentDevice }
  );

  return { success: true, user: newUser };
}

export function loginUser(identifier: string, password?: string): {
  success: boolean;
  user?: UserAccount;
  error?: string;
  isBanned?: boolean;
  bannedInfo?: BanStatus;
  requiresVerification?: boolean;
  verificationEmail?: string;
  verificationCode?: string;
} {
  const users = loadUsers();
  const normalized = identifier.trim().toLowerCase();
  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  
  // Look up by email OR username (e.g. aasnc)
  const user = users.find(
    u => (u.email && u.email.toLowerCase() === normalized) || (u.username && u.username.toLowerCase() === normalized)
  );

  // Special fallback check for predefined admin: username aasnc / password 9559
  if (!user && (normalized === 'aasnc' || normalized === 'admin@company.com')) {
    if (password === '9559') {
      const adminAcc: UserAccount = {
        ...ADMIN_USER_ACCOUNT,
        isOnline: true,
        lastActiveAt: nowMs,
        lastLoginAt: nowIso,
        lastLoginDevice: currentDevice,
        loginCount: (ADMIN_USER_ACCOUNT.loginCount || 0) + 1,
        lastAction: 'Administrator Sign-In',
        lastActionAt: nowIso,
      };
      saveUsers([adminAcc, ...users.filter(u => u.id !== ADMIN_USER_ACCOUNT.id)], adminAcc);
      setCurrentUser(adminAcc);
      recordLiveActivity(
        'login',
        { id: adminAcc.id, name: adminAcc.name, email: adminAcc.email },
        `Corporate Administrator (${adminAcc.name}) signed in from ${currentDevice}`,
        { role: 'admin', device: currentDevice }
      );
      return { success: true, user: adminAcc };
    }
  }

  // CEO Account direct check: bypass for executive access
  if ((normalized === 'ceo' || normalized === 'arnav' || normalized === 'ceo@anthonyindia.com' || normalized === 'ceo@aasnc.ito.in') && password === '8808') {
    const activeBranding = getCompanyBranding();
    const ceoAcc: UserAccount = {
      ...CEO_USER_ACCOUNT,
      name: activeBranding.ceoName || 'Arnav Sharma',
      isOnline: true,
      lastActiveAt: nowMs,
      lastLoginAt: nowIso,
      lastLoginDevice: currentDevice,
      loginCount: (CEO_USER_ACCOUNT.loginCount || 0) + 1,
      lastAction: 'CEO Executive Sign-In',
      lastActionAt: nowIso,
    };
    saveUsers([ceoAcc, ...users.filter(u => u.id !== CEO_USER_ACCOUNT.id)], ceoAcc);
    setCurrentUser(ceoAcc);
    recordLiveActivity(
      'login',
      { id: ceoAcc.id, name: ceoAcc.name, email: ceoAcc.email },
      `CEO Executive (${ceoAcc.name}) signed in from ${currentDevice}`,
      { role: 'ceo', device: currentDevice }
    );
    return { success: true, user: ceoAcc };
  }

  if (!user) {
    return {
      success: false,
      error: 'No account found with this email or username. You cannot sign in without an account. Please switch to the Create Account tab to register first.',
    };
  }

  if (password) {
    if (!user.password) {
      if (user.authProvider === 'google') {
        return {
          success: false,
          error: 'This account was registered via Google Sign-In and has no password configured. Please use "Continue with Google" first and set a password in your dashboard to enable manual login.',
        };
      } else {
        return {
          success: false,
          error: 'No password is configured for this account.',
        };
      }
    }
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
  }

  // Check if account is suspended/banned with timer
  const banStatus = isUserBanned(user);
  if (banStatus.banned) {
    const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
    return {
      success: false,
      error: `Account Suspended: ${banStatus.reason}. Duration remaining: ${timeDisplay}. Please contact administration or wait until the timer expires.`,
      isBanned: true,
      bannedInfo: banStatus,
    };
  }

  // Check if email is verified (for non-admin email registrations)
  if (user.role !== 'admin' && user.authProvider !== 'google' && user.emailVerified === false) {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    saveUsers(users.map(u => (u.id === user.id ? user : u)), user);
    recordDispatchedEmailNotice(user.email, newCode);

    return {
      success: false,
      requiresVerification: true,
      verificationEmail: user.email,
      verificationCode: newCode,
      error: 'Email verification required. A new 6-digit verification code has been dispatched to your email.',
    };
  }

  const updatedUser: UserAccount = {
    ...user,
    isOnline: true,
    lastActiveAt: nowMs,
    lastLoginAt: nowIso,
    lastLoginDevice: currentDevice,
    loginCount: (user.loginCount || 0) + 1,
    lastAction: 'Logged In',
    lastActionAt: nowIso,
  };

  const updatedUsers = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
  saveUsers(updatedUsers, updatedUser);
  setCurrentUser(updatedUser);

  recordLiveActivity(
    'login',
    { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    `${updatedUser.name} signed in from ${currentDevice}`,
    { authProvider: updatedUser.authProvider || 'email', role: updatedUser.role, device: currentDevice }
  );

  return { success: true, user: updatedUser };
}

export function loginAsAdmin(username: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
  const normalized = username.trim();
  const currentDevice = detectClientDevice();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const users = loadUsers();

  // CEO Account direct check: bypass for executive access
  if ((normalized.toLowerCase() === 'ceo' || normalized.toLowerCase() === 'arnav' || normalized.toLowerCase() === 'ceo@anthonyindia.com' || normalized.toLowerCase() === 'ceo@aasnc.ito.in') && password === '8808') {
    const activeBranding = getCompanyBranding();
    const ceoAcc: UserAccount = {
      ...CEO_USER_ACCOUNT,
      name: activeBranding.ceoName || 'Arnav Sharma',
      isOnline: true,
      lastActiveAt: nowMs,
      lastLoginAt: nowIso,
      lastLoginDevice: currentDevice,
      loginCount: (CEO_USER_ACCOUNT.loginCount || 0) + 1,
      lastAction: 'CEO Executive Sign-In',
      lastActionAt: nowIso,
    };
    saveUsers([ceoAcc, ...users.filter(u => u.id !== CEO_USER_ACCOUNT.id)], ceoAcc);
    setCurrentUser(ceoAcc);
    recordLiveActivity(
      'login',
      { id: ceoAcc.id, name: ceoAcc.name, email: ceoAcc.email },
      `CEO Executive (${ceoAcc.name}) signed in from ${currentDevice}`,
      { role: 'ceo', device: currentDevice }
    );
    return { success: true, user: ceoAcc };
  }

  // Administrator Account direct check: bypass for master access
  if ((normalized.toLowerCase() === 'aasnc' || normalized.toLowerCase() === 'admin@company.com') && password === '9559') {
    const adminAcc: UserAccount = {
      ...ADMIN_USER_ACCOUNT,
      isOnline: true,
      lastActiveAt: nowMs,
      lastLoginAt: nowIso,
      lastLoginDevice: currentDevice,
      loginCount: (ADMIN_USER_ACCOUNT.loginCount || 0) + 1,
      lastAction: 'Administrator Sign-In',
      lastActionAt: nowIso,
    };
    saveUsers([adminAcc, ...users.filter(u => u.id !== ADMIN_USER_ACCOUNT.id)], adminAcc);
    setCurrentUser(adminAcc);
    recordLiveActivity(
      'login',
      { id: adminAcc.id, name: adminAcc.name, email: adminAcc.email },
      `Corporate Administrator (${adminAcc.name}) signed in from ${currentDevice}`,
      { role: 'admin', device: currentDevice }
    );
    return { success: true, user: adminAcc };
  }

  // Also check if any existing admin or CEO user matches
  const foundAdmin = users.find(
    u => (u.role === 'admin' || u.role === 'ceo') && ((u.username && u.username.toLowerCase() === normalized.toLowerCase()) || (u.email && u.email.toLowerCase() === normalized.toLowerCase()))
  );

  if (foundAdmin) {
    const banStatus = isUserBanned(foundAdmin);
    if (banStatus.banned) {
      const timeDisplay = banStatus.isPermanent ? 'Permanent Suspension' : formatRemainingDuration(banStatus.remainingMs);
      return { success: false, error: `Account Suspended: ${banStatus.reason}. Duration remaining: ${timeDisplay}.` };
    }

    if (foundAdmin.password === password) {
      const updatedAdmin: UserAccount = {
        ...foundAdmin,
        isOnline: true,
        lastActiveAt: nowMs,
        lastLoginAt: nowIso,
        lastLoginDevice: currentDevice,
        loginCount: (foundAdmin.loginCount || 0) + 1,
        lastAction: 'Admin Access',
        lastActionAt: nowIso,
      };
      saveUsers(users.map(u => u.id === updatedAdmin.id ? updatedAdmin : u), updatedAdmin);
      setCurrentUser(updatedAdmin);

      recordLiveActivity(
        'login',
        { id: updatedAdmin.id, name: updatedAdmin.name, email: updatedAdmin.email },
        `Admin (${updatedAdmin.name}) signed in from ${currentDevice}`,
        { role: 'admin', device: currentDevice }
      );

      return { success: true, user: updatedAdmin };
    }
    return { success: false, error: 'Invalid administrator credentials. Access denied.' };
  }

  return {
    success: false,
    error: 'Access denied: Invalid administrator username or password.',
  };
}

export function logoutUser(): void {
  const curr = getCurrentUser();
  if (curr) {
    const device = detectClientDevice();
    sendUserPresenceHeartbeat(curr.id, false, 'Logged Out');
    recordLiveActivity(
      'logout',
      { id: curr.id, name: curr.name, email: curr.email },
      `${curr.name} signed out from ${device}`,
      { device }
    );
  }
  setCurrentUser(null);
}

// Submissions Storage
export function loadSubmissions(): FormSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error('Failed to load submissions', e);
  }
  return [];
}

/**
 * Save submissions strictly to local storage without triggering cloud sync
 */
export function saveSubmissionsLocally(submissions: FormSubmission[]): void {
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submissions locally', e);
  }
}

export function saveSubmissions(submissions: FormSubmission[]): void {
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submissions', e);
  }
}

export function saveSubmission(submission: FormSubmission): void {
  try {
    const existing = loadSubmissions();
    const users = loadUsers();
    const matchedUser = users.find(u => u.id === submission.userId || (u.email && submission.userEmail && u.email.toLowerCase() === submission.userEmail.toLowerCase()));
    
    const complianceScoreVal = (submission as any).complianceScore || calculateComplianceScore(submission);
    // AUTOMATIC VIP CEO FAST-TRACK ROUTING:
    // If the submission is from a VIP account, automatically route directly to the CEO desk
    const isVipAcc = Boolean(submission.isVipSubmission || isUserVip(matchedUser));
    const finalSubmission: FormSubmission = {
      ...submission,
      isVipSubmission: isVipAcc,
      isSentToCeo: isVipAcc ? true : Boolean(submission.isSentToCeo),
      workflowStage: isVipAcc ? 'ceo_desk' : (submission.workflowStage || 'department_review'),
      status: isVipAcc && submission.status === 'Pending Review' ? 'Under Evaluation' : submission.status,
      statusNotes: isVipAcc && !submission.statusNotes
        ? 'VIP Priority Fast-Track: Routed directly to CEO Executive Desk.'
        : submission.statusNotes,
      complianceScore: complianceScoreVal,
    };

    const updated = [finalSubmission, ...existing.filter(s => s.id !== finalSubmission.id)];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    // Push submission to Firestore
    syncSubmissionToFirestore(finalSubmission).catch(() => {});

    // Update user account flag based on user's specific submission limit (up to 9)
    const userIndex = users.findIndex(u => u.id === finalSubmission.userId || (u.email && finalSubmission.userEmail && u.email.toLowerCase() === finalSubmission.userEmail.toLowerCase()));
    if (userIndex !== -1) {
      const user = users[userIndex];
      const maxLimit = Math.min(9, Math.max(1, user.submissionLimit || 1));
      const userSubmissions = updated.filter(s => s.userId === user.id || (s.userEmail && user.email && s.userEmail.toLowerCase() === user.email.toLowerCase()));
      
      user.submittedFormId = finalSubmission.id;
      user.hasSubmitted = userSubmissions.length >= maxLimit;
      user.lastAction = `Submitted: ${finalSubmission.formTitle}`;
      user.lastActionAt = new Date().toISOString();
      user.lastActiveAt = Date.now();
      saveUsers(users, user);

      // Update session user if matching
      const curr = getCurrentUser();
      if (curr && curr.id === users[userIndex].id) {
        setCurrentUser(user);
      }
    }

    // Record cross-device real-time activity
    const device = detectClientDevice();
    recordLiveActivity(
      'submission',
      { id: finalSubmission.userId, name: finalSubmission.userName, email: finalSubmission.userEmail },
      `${finalSubmission.userName} submitted "${finalSubmission.formTitle}" (#${finalSubmission.id}) ${isVipAcc ? '[VIP DIRECT TO CEO]' : ''} from ${device}`,
      { submissionId: finalSubmission.id, formTitle: finalSubmission.formTitle, templateId: finalSubmission.templateId, device, isVip: isVipAcc }
    );

    // SYSTEM 3: Automated Confirmation Email Dispatch
    if (finalSubmission.userEmail) {
      try {
        const storedBrandingRaw = typeof window !== 'undefined'
          ? (localStorage.getItem('company_portal_branding_v2') || localStorage.getItem('company_branding_v3'))
          : null;
        
        let customSmtp: any = undefined;
        try {
          const customSmtpRaw = typeof window !== 'undefined' ? localStorage.getItem('company_custom_smtp_settings') : null;
          if (customSmtpRaw) {
            const parsed = JSON.parse(customSmtpRaw);
            if (parsed.enabled) {
              customSmtp = parsed;
            }
          }
        } catch {}

        if (storedBrandingRaw) {
          const parsedBranding = JSON.parse(storedBrandingRaw);
          if (parsedBranding.emailNotificationsEnabled === false) {
            console.log('Intake email dispatch skipped: Routine email notifications are disabled in CEO Governance Settings.');
          } else {
            fetch('/api/send-submission-status-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: finalSubmission.userEmail,
                userName: finalSubmission.userName,
                submissionId: finalSubmission.id,
                formTitle: finalSubmission.formTitle,
                status: finalSubmission.status,
                statusNotes: finalSubmission.statusNotes || (isVipAcc ? 'Your filing was received and fast-tracked directly to the Chief Executive Officer desk.' : 'Your filing was received and is currently under departmental review.'),
                companyName: finalSubmission.companyName || 'ANTHONY INDIA',
                isCeo: isVipAcc,
                isVip: isVipAcc,
                customSmtp,
              })
            }).catch((err: any) => console.warn('Automated intake email error:', err));
          }
        } else {
          fetch('/api/send-submission-status-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: finalSubmission.userEmail,
              userName: finalSubmission.userName,
              submissionId: finalSubmission.id,
              formTitle: finalSubmission.formTitle,
              status: finalSubmission.status,
              statusNotes: finalSubmission.statusNotes || (isVipAcc ? 'Your filing was received and fast-tracked directly to the Chief Executive Officer desk.' : 'Your filing was received and is currently under departmental review.'),
              companyName: finalSubmission.companyName || 'ANTHONY INDIA',
              isCeo: isVipAcc,
              isVip: isVipAcc,
              customSmtp,
            })
          }).catch((err: any) => console.warn('Automated intake email error:', err));
        }
      } catch (e) {
        let customSmtp: any = undefined;
        try {
          const customSmtpRaw = typeof window !== 'undefined' ? localStorage.getItem('company_custom_smtp_settings') : null;
          if (customSmtpRaw) {
            const parsed = JSON.parse(customSmtpRaw);
            if (parsed.enabled) {
              customSmtp = parsed;
            }
          }
        } catch {}

        fetch('/api/send-submission-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: finalSubmission.userEmail,
            userName: finalSubmission.userName,
            submissionId: finalSubmission.id,
            formTitle: finalSubmission.formTitle,
            status: finalSubmission.status,
            statusNotes: finalSubmission.statusNotes || (isVipAcc ? 'Your filing was received and fast-tracked directly to the Chief Executive Officer desk.' : 'Your filing was received and is currently under departmental review.'),
            companyName: finalSubmission.companyName || 'ANTHONY INDIA',
            isCeo: isVipAcc,
            isVip: isVipAcc,
            customSmtp,
          })
        }).catch((err: any) => console.warn('Automated intake email error:', err));
      }
    }
  } catch (e) {
    console.error('Failed to save submission', e);
  }
}

export function getUserSubmissions(userId: string, email: string): FormSubmission[] {
  const all = loadSubmissions();
  return all.filter(s => !s.deletedByUser && (s.userId === userId || (s.userEmail && email && s.userEmail.toLowerCase() === email.toLowerCase())));
}

export function getUserSubmission(userId: string, email: string): FormSubmission | null {
  const allUserSubmissions = getUserSubmissions(userId, email);
  if (allUserSubmissions.length === 0) return null;

  const users = loadUsers();
  const user = users.find(u => u.id === userId || (u.email && email && u.email.toLowerCase() === email.toLowerCase()));

  if (user && user.submittedFormId) {
    const matched = allUserSubmissions.find(s => s.id === user.submittedFormId);
    if (matched) return matched;
  }

  return allUserSubmissions[0] || null;
}

export function deleteSubmission(id: string, deletedByRole: 'Admin' | 'CEO' = 'Admin', adminName?: string): FormSubmission[] {
  try {
    const existing = loadSubmissions();
    const target = existing.find(s => s.id === id);
    const nowIso = new Date().toISOString();

    // Mark as hidden from Admin/CEO and locked, but preserve form status for submitter user view
    const updated = existing.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          deletedByAdminOrCeo: true,
          hiddenFromAdminCeo: true,
          isLocked: true,
          deletedByRole: deletedByRole,
          lastHandledAt: nowIso,
          lastHandledByAdminName: adminName || `${deletedByRole} Office`
        };
      }
      return s;
    });

    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));

    if (target) {
      const updatedTarget = {
        ...target,
        deletedByAdminOrCeo: true,
        hiddenFromAdminCeo: true,
        isLocked: true,
        deletedByRole: deletedByRole,
        lastHandledAt: nowIso,
        lastHandledByAdminName: adminName || `${deletedByRole} Office`
      };

      syncSubmissionToFirestore(updatedTarget).catch(() => {});

      recordLiveActivity(
        'status_change',
        { id: target.userId, name: target.userName, email: target.userEmail },
        `Submission #${id} was cleared from management desk by ${adminName || deletedByRole} (Form remains active for user as ${target.status})`,
        { submissionId: id, status: target.status, deletedByRole, adminName }
      );

      // Ensure submitter account remains linked so they see the status in their AccountStatusDashboard
      const users = loadUsers();
      const userIndex = users.findIndex(u => u.id === target.userId || (u.email && target.userEmail && u.email.toLowerCase() === target.userEmail.toLowerCase()));
      if (userIndex !== -1) {
        const user = users[userIndex];
        user.hasSubmitted = true;
        user.submittedFormId = target.id;
        saveUsers(users);

        const curr = getCurrentUser();
        if (curr && curr.id === users[userIndex].id) {
          setCurrentUser(user);
        }
      }
    }

    return updated.filter((s) => !s.hiddenFromAdminCeo && !s.deletedByAdminOrCeo && s.id !== id);
  } catch (e) {
    console.error('Failed to delete submission', e);
    return [];
  }
}

export function deleteSubmissionByUser(id: string, userId?: string): FormSubmission[] {
  try {
    const existing = loadSubmissions();
    const target = existing.find(s => s.id === id);
    const updated = existing.filter(s => s.id !== id);

    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));

    // Permanently delete from Firestore
    deleteSubmissionFromFirestore(id).catch(() => {});

    if (target) {
      recordLiveActivity(
        'status_change',
        { id: target.userId, name: target.userName, email: target.userEmail },
        `Submission #${id} was permanently deleted by the submitting user`,
        { submissionId: id }
      );

      const userSubmissions = updated.filter(s => s.userId === target.userId || (s.userEmail && target.userEmail && s.userEmail.toLowerCase() === target.userEmail.toLowerCase()));
      const users = loadUsers();
      const userIndex = users.findIndex(u => u.id === target.userId || (u.email && target.userEmail && u.email.toLowerCase() === target.userEmail.toLowerCase()));
      if (userIndex !== -1) {
        const user = users[userIndex];
        user.hasSubmitted = userSubmissions.length > 0;
        user.submittedFormId = userSubmissions[0]?.id;
        saveUsers(users);

        const curr = getCurrentUser();
        if (curr && curr.id === users[userIndex].id) {
          setCurrentUser(user);
        }
      }
    }

    return updated;
  } catch (e) {
    console.error('Failed to delete submission by user', e);
    return [];
  }
}

// VIP Accounts & CEO Routing Storage Helpers
const VIP_USERS_KEY = 'company_ceo_vip_users_v2';

export function getVipUserIds(): string[] {
  try {
    const raw = localStorage.getItem(VIP_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isUserVip(user?: UserAccount | null): boolean {
  if (!user) return false;
  if (user.isVip) return true;
  const vipList = getVipUserIds();
  const normEmail = user.email ? user.email.trim().toLowerCase() : '';
  const normId = user.id ? user.id.trim() : '';
  return vipList.some(id => id === normId || (normEmail && id.toLowerCase() === normEmail));
}

export function toggleUserVipStatus(user: UserAccount): { isVip: boolean; updatedUsers: UserAccount[] } {
  if (user.role === 'admin' || user.role === 'ceo') {
    return { isVip: false, updatedUsers: loadUsers() };
  }
  const users = loadUsers();
  const vipList = getVipUserIds();
  const normId = user.id || user.email;
  const currentlyVip = isUserVip(user);
  
  // VIP status is now permanent once granted
  if (currentlyVip) {
    return { isVip: true, updatedUsers: users };
  }

  const nextVip = true;
  const newVipList = [...vipList, normId];
  localStorage.setItem(VIP_USERS_KEY, JSON.stringify(newVipList));

  const updatedUsers = users.map(u => {
    if (u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())) {
      return { ...u, isVip: nextVip };
    }
    return u;
  });

  saveUsers(updatedUsers, { ...user, isVip: nextVip });
  return { isVip: nextVip, updatedUsers };
}

export function forwardSubmissionToCeo(submissionId: string, adminName: string): FormSubmission | null {
  const submissions = loadSubmissions();
  const target = submissions.find(s => s.id === submissionId);
  if (!target) return null;

  const nowIso = new Date().toISOString();
  const updated: FormSubmission = {
    ...target,
    isSentToCeo: true,
    sentToCeoByAdmin: true,
    workflowStage: 'ceo_desk',
    sentByAdminName: adminName || 'Corporate Administrator',
    sentToCeoAt: nowIso,
    lastHandledAt: nowIso,
    lastHandledByAdminName: adminName || 'Corporate Administrator',
    statusNotes: (target.statusNotes ? target.statusNotes + '\n' : '') + `[Stage 2 Escalation: Recommended & forwarded to CEO Executive Desk by ${adminName || 'Admin'} on ${new Date().toLocaleString()}]`,
  };

  saveSubmission(updated);
  return updated;
}

export function certifySubmission(id: string): FormSubmission | null {
  const submissions = loadSubmissions();
  const target = submissions.find(s => s.id === id);
  if (!target) return null;

  const certNumber = target.certificateSerialNumber || `CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const qrUrl = `${window.location.origin}/?verify=${encodeURIComponent(target.id)}&cert=${encodeURIComponent(certNumber)}`;

  const updated: FormSubmission = {
    ...target,
    status: 'Approved',
    isCertified: true,
    certifiedAt: new Date().toISOString(),
    workflowStage: 'completed',
    certificateSerialNumber: certNumber,
    qrVerificationUrl: qrUrl,
    statusNotes: (target.statusNotes ? target.statusNotes + '\n' : '') + `[OFFICIALLY CERTIFIED & VERIFIED BY CEO on ${new Date().toLocaleString()}]`,
  };

  saveSubmission(updated);
  return updated;
}

export function updateSubmissionStatus(id: string, status: FormSubmission['status'], notes?: string, adminName?: string, isCeo?: boolean): FormSubmission[] {
  try {
    const existing = loadSubmissions();
    const target = existing.find(s => s.id === id);
    const nowIso = new Date().toISOString();
    const isCeoApproval = Boolean(isCeo && status === 'Approved');

    const updatedWorkflowStage = status === 'Approved' ? 'completed' : (target?.workflowStage || 'department_review');

    const updated = existing.map((s) => (s.id === id ? { 
      ...s, 
      status, 
      workflowStage: updatedWorkflowStage,
      ...(notes !== undefined ? { statusNotes: notes } : {}),
      ...(isCeoApproval ? { approvedByCeo: true, ceoApprovedAt: nowIso } : {}),
      lastHandledAt: nowIso,
      lastHandledByAdminName: adminName || (isCeo ? 'CEO Executive Desk' : undefined)
    } : s));
    
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    if (target) {
      const mergedTarget = {
        ...target,
        status,
        workflowStage: updatedWorkflowStage,
        ...(notes !== undefined ? { statusNotes: notes } : {}),
        ...(isCeoApproval ? { approvedByCeo: true, ceoApprovedAt: nowIso } : {}),
        lastHandledAt: nowIso,
        lastHandledByAdminName: adminName || (isCeo ? 'CEO Executive Desk' : undefined)
      };

      syncSubmissionToFirestore(mergedTarget).catch(() => {});
      
      recordLiveActivity(
        'status_change',
        { id: target.userId, name: target.userName, email: target.userEmail },
        `Submission #${id} status changed to "${status}" by ${adminName || (isCeo ? 'Chief Executive Officer' : 'Admin')}`,
        { submissionId: id, status, notes, adminName, isCeo }
      );

      // Automated email notification trigger on status change
      if (target.userEmail) {
        try {
          const storedBrandingRaw = typeof window !== 'undefined'
            ? (localStorage.getItem('company_portal_branding_v2') || localStorage.getItem('company_branding_v3'))
            : null;

          let customSmtp: any = undefined;
          try {
            const customSmtpRaw = typeof window !== 'undefined' ? localStorage.getItem('company_custom_smtp_settings') : null;
            if (customSmtpRaw) {
              const parsed = JSON.parse(customSmtpRaw);
              if (parsed.enabled) {
                customSmtp = parsed;
              }
            }
          } catch {}

          if (storedBrandingRaw) {
            const parsedBranding = JSON.parse(storedBrandingRaw);
            if (parsedBranding.emailNotificationsEnabled === false) {
              console.log('Status email dispatch skipped: Routine email notifications are disabled in CEO Governance Settings.');
            } else {
              fetch('/api/send-submission-status-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: target.userEmail,
                  userName: target.userName,
                  submissionId: target.id,
                  formTitle: target.formTitle,
                  status,
                  statusNotes: notes || target.statusNotes,
                  companyName: target.companyName || 'ANTHONY INDIA',
                  isCeo: Boolean(isCeo || target.isSentToCeo || target.isVipSubmission),
                  isVip: Boolean(target.isVipSubmission),
                  customSmtp,
                })
              }).catch((err) => console.warn('Status change notification email dispatch failed:', err));
            }
          } else {
            fetch('/api/send-submission-status-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: target.userEmail,
                userName: target.userName,
                submissionId: target.id,
                formTitle: target.formTitle,
                status,
                statusNotes: notes || target.statusNotes,
                companyName: target.companyName || 'ANTHONY INDIA',
                isCeo: Boolean(isCeo || target.isSentToCeo || target.isVipSubmission),
                isVip: Boolean(target.isVipSubmission),
                customSmtp,
              })
            }).catch((err) => console.warn('Status change notification email dispatch failed:', err));
          }
        } catch (e) {
          let customSmtp: any = undefined;
          try {
            const customSmtpRaw = typeof window !== 'undefined' ? localStorage.getItem('company_custom_smtp_settings') : null;
            if (customSmtpRaw) {
              const parsed = JSON.parse(customSmtpRaw);
              if (parsed.enabled) {
                customSmtp = parsed;
              }
            }
          } catch {}

          fetch('/api/send-submission-status-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: target.userEmail,
              userName: target.userName,
              submissionId: target.id,
              formTitle: target.formTitle,
              status,
              statusNotes: notes || target.statusNotes,
              companyName: target.companyName || 'ANTHONY INDIA',
              isCeo: Boolean(isCeo || target.isSentToCeo || target.isVipSubmission),
              isVip: Boolean(target.isVipSubmission),
              customSmtp,
            })
          }).catch((err) => console.warn('Status change notification email dispatch failed:', err));
        }
      }
    }
    return updated;
  } catch (e) {
    console.error('Failed to update submission status', e);
    return [];
  }
}

export interface BanStatus {
  banned: boolean;
  remainingMs: number;
  reason?: string;
  bannedUntil?: string;
  isPermanent?: boolean;
  remainingTimeDisplay?: string;
  remainingDisplay?: string;
}

export function isUserBanned(user: UserAccount): BanStatus {
  if (!user.isBanned) {
    return { banned: false, remainingMs: 0, remainingTimeDisplay: '0s', remainingDisplay: '0s' };
  }

  // If permanently banned (no bannedUntil timestamp or marked permanent)
  if (!user.bannedUntil) {
    return {
      banned: true,
      remainingMs: Infinity,
      reason: user.banReason || 'Administrative suspension',
      isPermanent: true,
      remainingTimeDisplay: 'Permanent',
      remainingDisplay: 'Permanent',
    };
  }

  const untilTime = new Date(user.bannedUntil).getTime();
  const now = Date.now();
  const diff = untilTime - now;

  if (diff <= 0) {
    // Ban timer has expired
    return { banned: false, remainingMs: 0, remainingTimeDisplay: '0s', remainingDisplay: '0s' };
  }

  const timeDisplay = formatRemainingDuration(diff);
  return {
    banned: true,
    remainingMs: diff,
    reason: user.banReason || 'Administrative hold',
    bannedUntil: user.bannedUntil,
    isPermanent: false,
    remainingTimeDisplay: timeDisplay,
    remainingDisplay: timeDisplay,
  };
}

export function formatRemainingDuration(ms: number): string {
  if (ms === Infinity || ms <= 0) return ms <= 0 ? '0s' : 'Permanent';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export function banUser(
  userId: string,
  durationMinutes: number, // 0 means permanent
  reason: string = 'Administrative suspension'
): UserAccount[] {
  try {
    const users = loadUsers();
    
    // Safety check: Cannot ban VIPs, Admins (master), or CEOs
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && (targetUser.role === 'ceo' || targetUser.role === 'admin' || isUserVip(targetUser))) {
      return users;
    }

    const bannedAt = new Date().toISOString();
    const bannedUntil = durationMinutes > 0
      ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
      : undefined;

    let targetUpdatedUser: UserAccount | undefined;
    const updated = users.map(u => {
      if (u.id === userId) {
        targetUpdatedUser = {
          ...u,
          isBanned: true,
          bannedAt,
          bannedUntil,
          banDurationMinutes: durationMinutes,
          banReason: reason.trim() || 'Administrative suspension',
        };
        return targetUpdatedUser;
      }
      return u;
    });

    saveUsers(updated, targetUpdatedUser);

    if (targetUpdatedUser) {
      recordLiveActivity(
        'ban',
        { id: targetUpdatedUser.id, name: targetUpdatedUser.name, email: targetUpdatedUser.email },
        `Account ${targetUpdatedUser.name} (${targetUpdatedUser.email}) suspended: ${reason} (${durationMinutes > 0 ? `${durationMinutes} mins` : 'Permanent'})`,
        { durationMinutes, reason }
      );
    }

    const curr = getCurrentUser();
    if (curr && curr.id === userId && targetUpdatedUser) {
      setCurrentUser(targetUpdatedUser);
    }

    return updated;
  } catch (e) {
    console.error('Failed to ban user', e);
    return [];
  }
}

export function unbanUser(userId: string): UserAccount[] {
  try {
    const users = loadUsers();
    let targetUpdatedUser: UserAccount | undefined;
    const updated: UserAccount[] = users.map(u => {
      if (u.id === userId) {
        const updatedUser: UserAccount = {
          ...u,
          isBanned: false,
          bannedUntil: undefined,
          bannedAt: undefined,
          banReason: undefined,
          banDurationMinutes: undefined,
          failedLoginAttempts: 0,
        };
        targetUpdatedUser = updatedUser;
        return updatedUser;
      }
      return u;
    }).filter((u): u is UserAccount => u !== undefined);

    saveUsers(updated, targetUpdatedUser);

    if (targetUpdatedUser) {
      recordLiveActivity(
        'admin_action',
        { id: 'admin', name: 'Administrator', email: 'admin@company.com' },
        `Suspension revoked for account ${targetUpdatedUser.name} (${targetUpdatedUser.email}). Account is now active.`
      );
    }

    const curr = getCurrentUser();
    if (curr && curr.id === userId && targetUpdatedUser) {
      setCurrentUser(targetUpdatedUser);
    }

    return updated;
  } catch (e) {
    console.error('Failed to unban user', e);
    return [];
  }
}

export function verifyAdminPassword(password: string): boolean {
  if (!password || !password.trim()) return false;
  const trimmed = password.trim();

  // 1. Current admin session
  const current = getCurrentUser();
  if (current && (current.role === 'admin' || current.username === 'aasnc') && current.password) {
    if (current.password === trimmed) return true;
  }

  // 2. Master admin default password
  if (trimmed === '9559') return true;

  // 3. User registry admin check
  const users = loadUsers();
  return users.some(u => (u.role === 'admin' || u.username === 'aasnc') && u.password === trimmed);
}

export function setUserSubmissionLimit(
  userId: string,
  limit: number,
  resetUsage: boolean = false,
  purgeSubmissions: boolean = false
): UserAccount[] {
  try {
    const users = loadUsers();
    const clampedLimit = Math.min(9, Math.max(1, Math.round(limit)));
    let targetEmail = '';

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return users;
    targetEmail = targetUser.email;

    if (purgeSubmissions) {
      const submissions = loadSubmissions();
      const remaining = submissions.filter(
        s => s.userId !== userId && (!targetEmail || !s.userEmail || s.userEmail.toLowerCase() !== targetEmail.toLowerCase())
      );
      saveSubmissions(remaining);
    }

    const currentSubmissions = purgeSubmissions || resetUsage
      ? []
      : loadSubmissions().filter(s => s.userId === userId || (targetEmail && s.userEmail && s.userEmail.toLowerCase() === targetEmail.toLowerCase()));

    let targetUpdatedUser: UserAccount | undefined;
    const updated = users.map(u => {
      if (u.id === userId) {
        const isQuotaReached = currentSubmissions.length >= clampedLimit;
        targetUpdatedUser = {
          ...u,
          submissionLimit: clampedLimit,
          hasSubmitted: isQuotaReached,
          submittedFormId: currentSubmissions.length > 0 ? currentSubmissions[0].id : undefined,
        };
        return targetUpdatedUser;
      }
      return u;
    });

    saveUsers(updated, targetUpdatedUser);

    if (targetUpdatedUser) {
      recordLiveActivity(
        'quota_change',
        { id: targetUpdatedUser.id, name: targetUpdatedUser.name, email: targetUpdatedUser.email },
        `Submission quota adjusted to ${clampedLimit} for ${targetUpdatedUser.name}`,
        { limit: clampedLimit, resetUsage, purgeSubmissions }
      );
    }

    const curr = getCurrentUser();
    if (curr && curr.id === userId && targetUpdatedUser) {
      setCurrentUser(targetUpdatedUser);
    }

    return updated;
  } catch (e) {
    console.error('Failed to set user submission limit', e);
    return [];
  }
}

export function resetUserSubmissionQuota(userId: string, deleteSubmissionData: boolean = false): UserAccount[] {
  return setUserSubmissionLimit(userId, 1, true, deleteSubmissionData);
}

export function deleteUserAccount(userOrId: string | UserAccount, deleteAssociatedSubmissions: boolean = true): UserAccount[] {
  try {
    if (!userOrId) return loadUsers();
    const users = loadUsers();
    let searchKey = '';
    let targetUser: UserAccount | undefined;

    if (typeof userOrId === 'object' && userOrId !== null) {
      targetUser = users.find(u => 
        (userOrId.id && u.id === userOrId.id) ||
        (userOrId.email && u.email && u.email.toLowerCase() === userOrId.email.toLowerCase()) ||
        (userOrId.username && u.username && u.username.toLowerCase() === userOrId.username.toLowerCase()) ||
        u === userOrId
      );
      if (!targetUser) {
        targetUser = userOrId;
      }
    } else if (typeof userOrId === 'string' && userOrId.trim()) {
      searchKey = userOrId.trim().toLowerCase();
      targetUser = users.find(
        u => u && (
          (u.id && String(u.id).trim().toLowerCase() === searchKey) ||
          (u.email && String(u.email).trim().toLowerCase() === searchKey) ||
          (u.username && String(u.username).trim().toLowerCase() === searchKey)
        )
      );
    }

    if (!targetUser) return loadUsers();

    // Master admin cannot be deleted
    const isMaster = (targetUser.username && targetUser.username.toLowerCase() === 'aasnc') || 
                     targetUser.id === 'usr_admin_master' || 
                     (targetUser.email && targetUser.email.toLowerCase() === 'admin@company.com');
    
    if (isMaster) {
      return users;
    }

    const targetEmail = targetUser.email && typeof targetUser.email === 'string' ? targetUser.email.trim().toLowerCase() : '';
    const targetUsername = targetUser.username && typeof targetUser.username === 'string' ? targetUser.username.trim().toLowerCase() : '';
    const targetId = targetUser.id && typeof targetUser.id === 'string' ? targetUser.id.trim().toLowerCase() : '';

    // Permanently record deleted user identifiers
    if (targetId) recordDeletedUserIdentifier(targetId);
    if (targetEmail) recordDeletedUserIdentifier(targetEmail);
    if (targetUsername) recordDeletedUserIdentifier(targetUsername);

    const updated = users.filter(
      u => u && u !== targetUser &&
           (!targetId || !u.id || String(u.id).trim().toLowerCase() !== targetId) &&
           (!targetEmail || !u.email || String(u.email).trim().toLowerCase() !== targetEmail) &&
           (!targetUsername || !u.username || String(u.username).trim().toLowerCase() !== targetUsername) &&
           (u.id || u.email || u.username)
    );
    saveUsersLocally(updated);

    if (targetId) {
      deleteUserFromFirestore(targetId).catch(() => {});
    }
    if (targetEmail) {
      deleteUserFromFirestore(targetEmail).catch(() => {});
    }
    if (searchKey) {
      deleteUserFromFirestore(searchKey).catch(() => {});
    }

    // If deleteAssociatedSubmissions is true, clean up all forms submitted by this user
    if (deleteAssociatedSubmissions) {
      const submissions = loadSubmissions();
      const userSubsToDelete = submissions.filter(
        s => s && ((targetId && s.userId === targetId) || (s.userEmail && targetEmail && String(s.userEmail).trim().toLowerCase() === targetEmail))
      );
      userSubsToDelete.forEach(s => {
        if (s && s.id) deleteSubmissionFromFirestore(s.id).catch(() => {});
      });
      const remainingSubmissions = submissions.filter(
        s => s && s.userId !== targetId && (!s.userEmail || !targetEmail || String(s.userEmail).trim().toLowerCase() !== targetEmail)
      );
      saveSubmissionsLocally(remainingSubmissions);
    }

    if (targetEmail) {
      removeGoogleSavedAccount(targetEmail);
    }

    const curr = getCurrentUser();
    if (curr) {
      const currEmail = curr.email && typeof curr.email === 'string' ? curr.email.trim().toLowerCase() : '';
      const currId = curr.id && typeof curr.id === 'string' ? curr.id.trim().toLowerCase() : '';
      if ((targetId && currId === targetId) || (targetEmail && currEmail === targetEmail)) {
        logoutUser();
      }
    }

    return updated;
  } catch (e) {
    console.error('Failed to delete user account', e);
    return [];
  }
}

export function updateUserPassword(userId: string, newPassword: string, oldPassword?: string): { success: boolean; error?: string } {
  try {
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }
    // Verify old password if provided (for self-change flow)
    if (oldPassword !== undefined) {
      if (user.password !== oldPassword) {
        return { success: false, error: 'The old password you entered is incorrect.' };
      }
    }
    const updatedUser = { ...user, password: newPassword };
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    saveUsers(updatedUsers, updatedUser);
    const curr = getCurrentUser();
    if (curr && curr.id === userId) {
      setCurrentUser(updatedUser);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password.' };
  }
}

export function getCompanyBranding(): CompanyBranding {
  try {
    const raw = localStorage.getItem(BRANDING_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse company branding', e);
  }
  return DEFAULT_BRANDING;
}

/**
 * Save company branding strictly to local storage without triggering cloud sync
 */
export function saveCompanyBrandingLocally(branding: CompanyBranding): void {
  try {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
  } catch (e) {
    console.error('Failed to save branding locally', e);
  }
}

export function saveCompanyBranding(branding: CompanyBranding): void {
  try {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
  } catch (e) {
    console.error('Failed to save branding locally', e);
  }

  try {
    syncBrandingToFirestore(branding).catch((err: any) => {
      console.warn('Could not sync branding to Firestore:', err);
    });
  } catch (err) {
    console.warn('Failed to dispatch branding to Firestore:', err);
  }
}

export function saveDraft(templateId: string, userId: string, data: Record<string, any>): void {
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${userId}_${templateId}`, JSON.stringify({
      data,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Failed to save draft', e);
  }
}

export function loadDraft(templateId: string, userId: string): { data: Record<string, any>; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${userId}_${templateId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load draft', e);
  }
  return null;
}

export function clearDraft(templateId: string, userId: string): void {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${userId}_${templateId}`);
  } catch (e) {
    console.error('Failed to clear draft', e);
  }
}

export function generateTrackingId(templateId: string): string {
  const prefixMap: Record<string, string> = {
    'client-inquiry': 'INQ',
    'job-application': 'APP',
    'internal-request': 'REQ',
    'vendor-partner': 'VEN',
  };
  const prefix = prefixMap[templateId] || 'DOC';
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

export function exportToCSV(submissions: FormSubmission[]): void {
  if (!submissions.length) return;
  
  const headers = ['Tracking ID', 'Form Type', 'Submitter Name', 'Email', 'Submitted At', 'Status', 'Reviewer Notes', 'Key Details'];
  const rows = submissions.map(s => {
    const details = Object.entries(s.data)
      .filter(([_, v]) => v !== null && v !== undefined && typeof v !== 'object')
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    
    return [
      `"${s.id}"`,
      `"${s.formTitle}"`,
      `"${s.userName || ''}"`,
      `"${s.userEmail || ''}"`,
      `"${new Date(s.submittedAt).toLocaleString()}"`,
      `"${s.status}"`,
      `"${(s.statusNotes || '').replace(/"/g, '""')}"`,
      `"${details.replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `company_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function verifyCeoPassword(password: string): boolean {
  return password === '8808';
}

export function createAdminAccount(
  name: string,
  email: string,
  username: string,
  password: string,
  adminControlLevel: 'half' | 'full'
): { success: boolean; user?: UserAccount; error?: string } {
  try {
    const users = loadUsers();
    const normEmail = email.trim().toLowerCase();
    const normUsername = username.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === normEmail || (u.username && u.username.toLowerCase() === normUsername))) {
      return { success: false, error: 'An account with this email or username already exists.' };
    }

    const newAdmin: UserAccount = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normEmail,
      username: username.trim(),
      password,
      role: 'admin',
      adminControlLevel,
      createdAt: new Date().toISOString(),
      hasSubmitted: false,
      emailVerified: true,
      authProvider: 'email',
    };

    saveUsers([newAdmin, ...users], newAdmin);
    return { success: true, user: newAdmin };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create admin account.' };
  }
}

export function updateAdminControlLevel(userId: string, adminControlLevel: 'half' | 'full'): UserAccount[] {
  try {
    const users = loadUsers();
    const updated = users.map(u => (u.id === userId ? { ...u, adminControlLevel } : u));
    saveUsers(updated);
    return updated;
  } catch (e) {
    console.error('Failed to update admin control level', e);
    return loadUsers();
  }
}

export function generateAdminRecoveryCode(identifier: string): { success: boolean; code?: string; adminEmail?: string; error?: string } {
  const users = loadUsers();
  const query = identifier.trim().toLowerCase();
  const admin = users.find(u => (u.role === 'admin' || u.role === 'ceo') && (u.username?.toLowerCase() === query || u.email?.toLowerCase() === query));

  if (!admin) {
    return { success: false, error: 'Admin account not found with this username or email.' };
  }

  const recoveryEmail = localStorage.getItem('company_ceo_recovery_email') || 'arnavpro78910@gmail.com';
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 15 * 60 * 1000;

  const updatedAdmin: UserAccount = {
    ...admin,
    recoveryCode: newCode,
    recoveryCodeExpires: expires,
  };

  const updatedUsers = users.map(u => (u.id === updatedAdmin.id ? updatedAdmin : u));
  saveUsers(updatedUsers, updatedAdmin);
  recordDispatchedEmailNotice(recoveryEmail, newCode);

  return { success: true, code: newCode, adminEmail: admin.email };
}

export function verifyAdminRecoveryCode(identifier: string, code: string): { success: boolean; error?: string } {
  const users = loadUsers();
  const query = identifier.trim().toLowerCase();
  const admin = users.find(u => (u.role === 'admin' || u.role === 'ceo') && (u.username?.toLowerCase() === query || u.email?.toLowerCase() === query));

  if (!admin) {
    return { success: false, error: 'Admin account not found.' };
  }

  if (!admin.recoveryCode) {
    return { success: false, error: 'No recovery code generated for this admin account.' };
  }

  if (admin.recoveryCodeExpires && Date.now() > admin.recoveryCodeExpires) {
    return { success: false, error: 'Recovery code has expired.' };
  }

  if (admin.recoveryCode.trim() !== code.trim()) {
    return { success: false, error: 'Invalid recovery code.' };
  }

  return { success: true };
}

export function updateAdminPassword(identifier: string, newPassword: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = loadUsers();
  const query = identifier.trim().toLowerCase();
  const admin = users.find(u => (u.role === 'admin' || u.role === 'ceo') && (u.username?.toLowerCase() === query || u.email?.toLowerCase() === query));

  if (!admin) {
    return { success: false, error: 'Admin account not found.' };
  }

  const updatedAdmin: UserAccount = {
    ...admin,
    password: newPassword,
    recoveryCode: undefined,
    recoveryCodeExpires: undefined,
  };

  const updatedUsers = users.map(u => (u.id === updatedAdmin.id ? updatedAdmin : u));
  saveUsers(updatedUsers, updatedAdmin);
  setCurrentUser(updatedAdmin);
  return { success: true, user: updatedAdmin };
}

export function loginAfterAdminRecoveryWithOldPassword(identifier: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = loadUsers();
  const query = identifier.trim().toLowerCase();
  const admin = users.find(u => (u.role === 'admin' || u.role === 'ceo') && (u.username?.toLowerCase() === query || u.email?.toLowerCase() === query));

  if (!admin) {
    return { success: false, error: 'Admin account not found.' };
  }

  const updatedAdmin: UserAccount = {
    ...admin,
    recoveryCode: undefined,
    recoveryCodeExpires: undefined,
  };

  const updatedUsers = users.map(u => (u.id === updatedAdmin.id ? updatedAdmin : u));
  saveUsers(updatedUsers, updatedAdmin);
  setCurrentUser(updatedAdmin);
  return { success: true, user: updatedAdmin };
}

export function calculateComplianceScore(submission: FormSubmission): number {
  if (!submission || !submission.data) return 85;
  const data = submission.data;
  const keys = Object.keys(data);
  if (keys.length === 0) return 75;

  let filledCount = 0;
  let hasAttachments = false;
  let hasValidContact = false;

  for (const k of keys) {
    const val = data[k];
    if (val !== null && val !== undefined && val !== '') {
      if (typeof val === 'string' && val.trim().length > 0) {
        filledCount++;
        if (val.includes('@') || val.match(/^\+?[0-9\s-]{10,}$/)) {
          hasValidContact = true;
        }
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        filledCount++;
      } else if (typeof val === 'object') {
        filledCount++;
        hasAttachments = true;
      }
    }
  }

  const completenessRatio = Math.min(1, filledCount / Math.max(1, keys.length));
  let score = Math.round(completenessRatio * 65);
  score += 20;
  if (hasAttachments) score += 10;
  if (hasValidContact) score += 5;

  return Math.min(100, Math.max(50, score));
}

export const loadActivityLogs = loadActivityLogsLocally;
export const loadBranding = getCompanyBranding;
export const saveBranding = saveCompanyBranding;
export const deleteUser = deleteUserAccount;
