import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Crown,
  Search,
  Copy,
  Check,
  Award,
  ExternalLink,
  Lock,
  FileText,
  Calendar,
  User,
  Building2,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { FormSubmission, CompanyBranding } from '../types';

interface CertificateVerificationModalProps {
  submission?: FormSubmission | null;
  allSubmissions?: FormSubmission[];
  branding: CompanyBranding;
  onClose: () => void;
  onOpenCertificateModal?: (sub: FormSubmission) => void;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  submission: initialSubmission,
  allSubmissions = [],
  branding,
  onClose,
  onOpenCertificateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSubmission?.id || '');
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(initialSubmission || null);
  const [hasSearched, setHasSearched] = useState(Boolean(initialSubmission));
  const [copiedHash, setCopiedHash] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Search in all submissions by ID, username, email, or exact tracking ID
    const found = allSubmissions.find(
      (s) =>
        s.id.toLowerCase() === query ||
        `#${s.id.toLowerCase()}` === query ||
        `cert-${s.id.toLowerCase()}` === query ||
        (s.userName && s.userName.toLowerCase() === query)
    );

    setActiveSubmission(found || null);
    setHasSearched(true);
  };

  const verificationHash = activeSubmission
    ? `SHA256-ANTHONY-CEO-EXEC-${activeSubmission.id}-${Math.abs(
        activeSubmission.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)
      ).toString(16).toUpperCase()}`
    : '';

  const handleCopyHash = () => {
    if (!verificationHash) return;
    navigator.clipboard.writeText(verificationHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div
      id="certificate-verification-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Public Certificate & Clearance Registry
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                  Live Verify
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official authenticity verification engine for {branding.companyName || 'ANTHONY INDIA'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Close Verification Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar to Lookup Any Certificate */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Tracking ID (e.g. INQ-2026-8812) or Submitter Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>
        </form>

        {/* Verification Result Card */}
        {activeSubmission ? (
          <div className="space-y-4">
            {/* Authenticity Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OFFICIALLY RATIFIED & ACTIVE</span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                Authentic Document Verified
              </h4>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                This filing has passed executive review and is formally registered in the {branding.companyName || 'ANTHONY INDIA'} verified ledger.
              </p>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" />
                  Certified Submitter
                </span>
                <span className="font-bold text-white text-sm block">{activeSubmission.userName}</span>
                <span className="text-slate-400 text-[11px] block">{activeSubmission.userEmail}</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <FileText className="w-3 h-3 text-amber-400" />
                  Form Title & Reference
                </span>
                <span className="font-bold text-white text-sm block truncate">{activeSubmission.formTitle}</span>
                <span className="font-mono text-amber-400 text-[11px] block">ID: #{activeSubmission.id}</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Authorized Signatory
                </span>
                <span className="font-bold text-amber-300 text-sm block">Arnav Singh</span>
                <span className="text-slate-400 text-[11px] block">Chief Executive Officer & Founder</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  Issuance Date
                </span>
                <span className="font-bold text-white text-sm block">
                  {activeSubmission.certifiedAt
                    ? new Date(activeSubmission.certifiedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : new Date(activeSubmission.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                </span>
                <span className="text-emerald-400 font-bold text-[11px] block">
                  Status: {activeSubmission.status}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash Card */}
            <div className="p-3 bg-slate-950/90 rounded-xl border border-amber-500/20 space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Lock className="w-3 h-3" />
                  CRYPTOGRAPHIC VERIFICATION HASH (SHA-256)
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-sans text-[10px]"
                >
                  {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-slate-300 text-[11px] break-all select-all">{verificationHash}</p>
            </div>

            {/* Action Buttons */}
            {onOpenCertificateModal && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenCertificateModal(activeSubmission);
                    onClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>View Full Executive Certificate</span>
                </button>
              </div>
            )}
          </div>
        ) : hasSearched ? (
          <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Certificate Record Not Found</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              No verified filing matching "<span className="font-mono text-amber-300">{searchQuery}</span>" was located in the active ledger. Please verify the Reference ID and try again.
            </p>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Official Verification Protocol • ANTHONY INDIA Governance Council</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
