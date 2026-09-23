import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  XCircle,
  FileDown,
  Printer,
  Clock,
  User,
  Mail,
  Calendar,
  Sparkles,
  Award,
  FileText,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { FormSubmission, CompanyBranding } from '../../types';

interface CEOSubmissionModalProps {
  submission: FormSubmission;
  branding: CompanyBranding;
  isVip: boolean;
  onClose: () => void;
  onApprove: (id: string, note?: string) => void;
  onOpenReject: (sub: FormSubmission) => void;
  onOpenPdf: (sub: FormSubmission) => void;
}

export const CEOSubmissionModal: React.FC<CEOSubmissionModalProps> = ({
  submission,
  branding,
  isVip,
  onClose,
  onApprove,
  onOpenReject,
  onOpenPdf,
}) => {
  const [ceoNote, setCeoNote] = useState('');
  const [copied, setCopied] = useState(false);

  const isApprovedByCeo =
    submission.status === 'Approved' && (submission.approvedByCeo || submission.isCertified);

  const handleCopyId = () => {
    navigator.clipboard.writeText(submission.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-fadeIn">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-amber-400 font-mono">
              Filing #{submission.id}
            </span>
            {isVip && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3 fill-slate-950" />
                VIP Strategic Priority
              </span>
            )}
            {isApprovedByCeo ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-slate-950 flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3 fill-slate-950" />
                Approved by CEO
              </span>
            ) : (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  submission.status === 'Approved'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    : submission.status === 'Rejected'
                    ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}
              >
                {submission.status}
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-white">{submission.formTitle}</h2>

          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <strong className="text-slate-200">{submission.userName}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{submission.userEmail}</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(submission.submittedAt).toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Submitted Data Fields */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Client Intake Form Responses</span>
          </h3>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 divide-y divide-slate-800/80 max-h-72 overflow-y-auto space-y-3">
            {Object.entries(submission.data || {}).map(([key, val]) => (
              <div key={key} className="pt-2.5 first:pt-0 text-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </p>
                <div className="text-slate-100 font-medium mt-0.5 whitespace-pre-wrap break-words">
                  {typeof val === 'object' && val !== null ? (
                    <pre className="text-[10px] font-mono bg-slate-900 p-2 rounded-lg overflow-x-auto">
                      {JSON.stringify(val, null, 2)}
                    </pre>
                  ) : String(val).startsWith('data:image/') ? (
                    <div className="mt-1 max-w-xs rounded-xl overflow-hidden border border-slate-800">
                      <img src={String(val)} alt="Attachment" className="w-full object-contain max-h-48" />
                    </div>
                  ) : (
                    String(val || '—')
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification / Executive Note Block */}
        {submission.statusNotes && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/20 text-xs space-y-1">
            <p className="text-[10px] font-bold uppercase text-amber-400">
              Clearance & Evaluation Notes
            </p>
            <p className="text-slate-300 italic">&ldquo;{submission.statusNotes}&rdquo;</p>
          </div>
        )}

        {/* Decision Controls */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          {submission.status !== 'Approved' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Optional CEO Directive / Clearance Memo
              </label>
              <input
                type="text"
                value={ceoNote}
                onChange={(e) => setCeoNote(e.target.value)}
                placeholder="e.g. Cleared under VIP Executive Protocol by CEO Arnav Singh"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>

              <button
                type="button"
                onClick={handleCopyId}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* PDF Certificate Button if approved */}
              {submission.status === 'Approved' && (
                <button
                  type="button"
                  onClick={() => onOpenPdf(submission)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </button>
              )}

              {/* Reject button */}
              <button
                type="button"
                onClick={() => onOpenReject(submission)}
                className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject & Remove</span>
              </button>

              {/* Approve button */}
              {submission.status !== 'Approved' && (
                <button
                  type="button"
                  onClick={() => onApprove(submission.id, ceoNote)}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>Approve with CEO Tag</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
