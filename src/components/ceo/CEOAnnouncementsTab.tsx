import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Trash2,
  Clock,
  AlertTriangle,
  Crown,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react';
import { UserAccount } from '../../types';
import { loadUsers, getCompanyBranding } from '../../utils/storage';

interface CEOAnnouncementsTabProps {
  ceoUser: UserAccount;
  activeNotice: {
    id: string;
    title: string;
    body: string;
    type: string;
    createdAt: string;
    author: string;
    expiry: string;
  } | null;
  isEmergencyFreeze: boolean;
  onPublishNotice: (notice: {
    title: string;
    body: string;
    type: 'gold' | 'urgent' | 'info' | 'amber';
    expiry: '24h' | '7d' | 'permanent';
  }) => void;
  onClearNotice: () => void;
  onToggleEmergencyFreeze: () => void;
}

export const CEOAnnouncementsTab: React.FC<CEOAnnouncementsTabProps> = ({
  ceoUser,
  activeNotice,
  isEmergencyFreeze,
  onPublishNotice,
  onClearNotice,
  onToggleEmergencyFreeze,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'gold' | 'urgent' | 'info' | 'amber'>('gold');
  const [expiry, setExpiry] = useState<'24h' | '7d' | 'permanent'>('7d');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [broadcastPreviewUrl, setBroadcastPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onPublishNotice({ title: title.trim(), body: body.trim(), type, expiry });

    // Send broadcast email to all users if email notifications are enabled
    try {
      const branding = getCompanyBranding();
      if (branding.emailNotificationsEnabled === false) {
        setBroadcastStatus('Notice published on portal. Email dispatch skipped (notifications muted in CEO settings).');
      } else {
        const users = loadUsers();
        const emails = users.map(u => u.email).filter(Boolean) as string[];
        if (emails.length > 0) {
          let customSmtp: any = undefined;
          try {
            const customSmtpRaw = localStorage.getItem('company_custom_smtp_settings');
            if (customSmtpRaw) {
              const parsed = JSON.parse(customSmtpRaw);
              if (parsed.enabled) {
                customSmtp = parsed;
              }
            }
          } catch {}

          const res = await fetch('/api/send-admin-broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title.trim(),
              body: body.trim(),
              recipients: emails,
              companyName: branding.companyName || 'Anthony India',
              customSmtp,
            })
          });
          const data = await res.json();
          if (data.success) {
            setBroadcastStatus('Notice published & broadcast email sent to ' + emails.length + ' registered user(s)!');
            if (data.previewUrl) {
              setBroadcastPreviewUrl(data.previewUrl);
            } else {
              setBroadcastPreviewUrl(null);
            }
          } else {
            setBroadcastStatus('Notice published on portal.');
          }
        } else {
          setBroadcastStatus('Notice published on portal.');
        }
      }
    } catch (err) {
      setBroadcastStatus('Notice published on portal.');
    }

    setTitle('');
    setBody('');
    setTimeout(() => setBroadcastStatus(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Portal Communications & Emergency Signals
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Executive Broadcast Command</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Broadcast authoritative company bulletins directly to all user dashboards and client viewports with top-level priority styling.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Broadcast Composer */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Compose Executive Notice</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Broadcast Headline</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule Update: Quarterly Executive Filing Audits"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Notice Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write full executive announcement text here..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Style & Priority Tone</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setType('gold')}
                    className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'gold'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Gold VIP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('urgent')}
                    className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'urgent'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Urgent Red</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('info')}
                    className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'info'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Informational</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('amber')}
                    className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'amber'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Amber Alert</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Broadcast Duration</label>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="24h">Active for 24 Hours</option>
                  <option value="7d">Active for 7 Days</option>
                  <option value="permanent">Persistent / No Expiry</option>
                </select>
              </div>
            </div>

            {broadcastStatus && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300">
                {broadcastStatus}
              </div>
            )}

            {broadcastPreviewUrl && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-1.5 shadow-md">
                <span className="block font-bold">🧪 DEV ENVIRONMENT DIRECT DISPATCH</span>
                <span className="block text-[11px] text-slate-300 leading-normal">
                  Your broadcast announcement has been successfully transmitted via Ethereal Mail.
                </span>
                <a 
                  href={broadcastPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 hover:underline pt-1 text-xs"
                >
                  <span>Click Here to View Sent Broadcast Emails ↗</span>
                </a>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Publish Portal Broadcast</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Active Broadcast & Emergency Freeze */}
        <div className="space-y-6">
          {/* Active Broadcast Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Current Live Bulletin</span>
            </h3>

            {activeNotice ? (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  activeNotice.type === 'urgent'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : activeNotice.type === 'info'
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-white">{activeNotice.title}</h4>
                  <button
                    type="button"
                    onClick={onClearNotice}
                    className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Remove Broadcast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{activeNotice.body}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Author: {ceoUser.name || 'Arnav Singh'}</span>
                  <span>{new Date(activeNotice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                No active executive broadcast currently running on the portal.
              </div>
            )}
          </div>

          {/* Emergency Freeze */}
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Emergency Intake Lockdown</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate lockdown if an audit or system maintenance requires immediately preventing all new client form submissions.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onToggleEmergencyFreeze}
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isEmergencyFreeze
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-rose-400 border border-rose-500/40'
                }`}
              >
                {isEmergencyFreeze ? 'LIFT EMERGENCY LOCKDOWN' : 'ACTIVATE EMERGENCY FREEZE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
