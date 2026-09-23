import React, { useState } from 'react';
import { Search, Download, Trash2, ExternalLink, Filter, Eye, CheckCircle, Clock, AlertTriangle, FileText, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { FormSubmission, CompanyBranding } from '../types';
import { exportToCSV } from '../utils/storage';

interface SubmissionsListProps {
  submissions: FormSubmission[];
  branding: CompanyBranding;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: FormSubmission['status'], notes?: string) => void;
  onFillNewForm: () => void;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  branding,
  onDelete,
  onStatusChange,
  onFillNewForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeModalSubmission, setActiveModalSubmission] = useState<FormSubmission | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const filtered = submissions.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userName && item.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      JSON.stringify(item.data).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: FormSubmission['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'Under Evaluation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            Under Evaluation
          </span>
        );
      case 'Acknowledged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Acknowledged
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Action Required
          </span>
        );
      case 'Pending Review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  const handleUpdateStatusWithNote = (id: string, newStatus: FormSubmission['status']) => {
    onStatusChange(id, newStatus, reviewNoteInput || undefined);
    if (activeModalSubmission && activeModalSubmission.id === id) {
      setActiveModalSubmission({
        ...activeModalSubmission,
        status: newStatus,
        statusNotes: reviewNoteInput || activeModalSubmission.statusNotes,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" id="submissions-log-page">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Company Submissions Archive
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {submissions.length} Total Logs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time administrative ledger of all corporate form filings with verified submitter accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {submissions.length > 0 && (
            <button
              id="export-csv-btn"
              type="button"
              onClick={() => exportToCSV(filtered)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            id="new-submission-nav-btn"
            type="button"
            onClick={onFillNewForm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
          >
            <span>+ Fill Company Form</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="submissions-search-input"
            type="text"
            placeholder="Search by Tracking ID, Submitter Name, Email, or Field Details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Evaluation">Under Evaluation</option>
            <option value="Approved">Approved</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Action Required">Action Required</option>
          </select>
        </div>
      </div>

      {/* List or Empty State */}
      {submissions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Submissions Yet
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Fill out your company's official form to see recorded submissions here.
          </p>
          <button
            type="button"
            onClick={onFillNewForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Fill a Form Now
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 shadow-2xs">
          No submissions matched your search query or filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Tracking ID</th>
                  <th className="px-5 py-3.5">Submitter Account</th>
                  <th className="px-5 py-3.5">Form Title</th>
                  <th className="px-5 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">
                      {item.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{item.userName || 'Account Submitter'}</div>
                      <div className="text-[11px] text-slate-400">{item.userEmail}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.formTitle}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalSubmission(item);
                          setReviewNoteInput(item.statusNotes || '');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Update</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete submission ${item.id}? This will also restore submission allowance for user ${item.userEmail}.`)) {
                            onDelete(item.id);
                          }
                        }}
                        title="Delete record"
                        className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Review & Detail Inspection Modal */}
      {activeModalSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                    {activeModalSubmission.id}
                  </span>
                  <span className="text-xs text-slate-400">Official Filing Inspection</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activeModalSubmission.formTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalSubmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Submitter Credentials */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block font-medium">Submitter User</span>
                  <span className="font-semibold text-slate-800 text-sm">{activeModalSubmission.userName}</span>
                  <span className="text-slate-500 block">{activeModalSubmission.userEmail}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Submitted At</span>
                  <span className="font-medium text-slate-700">
                    {new Date(activeModalSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
                <label className="block font-bold text-blue-950 uppercase tracking-wider text-[11px] mb-2">
                  Update Official Processing Status:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(['Pending Review', 'Under Evaluation', 'Approved', 'Acknowledged', 'Action Required'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatusWithNote(activeModalSubmission.id, st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        activeModalSubmission.status === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Reviewer Notes for User (Visible in user account dashboard):
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNoteInput}
                    onChange={(e) => setReviewNoteInput(e.target.value)}
                    placeholder="Provide evaluation notes, feedback, or scheduling details..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateStatusWithNote(activeModalSubmission.id, activeModalSubmission.status)}
                    className="mt-2 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                  >
                    Save Reviewer Note
                  </button>
                </div>
              </div>

              {/* Form Data Fields */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Submitted Field Answers
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                  {Object.entries(activeModalSubmission.data).map(([key, val]) => {
                    if (val === null || val === undefined || val === '') return null;

                    let displayVal: React.ReactNode = String(val);
                    if (typeof val === 'boolean') {
                      displayVal = val ? 'Yes' : 'No';
                    } else if (typeof val === 'object' && 'name' in (val as any)) {
                      displayVal = `Attached Document: ${(val as any).name}`;
                    }

                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());

                    return (
                      <div key={key} className="grid grid-cols-3 p-3 text-xs">
                        <span className="font-semibold text-slate-500">{formattedKey}</span>
                        <span className="col-span-2 text-slate-900 font-medium break-words">
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalSubmission(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
