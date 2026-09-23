import React, { useState } from 'react';
import {
  CheckCircle,
  Printer,
  Download,
  ArrowRight,
  Copy,
  Check,
  Building2,
  Calendar,
  Hash,
  LayoutDashboard,
  Search,
  Home
} from 'lucide-react';
import { FormSubmission, CompanyBranding, UserAccount } from '../types';

interface SubmissionSuccessProps {
  submission: FormSubmission;
  branding: CompanyBranding;
  currentUser: UserAccount | null;
  onViewAccountDashboard: () => void;
  onViewAllSubmissions: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  submission,
  branding,
  currentUser,
  onViewAccountDashboard,
  onViewAllSubmissions,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(submission.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submission, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${submission.id}_official_receipt.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-3 sm:px-4 animate-fade-in" id="submission-confirmation-receipt">
      <div className="enterprise-card overflow-hidden print:border-none print:shadow-none animate-fade-in">
        {/* Official Header Banner */}
        <div className="bg-[#0b1329] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" />
                Submission Successful!
              </span>
              <span className="text-slate-400 text-xs font-mono">• Officially Received & Logged</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Application Officially Received
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Thank you for submitting to <strong className="text-white">{branding.companyName || 'our corporate portal'}</strong>. Your application has been logged into our intake system.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 sm:text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Reference Tracking ID
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-base font-bold text-blue-400">
                {submission.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy reference ID"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Corporate Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Form Category</span>
            <span className="font-semibold text-slate-800">{submission.formTitle}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Submitter Account</span>
            <span className="font-semibold text-slate-800">{submission.userName}</span>
            <span className="text-slate-500 text-[10px] block truncate">{submission.userEmail}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Submission Date & Time</span>
            <span className="font-semibold text-slate-800">
              {new Date(submission.submittedAt).toLocaleDateString()}
            </span>
            <span className="text-slate-500 text-[10px] block">
              {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Processing Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {submission.status}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Submission Fields Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Submitted Information Summary
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 divide-y divide-slate-200/60 text-xs overflow-hidden">
              {Object.entries(submission.data).map(([key, value]) => {
                const readableKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                
                let renderedValue = String(value);
                if (typeof value === 'boolean') {
                  renderedValue = value ? 'Yes / Agreed' : 'No';
                } else if (typeof value === 'object' && value !== null) {
                  renderedValue = (value as any).name || JSON.stringify(value);
                }

                return (
                  <div key={key} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-colors">
                    <span className="font-semibold text-slate-500 text-xs shrink-0">{readableKey}</span>
                    <div className="flex items-center gap-2 text-right min-w-0 justify-end">
                      <span className="text-slate-900 font-bold text-xs break-all sm:break-normal">{renderedValue}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Receipt Utilities (Print & Download JSON) */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              id="receipt-print-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              id="receipt-json-download-btn"
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Two Big Prominent Option Buttons as requested by User */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
            <button
              id="success-track-application-btn"
              type="button"
              onClick={onViewAllSubmissions}
              className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-98"
            >
              <Search className="w-4 h-4" />
              <span>Track Application</span>
            </button>

            <button
              id="success-back-to-dashboard-btn"
              type="button"
              onClick={onViewAccountDashboard}
              className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/20 transition-all cursor-pointer active:scale-98"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
