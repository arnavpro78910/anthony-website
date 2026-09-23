import { useState, useCallback, useEffect } from 'react';
import { ToastMessage, ToastType } from '../components/NotificationToast';

// Global state for notifications to be shared across components if needed
// though usually provided via context in larger apps. 
// For this applet, we'll use a singleton-like pattern or just a standard hook.

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let globalToasts: ToastMessage[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...globalToasts]));
};

export const addToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { id, message, type, duration };
  globalToasts = [...globalToasts, newToast];
  notifyListeners();
  return id;
};

export const dismissToast = (id: string) => {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  notifyListeners();
};

export const useNotification = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>(globalToasts);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    toasts,
    addToast,
    dismissToast,
  };
};
