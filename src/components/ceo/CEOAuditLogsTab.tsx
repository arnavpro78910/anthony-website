import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  Shield,
  User,
  Clock,
  Trash2
} from 'lucide-react';
import { ActivityLog } from '../../types';

interface CEOAuditLogsTabProps {
  activityLogs: ActivityLog[];
  onRefresh: () => void;
}

export const CEOAuditLogsTab: React.FC<CEOAuditLogsTabProps> = ({
  activityLogs,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.type?.toLowerCase().includes(term) ||
      log.userName?.toLowerCase().includes(term) ||
      log.userEmail?.toLowerCase().includes(term) ||
      log.details?.toLowerCase().includes(term)
    );
  });

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `executive_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Immutable Security Ledger & Audit History
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <ScrollText className="w-5 h-5 text-amber-400" />
            <span>Executive Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Track user logins, submission approvals, status changes, executive credential modifications, and governance updates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLogs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export JSON Audit Log</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit actions by keyword, user email, or event details..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Audit List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No audit records found matching your query.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-200 uppercase tracking-wide text-xs">{log.type.replace('_', ' ')}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400">
                      {log.device || 'PORTAL'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold">{log.userName || log.userEmail || 'System'}</span> • {log.details}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 font-mono shrink-0 sm:text-right">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
