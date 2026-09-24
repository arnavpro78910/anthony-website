import React, { useState, useEffect } from 'react';
import { CompanyLogo } from '../CompanyLogo';
import { CompanyBranding } from '../../types';
import { Menu, X, LogOut, ChevronRight, User, Bell, Info, CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { getStoredNotifications, deleteStoredNotification, clearAllStoredNotifications, PersistentNotification } from '../../utils/notifications';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface LayoutProps {
  branding: CompanyBranding;
  currentUser: any;
  onLogout: () => void;
  children: React.ReactNode;
  navItems: NavItem[];
  activeTabTitle?: string;
}

export const AppLayout: React.FC<LayoutProps> = ({ branding, currentUser, onLogout, children, navItems, activeTabTitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PersistentNotification[]>(getStoredNotifications());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setNotifications(e.detail);
      } else {
        setNotifications(getStoredNotifications());
      }
    };
    window.addEventListener('app-notifications-updated', handleUpdate);
    return () => window.removeEventListener('app-notifications-updated', handleUpdate);
  }, []);

  const handleNavItemClick = (onClick: () => void) => {
    onClick();
    setIsSidebarOpen(false);
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteStoredNotification(id);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    clearAllStoredNotifications();
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 selection:bg-blue-100">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0b1329] text-slate-100 w-72 sm:w-76 lg:w-64 flex flex-col transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto shrink-0 border-r border-slate-800/80 shadow-2xl lg:shadow-none`}
      >
        {/* Sidebar Header with Brand */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80 bg-[#080e1f]">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo branding={branding} size="sm" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">Workspace</span>
              <span className="text-xs font-bold text-slate-200 truncate block">{branding.companyName || 'Enterprise'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="px-4 py-3.5 border-b border-slate-800/70 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{currentUser?.name || 'Authorized User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] font-semibold text-slate-400 truncate capitalize tracking-wide">
                  {currentUser?.role === 'ceo' ? 'Chief Executive' : currentUser?.role === 'admin' ? 'Administrator' : 'Client Submitter'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Category Label */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</p>
        </div>

        {/* Nav Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, idx) => (
            <button 
              key={idx}
              type="button"
              onClick={() => handleNavItemClick(item.onClick)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                item.active 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-1 ring-white/10 font-bold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <span className="flex items-center gap-3 truncate">
                <span className={`shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${item.active ? 'text-white translate-x-0.5' : 'text-slate-600 opacity-60'}`} />
            </button>
          ))}
        </nav>
        
        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#080e1f]">
          <button 
            type="button"
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/40 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{branding.companyName || 'Portal'}</span>
                <span className="text-xs text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  {activeTabTitle || 'Dashboard'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Encrypted Session</span>
            </div>

            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                isNotificationsOpen 
                  ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border-slate-200'
              }`}
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>
            
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="flex flex-col items-end text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{currentUser?.role || 'User'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
              aria-label="Logout"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden relative">
          {children}

          {/* Notifications Panel */}
          {isNotificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 lg:absolute" 
                onClick={() => setIsNotificationsOpen(false)} 
              />
              <div className="absolute top-0 right-0 z-50 w-full sm:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 m-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-0.5 rounded cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-semibold">No notifications yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">All updates and actions will appear here.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isSuccess = notif.type === 'success';
                      const isError = notif.type === 'error';
                      const isWarning = notif.type === 'warning';

                      return (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 transition-all text-left ${
                            isSuccess
                              ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                              : isError
                              ? 'bg-rose-50/70 border-rose-100 text-rose-950'
                              : isWarning
                              ? 'bg-amber-50/70 border-amber-100 text-amber-950'
                              : 'bg-blue-50/70 border-blue-100 text-blue-950'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                              {isSuccess ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isError ? (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Info className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold leading-tight truncate">{notif.title}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed break-words">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Delete individual notification button in corner */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                            title="Delete notification"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

