import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  durationMs?: number;
}

interface FloatingToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const FloatingToast: React.FC<FloatingToastProps> = ({ toast, onClose }) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDismissing, setIsDismissing] = useState(false);

  const duration = toast?.durationMs || (toast?.type === 'error' ? 7000 : 4500);

  useEffect(() => {
    if (!toast) return;
    setIsDismissing(false);
    setDragOffset({ x: 0, y: 0 });

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, duration]);

  if (!toast) return null;

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = e.touches[0].clientX - touchStartX;
    const diffY = e.touches[0].clientY - touchStartY;
    setDragOffset({ x: diffX, y: Math.min(0, diffY) }); // Upward or horizontal swipe
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragOffset.x) > 60 || dragOffset.y < -40) {
      handleDismiss();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const typeStyles = {
    success: 'bg-emerald-950/95 border-emerald-500/80 text-emerald-100 shadow-emerald-900/40',
    error: 'bg-rose-950/95 border-rose-500/80 text-rose-100 shadow-rose-900/40',
    warning: 'bg-amber-950/95 border-amber-500/80 text-amber-100 shadow-amber-900/40',
    info: 'bg-blue-950/95 border-blue-500/80 text-blue-100 shadow-blue-900/40',
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  return (
    <div
      className={`fixed bottom-8 inset-x-0 z-[99999] flex justify-center pointer-events-none px-4 transition-all duration-300 ${
        isDismissing ? 'opacity-0 translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDismiss}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          transition: touchStartX !== null ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`pointer-events-auto max-w-sm w-full p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 cursor-pointer active:scale-95 select-none transition-transform ${
          typeStyles[toast.type] || typeStyles.info
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {iconMap[toast.type] || iconMap.info}
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold leading-snug break-words">
              {toast.message}
            </p>
            <p className="text-[10px] opacity-75 font-mono mt-0.5">
              Swipe left, right, or up to dismiss
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
