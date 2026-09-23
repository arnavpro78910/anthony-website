import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  UserMinus, 
  Shield, 
  ShieldAlert, 
  MoreHorizontal,
  Mail,
  User,
  Crown,
  Activity,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Ban
} from 'lucide-react';
import { UserAccount } from '../../types';

interface AdminUsersTabProps {
  users: UserAccount[];
  onToggleVip: (user: UserAccount) => void;
  onBan: (userId: string, reason: string, durationMinutes: number) => void;
  onUnban: (userId: string) => void;
  onDelete: (userId: string) => void;
  onUpdateLimit: (userId: string, limit: number) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onToggleVip,
  onBan,
  onUnban,
  onDelete,
  onUpdateLimit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Manage user access levels, quotas, and security restrictions.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700">
              <Activity className="w-4 h-4" />
              <span>{users.filter(u => u.isOnline).length} Active Now</span>
           </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 transition-all text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 transition-all text-sm outline-none font-bold text-slate-700"
          >
            <option value="All">All Roles</option>
            <option value="user">Standard Users</option>
            <option value="admin">Administrators</option>
            <option value="ceo">CEO</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Security & Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quota</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner ${
                            u.role === 'ceo' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            u.role === 'admin' ? 'bg-slate-900 text-white' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          {u.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="text-xs font-bold text-slate-900">{u.name}</p>
                             {u.isVip && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                             u.role === 'ceo' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                             u.role === 'admin' ? 'bg-slate-900 text-white border-slate-800' :
                             'bg-slate-100 text-slate-600 border-slate-200'
                           }`}>
                             {u.role}
                           </span>
                           {u.isBanned && (
                             <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-black uppercase tracking-widest">
                               Suspended
                             </span>
                           )}
                        </div>
                        {u.isBanned && u.bannedUntil && (
                           <p className="text-[9px] text-rose-500 font-bold">Suspended until: {new Date(u.bannedUntil).toLocaleString()}</p>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 tabular-nums">{u.submissionLimit || 1}</span>
                        <div className="flex flex-col">
                           <button 
                             onClick={() => onUpdateLimit(u.id, (u.submissionLimit || 1) + 1)}
                             className="text-[8px] text-slate-400 hover:text-blue-500"
                           >▲</button>
                           <button 
                             onClick={() => onUpdateLimit(u.id, Math.max(1, (u.submissionLimit || 1) - 1))}
                             className="text-[8px] text-slate-400 hover:text-rose-500"
                           >▼</button>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onToggleVip(u)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            u.isVip ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={u.isVip ? "Permanent VIP Status" : "Promote to VIP"}
                        >
                           <Crown className="w-4.5 h-4.5" />
                        </button>
                        
                        {u.isBanned ? (
                          <button 
                            onClick={() => onUnban(u.id)}
                            className="p-2 rounded-xl text-emerald-600 bg-emerald-50 border border-emerald-100 transition-colors cursor-pointer"
                            title="Unsuspend Account"
                          >
                             <Unlock className="w-4.5 h-4.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              const reason = window.prompt('Suspension Reason:');
                              const duration = window.prompt('Duration in Minutes (default 60):', '60');
                              if (reason) onBan(u.id, reason, parseInt(duration || '60'));
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Suspend Account"
                          >
                             <Ban className="w-4.5 h-4.5" />
                          </button>
                        )}

                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        
                        <button 
                          onClick={() => onDelete(u.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete User Record"
                          disabled={u.role === 'ceo'}
                        >
                           <Trash2 className="w-4.5 h-4.5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
