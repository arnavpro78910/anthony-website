import React, { useState } from 'react';
import {
  Users,
  Search,
  Crown,
  Shield,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Sliders,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { UserAccount } from '../../types';

interface CEOUsersTabProps {
  users: UserAccount[];
  vipUserIds: string[];
  onToggleVipUser: (userId: string) => void;
  onUpdateUserQuota: (userId: string, limit: number) => void;
  onBanUser: (userId: string, durationMinutes: number, reason: string) => void;
  onUnbanUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const CEOUsersTab: React.FC<CEOUsersTabProps> = ({
  users,
  vipUserIds,
  onToggleVipUser,
  onUpdateUserQuota,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Show all non-CEO accounts (regular users, VIPs, and admin accounts)
  const nonCeoAccounts = users.filter((u) => u.role !== 'ceo');

  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'vip' | 'admin'>('all');
  const [banTargetUser, setBanTargetUser] = useState<UserAccount | null>(null);
  const [banDurationMinutes, setBanDurationMinutes] = useState<number>(60);
  const [banReason, setBanReason] = useState('');

  const filteredUsers = nonCeoAccounts.filter((u) => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(term);
      const matchEmail = u.email?.toLowerCase().includes(term);
      if (!matchName && !matchEmail) return false;
    }

    const isVip = u.isVip || vipUserIds.includes(u.id);

    if (roleFilter === 'admin') return u.role === 'admin';
    if (roleFilter === 'user') return u.role !== 'admin' && !isVip;
    if (roleFilter === 'vip') return isVip;

    return true;
  });

  const handleExecuteBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banTargetUser) return;
    onBanUser(banTargetUser.id, banDurationMinutes, banReason || 'CEO administrative suspension');
    setBanTargetUser(null);
    setBanReason('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Account Governance & VIP Quotas
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Client Directory & Filing Allowances</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Grant VIP Executive routing status, set individual filing intake limits (1 to 9), enforce access restrictions, and manage member credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-yellow-500/30 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <div className="text-xs">
              <span className="text-slate-400 font-medium">VIP Watchlist:</span>{' '}
              <strong className="text-amber-300 font-bold">{vipUserIds.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('vip')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                roleFilter === 'vip'
                  ? 'bg-yellow-500 text-slate-950'
                  : 'bg-slate-950 text-yellow-400/80 hover:text-yellow-300 border border-slate-800'
              }`}
            >
              <Crown className="w-3 h-3 fill-yellow-400" />
              VIP Only
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                roleFilter === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Standard Users
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-purple-400 hover:text-purple-300 border border-slate-800'
              }`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">VIP Status</th>
                <th className="py-3.5 px-4">Intake Quota</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isVip = u.isVip || vipUserIds.includes(u.id);
                const currentQuota = u.submissionLimit || 3;
                const isBanned = u.isBanned;

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {u.role || 'user'}
                      </span>
                    </td>

                    {/* VIP Toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onToggleVipUser(u.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                          isVip
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm border border-amber-300'
                            : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
                        }`}
                        title="Click to toggle VIP status"
                      >
                        <Crown className={`w-3 h-3 ${isVip ? 'fill-slate-950' : 'text-slate-500'}`} />
                        <span>{isVip ? 'VIP Active' : 'Make VIP'}</span>
                      </button>
                    </td>

                    {/* Quota Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={currentQuota}
                        onChange={(e) => onUpdateUserQuota(u.id, parseInt(e.target.value, 10))}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <option key={num} value={num}>
                            {num} Form{num > 1 ? 's' : ''} Max
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Account Status */}
                    <td className="py-3 px-4">
                      {isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/30">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isBanned ? (
                          <button
                            type="button"
                            onClick={() => onUnbanUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold cursor-pointer"
                          >
                            Lift Ban
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBanTargetUser(u)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Suspend User"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban User Modal */}
      {banTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Suspend Account: {banTargetUser.name}</span>
            </h3>

            <form onSubmit={handleExecuteBan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Suspension Duration</label>
                <select
                  value={banDurationMinutes}
                  onChange={(e) => setBanDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value={60}>1 Hour</option>
                  <option value={1440}>24 Hours</option>
                  <option value={10080}>7 Days</option>
                  <option value={43200}>30 Days</option>
                  <option value={525600}>1 Year (Permanent)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Reason for Suspension</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Violation of submission protocols..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanTargetUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
