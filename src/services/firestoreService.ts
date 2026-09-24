import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserAccount, FormSubmission, CompanyBranding, ActivityLog, FormTemplate } from '../types';
import { DEFAULT_BRANDING, FORM_TEMPLATES } from '../data/templates';
import {
  loadUsers,
  saveUsersLocally,
  loadSubmissions,
  saveSubmissionsLocally,
  loadTemplates,
  saveTemplatesLocally,
  getCompanyBranding,
  saveCompanyBrandingLocally,
  loadActivityLogsLocally,
  saveActivityLogsLocally,
  getDeletedUserIdentifiers,
  getDeletedSubmissionIdentifiers,
  getDeletedTemplateIdentifiers,
  INITIAL_USERS,
  INITIAL_SUBMISSION,
  registerFirestoreCallbacks,
  detectClientDevice,
} from '../utils/storage';

const USERS_COL = 'users';
const SUBMISSIONS_COL = 'submissions';
const SETTINGS_COL = 'settings';
const ACTIVITY_LOGS_COL = 'activity_logs';
const FORM_BLUEPRINTS_COL = 'form_blueprints';
const BRANDING_DOC_ID = 'company_branding';

let isSyncing = false;
let seededUsers = false;
let seededSubmissions = false;
let seededTemplates = false;

/**
 * Record a cross-device live event log and sync immediately to Firestore
 */
export async function recordLiveActivity(
  type: ActivityLog['type'],
  user: { id: string; name: string; email: string },
  details: string,
  meta?: Record<string, any>
): Promise<ActivityLog> {
  const device = detectClientDevice();
  const log: ActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    timestamp: new Date().toISOString(),
    device,
    details,
    meta,
  };

  // 1. Update local storage
  const existing = loadActivityLogsLocally();
  const updated = [log, ...existing.filter(item => item.id !== log.id)].slice(0, 100);
  saveActivityLogsLocally(updated);

  // 2. Sync to Firestore
  try {
    await setDoc(doc(db, ACTIVITY_LOGS_COL, log.id), log);
  } catch (err) {
    console.warn('Could not sync activity log to Firestore:', err);
  }

  return log;
}

/**
 * Initialize Firestore listeners and sync with offline/local fallback.
 * Uses local storage first for instant performance and syncs changes.
 */
