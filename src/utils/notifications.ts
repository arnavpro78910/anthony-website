import { ToastMessage } from '../components/common/FloatingToast';

export interface PersistentNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
  read?: boolean;
}

const STORAGE_KEY = 'anthony_india_portal_notifications_v1';

export function getStoredNotifications(): PersistentNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Default initial welcome notification
      return [
        {
          id: 'welcome-system-init',
          title: 'Portal Ready',
          message: 'Your official service intake and legal portal is active and operational.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: true,
        },
      ];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load notifications:', e);
    return [];
  }
}

export function saveNotificationRecord(item: Omit<PersistentNotification, 'id' | 'timestamp'> & { id?: string }): PersistentNotification {
  const all = getStoredNotifications();
  const record: PersistentNotification = {
    id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: item.title || (item.type === 'error' ? 'System Notice' : 'Portal Update'),
    message: item.message,
    type: item.type,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const updated = [record, ...all.filter(n => n.id !== record.id)].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save notification record:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-notifications-updated', { detail: updated }));
  }

  return record;
}

export function deleteStoredNotification(id: string): PersistentNotification[] {
  const all = getStoredNotifications();
  const updated = all.filter((n) => n.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete notification:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-notifications-updated', { detail: updated }));
  }

  return updated;
}

export function clearAllStoredNotifications(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('Failed to clear notifications:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-notifications-updated', { detail: [] }));
  }
}

/**
 * Dispatch a global floating application notification toast AND store in notifications panel.
 */
export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  durationMs?: number,
  title?: string
) => {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type,
    durationMs,
  };

  // Dispatch visual floating toast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-notification', { detail: toast }));
  }

  // Also save to user notification history
  saveNotificationRecord({
    title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Attention Needed' : 'Notification'),
    message,
    type,
  });
};

/**
 * Common toast triggers for enterprise portal actions
 */
export const notify = {
  success: (msg: string, title?: string) => showToast(msg, 'success', undefined, title),
  error: (msg: string, title?: string) => showToast(msg, 'error', 7000, title),
  info: (msg: string, title?: string) => showToast(msg, 'info', undefined, title),
  warning: (msg: string, title?: string) => showToast(msg, 'warning', 6000, title),
};
