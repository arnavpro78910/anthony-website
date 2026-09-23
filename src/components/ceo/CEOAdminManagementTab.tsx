import React, { useState } from 'react';
import {
  UserCog,
  ShieldCheck,
  UserPlus,
  Lock,
  Trash2,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { UserAccount } from '../../types';
import { verifyCeoPassword } from '../../utils/storage';

interface CEOAdminManagementTabProps {
  admins: UserAccount[];
  onCreateAdmin: (
    name: string,
    email: string,
    username: string,
    pass: string,
    controlLevel: 'half' | 'full'
  ) => boolean;
  onUpdateAdminControl: (userId: string, controlLevel: 'half' | 'full') => void;
  onDeleteAdmin: (userId: string) => void;
  onBanAdmin: (userId: string) => void;
  onUnbanAdmin: (userId: string) => void;
}

export const CEOAdminManagementTab: React.FC<CEOAdminManagementTabProps> = ({
  admins,
  onCreateAdmin,
  onUpdateAdminControl,
  onDeleteAdmin,
  onBanAdmin,
  onUnbanAdmin,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [controlLevel, setControlLevel] = useState<'half' | 'full'>('full');
  const [ceoPass, setCeoPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verifyCeoPassword(ceoPass.trim())) {
      setErrorMsg('Incorrect CEO password. Action rejected.');
      return;
    }

    const success = onCreateAdmin(name.trim(), email.trim(), username.trim(), password.trim(), controlLevel);
    if (success) {
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setCeoPass('');
    } else {
      setErrorMsg('Failed to create admin. Username or email may already exist.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Internal Governance & Staff Hierarchy
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <UserCog className="w-5 h-5 text-amber-400" />
            <span>Administrative Command Structure</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Delegate operational access, provision admin staff accounts, set permissions ('Full' vs 'Half' control), and govern system operators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Admin</span>
        </button>
      </div>

      {/* Admin List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((admin) => {
          const isCeo = admin.role === 'ceo';
          const isBanned = admin.isBanned;
          const currentControl = admin.adminControlLevel || 'full';

          return (
            <div
              key={admin.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {admin.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{admin.name}</h4>
                      <p className="text-xs text-slate-400">{admin.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isCeo
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isCeo ? 'CEO' : 'ADMIN'}
                  </span>
                </div>

                {!isCeo && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Control Scope:</span>
                      <select
                        value={currentControl}
                        onChange={(e) =>
                          onUpdateAdminControl(admin.id, e.target.value as 'half' | 'full')
                        }
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs"
                      >
                        <option value="full">Full Control</option>
                        <option value="half">Half Control</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {!isCeo && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  {isBanned ? (
                    <button
                      type="button"
                      onClick={() => onUnbanAdmin(admin.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 font-semibold"
                    >
                      Restore Access
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onBanAdmin(admin.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 font-semibold"
                    >
                      Suspend
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteAdmin(admin.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300"
                    title="Remove Admin Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Provision Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>Provision New Administrator</span>
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anthonyindia.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Login Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin_ops"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Control Level</label>
                  <select
                    value={controlLevel}
                    onChange={(e) => setControlLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="full">Full Access</option>
                    <option value="half">Half Access</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Initial Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <label className="text-amber-400 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>CEO Password Verification (Security Gate)</span>
                </label>
                <input
                  type="password"
                  value={ceoPass}
                  onChange={(e) => setCeoPass(e.target.value)}
                  placeholder="Enter your CEO password to authorize"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                >
                  Authorize & Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