export function initFirestoreSync(callbacks?: {
  onUsersUpdate?: (users: UserAccount[]) => void;
  onSubmissionsUpdate?: (submissions: FormSubmission[]) => void;
  onTemplatesUpdate?: (templates: FormTemplate[]) => void;
  onBrandingUpdate?: (branding: CompanyBranding) => void;
  onActivitiesUpdate?: (activities: ActivityLog[]) => void;
}): () => void {
  if (isSyncing) return () => {};
  isSyncing = true;

  console.log('[Firestore] Initializing real-time synchronization engine...');

  // 1. Listen for Users collection changes
  const usersColRef = collection(db, USERS_COL);
  const unsubUsers = onSnapshot(usersColRef, async (snapshot) => {
    if (snapshot.empty && !seededUsers) {
      seededUsers = true;
      const localUsers = loadUsers();
      const usersToSeed = localUsers.length > 0 ? localUsers : INITIAL_USERS;
      for (const u of usersToSeed) {
        setDoc(doc(db, USERS_COL, u.id), u).catch(err => console.warn('Seed user error:', err));
      }
    } else if (!snapshot.empty) {
      const deletedIdentifiers = getDeletedUserIdentifiers();
      const firestoreUsers: UserAccount[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as UserAccount;
        const uid = data.id || d.id;
        if (data && typeof data === 'object') {
          const uEmail = data.email?.trim().toLowerCase() || '';
          const uUsername = data.username?.trim().toLowerCase() || '';
          const uId = uid.trim().toLowerCase();
          
          if (!deletedIdentifiers.includes(uId) && (!uEmail || !deletedIdentifiers.includes(uEmail)) && (!uUsername || !deletedIdentifiers.includes(uUsername))) {
            firestoreUsers.push({ ...data, id: uid });
          }
        }
      });
      saveUsersLocally(firestoreUsers);
      callbacks?.onUsersUpdate?.(firestoreUsers);
    }
  }, (error) => console.warn('Firestore users listener error:', error));

  // 2. Listen for Submissions collection changes
  const submissionsColRef = collection(db, SUBMISSIONS_COL);
  const unsubSubmissions = onSnapshot(submissionsColRef, async (snapshot) => {
    if (snapshot.empty && !seededSubmissions) {
      seededSubmissions = true;
      const localSubmissions = loadSubmissions();
      for (const sub of localSubmissions) {
        setDoc(doc(db, SUBMISSIONS_COL, sub.id), sub).catch(err => console.warn('Seed sub error:', err));
      }
    } else if (!snapshot.empty) {
      const deletedSubIds = getDeletedSubmissionIdentifiers();
      const firestoreSubs: FormSubmission[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as FormSubmission;
        if (data && data.id && !deletedSubIds.includes(data.id)) {
          firestoreSubs.push(data);
        }
      });
      saveSubmissionsLocally(firestoreSubs);
      callbacks?.onSubmissionsUpdate?.(firestoreSubs);
    } else if (snapshot.empty) {
      saveSubmissionsLocally([]);
      callbacks?.onSubmissionsUpdate?.([]);
    }
  }, (error) => console.warn('Firestore submissions listener error:', error));

  // 3. Listen for Form Blueprints Schemas
  const templatesColRef = collection(db, FORM_BLUEPRINTS_COL);
  const unsubTemplates = onSnapshot(templatesColRef, async (snapshot) => {
    if (snapshot.empty && !seededTemplates) {
      seededTemplates = true;
      const localTemplates = loadTemplates();
      const tplsToSeed = localTemplates.length > 0 ? localTemplates : FORM_TEMPLATES;
      for (const t of tplsToSeed) {
        setDoc(doc(db, FORM_BLUEPRINTS_COL, t.id), t).catch(err => console.warn('Seed template error:', err));
      }
    } else if (!snapshot.empty) {
      const deletedTplIds = getDeletedTemplateIdentifiers();
      const firestoreTemplates: FormTemplate[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as FormTemplate;
        if (data && data.id && !deletedTplIds.includes(data.id)) {
          firestoreTemplates.push(data);
        }
      });
      saveTemplatesLocally(firestoreTemplates);
      callbacks?.onTemplatesUpdate?.(firestoreTemplates);
    }
  }, (error) => console.warn('Firestore blueprints listener error:', error));

  // 4. Listen for Branding Settings
  const brandingDocRef = doc(db, SETTINGS_COL, BRANDING_DOC_ID);
  const unsubBranding = onSnapshot(brandingDocRef, async (docSnap) => {
    if (!docSnap.exists()) {
      const localBranding = getCompanyBranding() || DEFAULT_BRANDING;
      setDoc(brandingDocRef, localBranding).catch(err => console.warn('Seed branding error:', err));
    } else {
      const raw = docSnap.data() as Partial<CompanyBranding>;
      const brandingData: CompanyBranding = {
        ...DEFAULT_BRANDING,
        ...raw,
        logoUrl: raw.logoUrl === '/src/assets/images/company_logo_emblem_1789786894581.jpg'
          ? '/assets/images/company_logo_emblem.jpg'
          : (raw.logoUrl ?? DEFAULT_BRANDING.logoUrl),
        logoType: raw.logoType || (raw.logoUrl ? 'generated' : 'icon'),
      };
      saveCompanyBrandingLocally(brandingData);
      callbacks?.onBrandingUpdate?.(brandingData);
    }
  }, (error) => console.warn('Firestore branding listener error:', error));

  // 5. Listen for Activity Logs
  const activityColRef = query(collection(db, ACTIVITY_LOGS_COL), orderBy('timestamp', 'desc'), limit(100));
  const unsubActivities = onSnapshot(activityColRef, (snapshot) => {
    const logs: ActivityLog[] = [];
    snapshot.forEach((d) => {
      logs.push(d.data() as ActivityLog);
    });
    saveActivityLogsLocally(logs);
    callbacks?.onActivitiesUpdate?.(logs);
  }, (error) => console.warn('Firestore activity logs listener error:', error));

  return () => {
    unsubUsers();
    unsubSubmissions();
    unsubTemplates();
    unsubBranding();
    unsubActivities();
    isSyncing = false;
  };
}

/**
 * Cloud write: Sync a single user document directly to Firestore
 */
export async function syncUserToFirestore(user: UserAccount): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, user.id), user, { merge: true });
  } catch (err) {
    console.warn('Could not sync user to Firestore (persisted locally):', err);
  }
}

/**
 * Send user online presence heartbeat
 */
