import React from 'react';
import {
  Crown,
  LayoutDashboard,
  Inbox,
  ShieldCheck,
  Users,
  Megaphone,
  BarChart3,
  ScrollText,
  UserCog,
  FileSpreadsheet,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CEOTabId } from './types';
import { CompanyBranding, UserAccount } from '../../types';
import { CompanyLogo } from '../CompanyLogo';

interface CEONavigationProps {
  activeTab: CEOTabId;
  onTabChange: (tab: CEOTabId) => void;
  ceoUser: UserAccount;
  branding: CompanyBranding;
  pendingCount: number;
  vipPendingCount: number;
  isEmergencyFreeze: boolean;
  onRefreshData: () => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const CEONavigation: React.FC<CEONavigationProps> = ({
  activeTab,
  onTabChange,
  ceoUser,
  branding,
  pendingCount,
  vipPendingCount,
  isEmergencyFreeze,
  onRefreshData,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const tabs: { id: CEOTabId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'queue',
      label: 'CEO Review Desk',
      icon: <Inbox className="w-4 h-4" />,
      badge: pendingCount,
      badgeColor: vipPendingCount > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-blue-600 text-white',
    },
    {
      id: 'company_governance',
      label: 'Company Governance',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'user_quotas',
      label: 'Users & VIP Quotas',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'announcements',
      label: 'Broadcasts & Notices',
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Executive Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'activity',
      label: 'Audit Trail',
      icon: <ScrollText className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Admin Hierarchy',
      icon: <UserCog className="w-4 h-4" />,
    },
    {
      id: 'form_management',
      label: 'Form Blueprint Schemes',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-[#020617] border-b border-slate-900 sticky top-0 z-40">
      {/* Top Professional Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & High-End Executive Title */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-amber-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CompanyLogo branding={branding} size="md" className="relative" />
          </div>
          
          <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block"></div>
          
          <div className="hidden sm:block">
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-black text-white tracking-widest uppercase">
                {branding.companyName || 'ANTHONY INDIA'}
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500">
                  Full Control (All Privileges)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Executive Command Center
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">
                {ceoUser.name || 'Arnav Singh'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Emergency Lockdown indicator if active */}
          {isEmergencyFreeze && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
              Portal Frozen
            </div>
          )}

          <div className="flex items-center bg-slate-900/50 rounded-2xl p-1 border border-slate-800">
            {/* Refresh Data */}
            <button
              type="button"
              onClick={onRefreshData}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all cursor-pointer"
              title="Synchronize Global Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-1"></div>

            {/* Sign Out */}
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Terminate Session</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Primary CEO Navigation Tabs */}
      <div className="hidden lg:block border-t border-slate-900 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 h-12 items-center overflow-x-auto scrollbar-none" aria-label="CEO Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 h-full relative text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer group ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black shadow-lg ${
                        tab.badgeColor || 'bg-blue-600 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
