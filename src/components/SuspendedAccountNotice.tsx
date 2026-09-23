/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Mail,
  Calendar,
  Building2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { UserAccount, CompanyBranding } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { isUserBanned, unbanUser } from '../utils/storage';

interface SuspendedAccountNoticeProps {
  currentUser: UserAccount;
  branding: CompanyBranding;
  onLogout: () => void;
  onRefresh: () => void;
}

export const SuspendedAccountNotice: React.FC<SuspendedAccountNoticeProps> = ({
  currentUser,
  branding,
  onLogout,
  onRefresh,
}) => {
  const [now, setNow] = useState(Date.now());
  const [isChecking, setIsChecking] = useState(false);

  // Live countdown timer ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (currentUser.bannedUntil) {
        const diff = new Date(currentUser.bannedUntil).getTime() - currentTime;
        if (diff <= 0) {
          // Ban expired! Lift suspension immediately
          unbanUser(currentUser.id);
          onRefresh();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, onRefresh]);

  const banStatus = isUserBanned(currentUser);
  const remainingMs = Math.max(0, banStatus.remainingMs);
  const isPermanent = banStatus.isPermanent;

  // Breakdown remaining time
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      onRefresh();
      setIsChecking(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-rose-600 selection:text-white">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <CompanyLogo branding={branding} size="sm" />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {branding.companyName || 'Anthony India'}
            </h1>
            <p className="text-xs text-slate-400">Enterprise Access & Security Management</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Notice Card */}
      <main className="max-w-xl w-full mx-auto my-8">
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {/* Status Indicator Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-3">
              <Lock className="w-3 h-3" />
              Account Temporarily Suspended
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Access Restricted by Admin
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Your account has been placed under temporary administrative restriction. During this period, filing new forms or accessing corporate features is locked.
            </p>
          </div>

          {/* Ban Reason Box */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-left w-full">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Administrative Reason
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
                  "{currentUser.banReason || 'Administrative suspension for account verification.'}"
                </p>
              </div>
            </div>
          </div>

          {/* COUNTDOWN TIMER SECTION */}
          {!isPermanent ? (
            <div className="mb-6 bg-gradient-to-b from-rose-950/20 to-slate-950/80 border border-rose-900/30 rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-rose-300">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Suspension Timer Remaining
                </span>
              </div>

              {/* Ticking Digit Blocks */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto mb-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-inner">
                  <div className="text-xl sm:text-3xl font-mono font-bold text-white">
                    {String(days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-0.5">
                    Days
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-inner">
                  <div className="text-xl sm:text-3xl font-mono font-bold text-white">
                    {String(hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-0.5">
                    Hours
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-inner">
                  <div className="text-xl sm:text-3xl font-mono font-bold text-white">
                    {String(minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-0.5">
                    Mins
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-inner">
                  <div className="text-xl sm:text-3xl font-mono font-bold text-rose-400 animate-pulse">
                    {String(seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-0.5">
                    Secs
                  </div>
                </div>
              </div>

              {currentUser.bannedUntil && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Expires on{' '}
                    <strong className="text-slate-200">
                      {new Date(currentUser.bannedUntil).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 bg-rose-950/30 border border-rose-900/40 rounded-2xl p-5 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
                Indefinite Suspension
              </span>
              <p className="text-xs text-slate-300">
                This account has been suspended indefinitely. Please contact your system administrator to request reinstatement.
              </p>
            </div>
          )}

          {/* Account Metadata Overview */}
          <div className="border-t border-slate-800/80 pt-4 mb-6 text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Account Holder:</span>
              <span className="font-semibold text-slate-200">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-mono text-slate-300">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Account ID:</span>
              <span className="font-mono text-slate-400">{currentUser.id}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-400' : ''}`} />
              <span>Check Status / Refresh</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Support Footer Note */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <span>Need assistance or believe this is an error? </span>
          <a
            href={`mailto:${branding.supportEmail || 'support@company.com'}?subject=Suspension Appeal - ${currentUser.email}`}
            className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <Mail className="w-3 h-3" />
            Contact Administrator ({branding.supportEmail || 'support@company.com'})
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-600 py-4">
        {branding.companyName || 'Corporate'} Security Protocol • Automated Enforcement & Timer Synchronization
      </footer>
    </div>
  );
};