export async function sendUserPresenceHeartbeat(userId: string, isOnline: boolean = true, lastAction?: string): Promise<void> {
  try {
    const patch: any = {
      isOnline,
      lastActiveAt: Date.now(),
    };
    if (lastAction) {
      patch.lastAction = lastAction;
      patch.lastActionAt = new Date().toISOString();
    }
    await updateDoc(doc(db, USERS_COL, userId), patch);
  } catch (err) {
    console.warn('Could not send user presence heartbeat (user might have been deleted):', err);
  }
}

/**
 * Cloud delete: Delete a user document from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const targetNorm = userId.trim().toLowerCase();
    
    // 1. Direct document deletion
    await deleteDoc(doc(db, USERS_COL, userId)).catch((e) => {
      console.warn('Direct user doc deletion error:', e);
    });

    // 2. Query and delete other documents matching the ID, email, or username
    const colRef = collection(db, USERS_COL);
    const snap = await getDocs(colRef);
    const deletePromises: Promise<void>[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const normId = data && data.id ? String(data.id).trim().toLowerCase() : '';
      const normEmail = data && data.email ? String(data.email).trim().toLowerCase() : '';
      const normUsername = data && data.username ? String(data.username).trim().toLowerCase() : '';

      // Delete corrupt/empty user documents or documents matching the targeted identifier
      if (!normId && !normEmail && !normUsername) {
        deletePromises.push(deleteDoc(d.ref).catch(() => {}));
      } else if (
        d.id.trim().toLowerCase() === targetNorm ||
        (normId && normId === targetNorm) ||
        (normEmail && normEmail === targetNorm) ||
        (normUsername && normUsername === targetNorm)
      ) {
        deletePromises.push(deleteDoc(d.ref).catch((e) => {
          console.warn(`Relational doc deletion error for ${d.id}:`, e);
        }));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (err) {
    console.warn('Could not delete user from Firestore:', err);
  }
}

/**
 * Cloud write: Sync a submission directly to Firestore with durable cloud metadata
 */
export async function syncSubmissionToFirestore(submission: FormSubmission): Promise<void> {
  try {
    const enrichedSubmission: FormSubmission = {
      ...submission,
      cloudSyncedAt: new Date().toISOString(),
      storageBackend: 'Cloud Firestore',
      device: submission.device || detectClientDevice(),
    };
    await setDoc(doc(db, SUBMISSIONS_COL, enrichedSubmission.id), enrichedSubmission, { merge: true });
  } catch (err) {
    console.warn('Could not sync submission to Firestore (persisted locally):', err);
  }
}

/**
 * Direct Cloud Read: Fetch all historical submissions directly from Cloud Firestore.
 * Ensures submissions from hours, days, or months ago are retrieved anytime on demand.
 */
export async function fetchAllSubmissionsFromFirestore(): Promise<FormSubmission[]> {
  try {
    const colRef = collection(db, SUBMISSIONS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return loadSubmissions();
    }
    const submissions: FormSubmission[] = [];
    snap.forEach((d) => {
      submissions.push(d.data() as FormSubmission);
    });
    // Sort newest to oldest
    submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    saveSubmissionsLocally(submissions);
    return submissions;
  } catch (err) {
    console.warn('Error fetching all submissions from Cloud Firestore:', err);
    return loadSubmissions();
  }
}

/**
 * Direct Cloud Read: Fetch all user accounts directly from Cloud Firestore.
 */
export async function fetchAllUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    const colRef = collection(db, USERS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return loadUsers();
    }
    const users: UserAccount[] = [];
    snap.forEach((d) => {
      users.push(d.data() as UserAccount);
    });
    saveUsersLocally(users);
    return loadUsers();
  } catch (err) {
    console.warn('Error fetching all users from Cloud Firestore:', err);
    return loadUsers();
  }
}

/**
 * Force Deep Cloud Sync: Pulls all documents from Firestore and refreshes local state.
 */
