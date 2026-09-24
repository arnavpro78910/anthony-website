import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { AdminTabId, TabConfigMeta } from '../AdminDashboard';

interface AdminSidebarProps {
  activeTab: AdminTabId;
  tabs: TabConfigMeta[];
  onTabChange: (id: AdminTabId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  tabs,
  onTabChange,
  isOpen,
  onClose,
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-white border-r border-slate-800">
      <div className="p-6 flex items-center justify-between border-b border-slate-900 lg:hidden">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Navigation</h2>
        <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                onClose();
              }}
              className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-500 group-hover:text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-tight leading-none">{tab.label}</p>
                  <p className={`text-[10px] mt-1 font-medium truncate max-w-[140px] ${
                    isActive ? 'text-blue-100' : 'text-slate-600'
                  }`}>
                    {tab.description}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                isActive ? 'text-white' : 'text-slate-700 group-hover:translate-x-1 group-hover:text-slate-400'
              }`} />
            </button>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-900/50 border-t border-slate-900">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Core 4.0.2</span>
           </div>
           <p className="text-[10px] text-slate-600 mt-2 font-medium">All administrative actions are logged and audited in accordance with corporate governance protocols.</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-72 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-80 max-w-[85vw]"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
