import React, { useState, useMemo } from 'react';
import {
  Crown,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  LayoutGrid,
  List,
  Copy,
  Check,
  Eye,
  FileDown,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { FormSubmission } from '../../types';
import { QueueSubFilter, QueueSortOrder } from './types';

interface CEOQueueTabProps {
  submissions: FormSubmission[];
  vipUserIds: string[];
  onSelectSubmission: (sub: FormSubmission) => void;
  onQuickApprove: (id: string) => void;
  onOpenRejectModal: (sub: FormSubmission) => void;
  onCertifySubmission: (sub: FormSubmission) => void;
  onOpenPdfCertificate: (sub: FormSubmission) => void;
}

export const CEOQueueTab: React.FC<CEOQueueTabProps> = ({
  submissions,
  vipUserIds,
  onSelectSubmission,
  onQuickApprove,
  onOpenRejectModal,
  onCertifySubmission,
  onOpenPdfCertificate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<QueueSubFilter>('all');
  const [sortOrder, setSortOrder] = useState<QueueSortOrder>('newest');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy helper
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        // Search term check
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = sub.userName?.toLowerCase().includes(term);
          const matchEmail = sub.userEmail?.toLowerCase().includes(term);
          const matchTitle = sub.formTitle?.toLowerCase().includes(term);
          const matchId = sub.id?.toLowerCase().includes(term);
          if (!matchName && !matchEmail && !matchTitle && !matchId) {
            return false;
          }
        }

        const isVip = sub.isVipSubmission || vipUserIds.includes(sub.userId || '');
        const isApprovedByCeo =
          sub.status === 'Approved' && (sub.approvedByCeo || sub.isCertified);

        // Sub filter
        if (activeFilter === 'pending') {
          return sub.status === 'Pending Review' || sub.status === 'Under Evaluation';
        }
        if (activeFilter === 'vip') {
          return isVip;
        }
        if (activeFilter === 'approved_by_ceo') {
          return isApprovedByCeo;
        }
        if (activeFilter === 'approved') {
          return sub.status === 'Approved';
        }
        if (activeFilter === 'escalated') {
          return sub.isSentToCeo || sub.requestCeoReview;
        }
        if (activeFilter === 'certified') {
          return sub.isCertified;
        }
        if (activeFilter === 'action_required') {
          return sub.status === 'Action Required';
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortOrder === 'oldest') {
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        }
        if (sortOrder === 'vip_first') {
          const aVip = a.isVipSubmission || vipUserIds.includes(a.userId || '');
          const bVip = b.isVipSubmission || vipUserIds.includes(b.userId || '');
          if (aVip && !bVip) return -1;
          if (!aVip && bVip) return 1;
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortOrder === 'pending_first') {
          const aPending = a.status === 'Pending Review' || a.status === 'Under Evaluation';
          const bPending = b.status === 'Pending Review' || b.status === 'Under Evaluation';
          if (aPending && !bPending) return -1;
          if (!aPending && bPending) return 1;
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        return 0;
      });
  }, [submissions, searchTerm, activeFilter, sortOrder, vipUserIds]);

  const counts = useMemo(() => {
    return {
      all: submissions.length,
      pending: submissions.filter(
        (s) => s.status === 'Pending Review' || s.status === 'Under Evaluation'
      ).length,
      vip: submissions.filter((s) => s.isVipSubmission || vipUserIds.includes(s.userId || '')).length,
      approved_by_ceo: submissions.filter(
        (s) => s.status === 'Approved' && (s.approvedByCeo || s.isCertified)
      ).length,
      escalated: submissions.filter((s) => s.isSentToCeo || s.requestCeoReview).length,
      certified: submissions.filter((s) => s.isCertified).length,
    };
  }, [submissions, vipUserIds]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, client name, email, or form title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Sorting & View Mode */}
          <div className="flex items-center gap-2.5">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as QueueSortOrder)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="vip_first">Sort: VIP Priority First</option>
              <option value="pending_first">Sort: Pending Review First</option>
            </select>

            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Submissions ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Pending Review ({counts.pending})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('vip')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'vip'
                ? 'bg-yellow-500 text-slate-950'
                : 'bg-slate-950 text-yellow-400/80 hover:text-yellow-300 border border-slate-800'
            }`}
          >
            <Crown className="w-3 h-3 fill-yellow-400" />
            VIP Priority ({counts.vip})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('approved_by_ceo')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'approved_by_ceo'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-950 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Approved by CEO Tag ({counts.approved_by_ceo})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('escalated')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'escalated'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Forwarded by Admin ({counts.escalated})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('certified')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeFilter === 'certified'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-amber-300/80 hover:text-amber-200 border border-slate-800'
            }`}
          >
            <Award className="w-3 h-3" />
            Certified ({counts.certified})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Submissions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no filings matching your active search or filter criteria. Try clearing search or selecting a different category.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((sub) => {
            const isVip = sub.isVipSubmission || vipUserIds.includes(sub.userId || '');
            const isApprovedByCeo =
              sub.status === 'Approved' && (sub.approvedByCeo || sub.isCertified);

            return (
              <div
                key={sub.id}
                className={`bg-slate-900 rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 hover:shadow-xl ${
                  isVip
                    ? 'border-yellow-500/50 bg-gradient-to-b from-slate-900 to-yellow-950/20'
                    : isApprovedByCeo
                    ? 'border-emerald-500/40'
                    : 'border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-white text-sm">
                          {sub.userName}
                        </h4>
                        {isVip && (
                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 flex items-center gap-0.5 shadow-xs">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" />
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{sub.userEmail}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-1">
                      {isApprovedByCeo ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-slate-950 flex items-center gap-1 shadow-xs">
                          <Crown className="w-2.5 h-2.5 fill-slate-950" />
                          Approved by CEO
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : sub.status === 'Rejected'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      )}

                      {sub.isCertified && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" />
                          Certified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Form Details */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {sub.formTitle}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Filing: {sub.templateId}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(sub.id, e)}
                        className="font-mono text-[10px] text-slate-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                        title="Copy Filing ID"
                      >
                        #{sub.id.slice(-6)}
                        {copiedId === sub.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {sub.statusNotes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                      &ldquo;{sub.statusNotes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onSelectSubmission(sub)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* PDF Download Button (Active if approved/certified) */}
                    {sub.status === 'Approved' && (
                      <button
                        type="button"
                        onClick={() => onOpenPdfCertificate(sub)}
                        className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
                        title="Download Advanced PDF Certificate"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    )}

                    {/* Reject Button */}
                    <button
                      type="button"
                      onClick={() => onOpenRejectModal(sub)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                      title="Reject & Remove Filing"
                    >
                      Reject
                    </button>

                    {/* Quick Approve Button */}
                    {sub.status !== 'Approved' && (
                      <button
                        type="button"
                        onClick={() => onQuickApprove(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Filing ID</th>
                  <th className="py-3.5 px-4">Submitter</th>
                  <th className="py-3.5 px-4">Form & Category</th>
                  <th className="py-3.5 px-4">Status & Clearance</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubmissions.map((sub) => {
                  const isVip = sub.isVipSubmission || vipUserIds.includes(sub.userId || '');
                  const isApprovedByCeo =
                    sub.status === 'Approved' && (sub.approvedByCeo || sub.isCertified);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(sub.id, e)}
                          className="hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                        >
                          #{sub.id.slice(-6)}
                          {copiedId === sub.id && <Check className="w-3 h-3 text-emerald-400" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{sub.userName}</span>
                          {isVip && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-yellow-500 text-slate-950">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{sub.userEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-200">{sub.formTitle}</p>
                        <p className="text-[10px] text-slate-500">{sub.templateId}</p>
                      </td>
                      <td className="py-3 px-4">
                        {isApprovedByCeo ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-slate-950 inline-flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" />
                            Approved by CEO
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'Approved'
                                ? 'bg-emerald-950 text-emerald-400'
                                : sub.status === 'Rejected'
                                ? 'bg-rose-950 text-rose-400'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {sub.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectSubmission(sub)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Inspect
                          </button>
                          {sub.status === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => onOpenPdfCertificate(sub)}
                              className="p-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                              title="PDF Certificate"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {sub.status !== 'Approved' && (
                            <button
                              type="button"
                              onClick={() => onQuickApprove(sub.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenRejectModal(sub)}
                            className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs"
                          >
                            Reject
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
      )}
    </div>
  );
};
