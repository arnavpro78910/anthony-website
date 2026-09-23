import React from 'react';
import { 
  Database, 
  RefreshCw, 
  LogOut, 
  ChevronDown, 
  Menu, 
  Bell,
  Search,
  Settings,
  X
} from 'lucide-react';
import { UserAccount, CompanyBranding } from '../../types';
import { CompanyLogo } from '../CompanyLogo';

interface AdminHeaderProps {
  adminUser: UserAccount;
  branding: CompanyBranding;
  activeTabLabel: string;
  isRefreshing: boolean;
  isNavDrawerOpen: boolean;
  onToggleNavDrawer: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminUser,
  branding,
  activeTabLabel,
  isRefreshing,
  isNavDrawerOpen,
  onToggleNavDrawer,
  onRefresh,
  onLogout,
}) => {
  const isHalfControl = adminUser.adminControlLevel === 'half';

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Context */}
          <div className="flex items-center gap-4">
            <CompanyLogo branding={branding} size="md" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {branding.companyName || 'Anthony India'}
                </h1>
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase ${
                  isHalfControl ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                }`}>
                  {isHalfControl ? 'Restricted Access' : 'Full Executive Authority'}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Administrative Control Panel • {activeTabLabel}
              </p>
            </div>
          </div>

          {/* Central Actions (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-2 py-1 gap-1">
             <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400">
                <Search className="w-3.5 h-3.5" />
                <span>Quick Actions</span>
             </div>
             <div className="h-4 w-px bg-slate-800 mx-1" />
             <button 
               onClick={onRefresh}
               className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
             >
               <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
               <span>Sync Cloud</span>
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer">
               <Database className="w-3.5 h-3.5 text-emerald-500" />
               <span>Audit Logs</span>
             </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 pr-4 border-r border-slate-800">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-none">{adminUser.name}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-blue-400">
                {adminUser.name?.charAt(0)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950"></span>
              </button>
              <button 
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              
              <div className="h-8 w-px bg-slate-800 mx-1 lg:hidden" />
              
              <button
                onClick={onToggleNavDrawer}
                className={`lg:hidden flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                  isNavDrawerOpen ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {isNavDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