export async function forceCloudDeepSync(): Promise<{
  submissions: FormSubmission[];
  users: UserAccount[];
  branding: CompanyBranding;
  activities: ActivityLog[];
}> {
  const [subs, usrs] = await Promise.all([
    fetchAllSubmissionsFromFirestore(),
    fetchAllUsersFromFirestore(),
  ]);

  let branding = getCompanyBranding();
  try {
    const brandingDoc = await getDocs(collection(db, SETTINGS_COL));
    brandingDoc.forEach((d) => {
      if (d.id === BRANDING_DOC_ID) {
        branding = d.data() as CompanyBranding;
        saveCompanyBrandingLocally(branding);
      }
    });
  } catch (e) {
    console.warn('Error fetching branding:', e);
  }

  let activities = loadActivityLogsLocally();
  try {
    const actSnap = await getDocs(collection(db, ACTIVITY_LOGS_COL));
    if (!actSnap.empty) {
      const logs: ActivityLog[] = [];
      actSnap.forEach((d) => logs.push(d.data() as ActivityLog));
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      activities = logs.slice(0, 100);
      saveActivityLogsLocally(activities);
    }
  } catch (e) {
    console.warn('Error fetching activities:', e);
  }

  return {
    submissions: subs,
    users: usrs,
    branding,
    activities,
  };
}

/**
 * Cloud delete: Delete a submission from Firestore
 */
export async function deleteSubmissionFromFirestore(submissionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COL, submissionId));
  } catch (err) {
    console.warn('Could not delete submission from Firestore:', err);
  }
}

/**
 * Cloud write: Sync branding config to Firestore
 */
export async function syncBrandingToFirestore(branding: CompanyBranding): Promise<void> {
  try {
    const rawBranding: Record<string, any> = {
      ...DEFAULT_BRANDING,
      ...branding,
      updatedAt: new Date().toISOString(),
    };
    // Ensure no undefined values are passed to Firestore
    const cleanBranding: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawBranding)) {
      if (value !== undefined) {
        cleanBranding[key] = value;
      }
    }
    // Set a 3.5s race timeout so Firestore network issues never block the app
    const syncPromise = setDoc(doc(db, SETTINGS_COL, BRANDING_DOC_ID), cleanBranding, { merge: true });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sync timeout')), 3500));
    await Promise.race([syncPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Could not sync branding to Firestore:', err);
  }
}

/**
 * Delete all activity logs both from Firestore and locally
 */
export async function clearAllActivityLogs(): Promise<void> {
  // 1. Clear locally
  saveActivityLogsLocally([]);

  // 2. Clear from Firestore
  try {
    const actSnap = await getDocs(collection(db, ACTIVITY_LOGS_COL));
    const deletePromises = actSnap.docs.map((d) => deleteDoc(doc(db, ACTIVITY_LOGS_COL, d.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Could not clear activity logs from Firestore:', err);
  }
}

/**
 * Cloud write: Sync a form blueprint template to Firestore
 */
export async function syncTemplateToFirestore(template: FormTemplate): Promise<void> {
  try {
    await setDoc(doc(db, FORM_BLUEPRINTS_COL, template.id), template, { merge: true });
  } catch (err) {
    console.warn('Could not sync form template to Firestore:', err);
  }
}

/**
 * Cloud delete: Delete a form blueprint template from Firestore
 */
export async function deleteTemplateFromFirestore(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FORM_BLUEPRINTS_COL, templateId));
  } catch (err) {
    console.warn('Could not delete form template from Firestore:', err);
  }
}

const GMAIL_DISPATCHER_DOC_ID = 'gmail_dispatcher';

export async function syncGmailDispatcherToFirestore(session: { accessToken: string; senderEmail: string; expiresAt: number } | null): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COL, GMAIL_DISPATCHER_DOC_ID);
    if (!session) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, session, { merge: true });
    }
  } catch (err) {
    console.warn('Could not sync Gmail dispatcher to Firestore:', err);
  }
}

export async function getGmailDispatcherFromFirestore(): Promise<{ accessToken: string; senderEmail: string; expiresAt: number } | null> {
  try {
    const docRef = doc(db, SETTINGS_COL, GMAIL_DISPATCHER_DOC_ID);
    const snap = await getDocs(query(collection(db, SETTINGS_COL), limit(10)));
    const target = snap.docs.find((d) => d.id === GMAIL_DISPATCHER_DOC_ID);
    if (target && target.exists()) {
      const data = target.data() as any;
      if (data && data.accessToken && data.expiresAt > Date.now()) {
        return data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Register dynamic callbacks with storage layer to fully break ES module circular dependencies
registerFirestoreCallbacks({
  syncUserToFirestore,
  deleteUserFromFirestore,
  syncSubmissionToFirestore,
  deleteSubmissionFromFirestore,
  syncBrandingToFirestore,
  syncTemplateToFirestore,
  deleteTemplateFromFirestore,
  recordLiveActivity,
  sendUserPresenceHeartbeat,
});

