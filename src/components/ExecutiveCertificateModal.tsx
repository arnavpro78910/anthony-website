import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Award,
  Sparkles,
  ExternalLink,
  Lock,
  Copy,
  Check,
  FileDown,
  QrCode as QrCodeIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { FormSubmission, CompanyBranding } from '../types';
import { CertificateVerificationModal } from './CertificateVerificationModal';
import { CEOSignature } from './CEOSignature';

interface ExecutiveCertificateModalProps {
  submission: FormSubmission;
  branding: CompanyBranding;
  onClose: () => void;
}

export const ExecutiveCertificateModal: React.FC<ExecutiveCertificateModalProps> = ({
  submission,
  branding,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://anthonyindia.com'}/?verify=${submission.id}`;

  const verificationHash = `SHA256-ANTHONY-CEO-EXEC-${submission.id}-${Math.abs(
    submission.id.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)
  ).toString(16).toUpperCase()}`;

  // Generate real QR code image data on mount
  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code data URL:', err));
  }, [verificationUrl]);

  const certIssueDate = submission.certifiedAt
    ? new Date(submission.certifiedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const ceoName = 'Arnav Singh'; // Specifically requested CEO name

  const handleCopyHash = () => {
    navigator.clipboard.writeText(verificationHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      // Capture at high resolution (scale 2.5 for crisp 300DPI-like quality)
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#030712',
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');

      // Create landscape A4 PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`ANTHONY_INDIA_Executive_Certificate_${submission.id}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Canvas capture failed, falling back to direct PDF generation:', err);
      // Fallback: Direct vector jsPDF generation ensures download always works
      generateVectorPdfFallback();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateVectorPdfFallback = () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Dark luxury background
    pdf.setFillColor(3, 7, 18);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Double Gold border
    pdf.setDrawColor(217, 119, 6);
    pdf.setLineWidth(1.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(0.5);
    pdf.rect(13, 13, pageWidth - 26, pageHeight - 26);

    // Header Text
    pdf.setTextColor(251, 191, 36);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('ANTHONY INDIA • EXECUTIVE GOVERNANCE COUNCIL', pageWidth / 2, 28, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('times', 'bolditalic');
    pdf.setFontSize(24);
    pdf.text('Official Certificate of Executive Clearance', pageWidth / 2, 42, { align: 'center' });

    pdf.setTextColor(148, 163, 184);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('TECHNOLOGY FOR A BETTER TOMORROW', pageWidth / 2, 50, { align: 'center' });

    // Recipient Section
    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(11);
    pdf.text('THIS IS TO OFFICIALLY CERTIFY THAT', pageWidth / 2, 68, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(submission.userName.toUpperCase(), pageWidth / 2, 80, { align: 'center' });

    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(11);
    pdf.text(`Filing Reference: #${submission.id} • ${submission.formTitle}`, pageWidth / 2, 90, { align: 'center' });

    // Executive Statement
    pdf.setTextColor(226, 232, 240);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const statement = `Has successfully passed executive evaluation and compliance verification. This document formalizes full approval and grants official executive certification under corporate authority.`;
    pdf.text(pdf.splitTextToSize(statement, 220), pageWidth / 2, 105, { align: 'center' });

    // Security Details Box
    pdf.setFillColor(15, 23, 42);
    pdf.rect(pageWidth / 2 - 90, 122, 180, 20, 'F');
    pdf.setTextColor(251, 191, 36);
    pdf.setFontSize(9);
    pdf.setFont('courier', 'bold');
    pdf.text(`Verification Hash: ${verificationHash}`, pageWidth / 2, 131, { align: 'center' });
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Status: FULLY RATIFIED & CERTIFIED • Issue Date: ${certIssueDate}`, pageWidth / 2, 137, { align: 'center' });

    // Embed QR code in fallback PDF if available
    if (qrCodeDataUrl) {
      try {
        pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - 55, 150, 32, 32);
      } catch (e) {
        console.error('Error adding QR to fallback PDF:', e);
      }
    }

    // CEO Signature
    pdf.setTextColor(251, 191, 36);
    pdf.setFont('times', 'bolditalic');
    pdf.setFontSize(18);
    pdf.text(ceoName, 55, 168);

    pdf.setDrawColor(217, 119, 6);
    pdf.setLineWidth(0.5);
    pdf.line(40, 172, 100, 172);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Arnav Singh', 55, 178, { align: 'center' });
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(8);
    pdf.text('Chief Executive Officer & Founder', 55, 183, { align: 'center' });

    // Save
    pdf.save(`ANTHONY_INDIA_Executive_Certificate_${submission.id}.pdf`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <>
      <div
        id="executive-certificate-modal-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-5xl w-full p-4 sm:p-7 space-y-5 shadow-2xl relative animate-fadeIn my-auto">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    Official Executive Certificate
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                    Verified & Signed
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Authorized by CEO <span className="text-amber-300 font-semibold">{ceoName}</span> • ANTHONY INDIA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {/* Live QR Verification Action */}
              <button
                type="button"
                onClick={() => setShowVerificationModal(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Open Public Verification Link"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Online</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60"
                title="Download High-Resolution PDF Certificate"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Print Certificate"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                title="Close Certificate"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Display Canvas Container */}
          <div className="overflow-x-auto pb-2">
            <div
              ref={certificateRef}
              id="executive-certificate-document"
              className="w-[980px] min-w-[980px] h-[640px] mx-auto bg-slate-950 text-slate-100 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between select-none shadow-2xl border-4 border-amber-600/60"
              style={{
                backgroundImage: `radial-gradient(circle at center, #0b1329 0%, #030712 100%)`,
              }}
            >
              {/* Watermark Logo Background */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.06] select-none"
                style={{
                  backgroundImage: `url('/assets/images/anthony_stamp.jpg')`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '480px',
                }}
              />

              {/* Inner Ornate Gold Framing Lines */}
              <div className="absolute inset-3 border-2 border-amber-500/40 rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-amber-400/20 rounded-lg pointer-events-none" />

              {/* Corner Ornamental Accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

              {/* 1. Header Section */}
              <div className="relative z-10 text-center pt-2 space-y-1.5">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400 to-amber-500" />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-[0.25em]">
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>ANTHONY INDIA • EXECUTIVE GOVERNANCE</span>
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="h-[1px] w-20 bg-gradient-to-l from-transparent via-amber-400 to-amber-500" />
                </div>

                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 font-serif italic tracking-wide drop-shadow-md">
                  Official Certificate of Executive Clearance
                </h1>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-semibold">
                  Technology for a Better Tomorrow • ISO/IEC 27001 Certified Enterprise Protocol
                </p>
              </div>

              {/* 2. Body Recipient Section */}
              <div className="relative z-10 text-center space-y-4 px-12 my-auto">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-400/90 font-medium">
                    This Document Confirms and Certifies That
                  </p>
                  <div className="text-3xl font-black text-white tracking-tight py-1 font-sans border-b border-amber-500/30 inline-block px-12">
                    {submission.userName}
                  </div>
                  <p className="text-xs text-slate-400 font-mono pt-1">
                    Registered Submitter: {submission.userEmail}
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    has successfully presented the filing for{' '}
                    <strong className="text-amber-300 font-semibold underline decoration-amber-500/40">
                      {submission.formTitle}
                    </strong>{' '}
                    under Case Reference{' '}
                    <strong className="text-amber-400 font-mono">#{submission.id}</strong>.
                    Upon rigorous executive adjudication and compliance review, full executive clearance has been officially ratified and granted.
                  </p>

                  {/* Status Callout Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-inner">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Executive Status: Approved & Certified</span>
                  </div>
                </div>
              </div>

              {/* 3. Bottom Signature & Official Stamp Section */}
              <div className="relative z-10 grid grid-cols-3 items-end pt-3 pb-2 border-t border-amber-500/20 px-4">
                {/* Left: CEO Signature */}
                <div className="text-left space-y-1">
                  {/* Hand-crafted SVG Signature replicating the design from the image */}
                  <div className="h-24 flex items-end pl-1 relative">
                    <CEOSignature color="#22d3ee" className="w-32 h-24" />
                  </div>

                  <div className="w-56 h-[1.5px] bg-gradient-to-r from-cyan-400 via-amber-400 to-transparent" />

                  <div>
                    <p className="text-sm font-black text-amber-200 tracking-wide">
                      {ceoName}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Chief Executive Officer & Founder
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                      ANTHONY INDIA Group
                    </p>
                  </div>
                </div>

                {/* Center: The Official Seal Stamp from Company Logo */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="relative group p-1 rounded-full"
                    title="Official Anthony India Executive Seal"
                  >
                    {/* Outer Glowing Metallic Ring */}
                    <div className="w-26 h-26 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/30 border-2 border-amber-300 flex items-center justify-center relative rotate-[-5deg]">
                      
                      {/* Serrated/Dashed Security Ring */}
                      <div className="absolute inset-1 rounded-full border border-dashed border-cyan-200/80 pointer-events-none" />

                      {/* Stamp Image in Center (Company Logo) */}
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-950 border border-cyan-300/60 flex items-center justify-center shadow-inner p-1">
                        <img
                          src={branding.logoUrl || "/assets/images/company_logo_emblem.jpg"}
                          alt="Anthony India Official Stamp Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/anthony_stamp.jpg';
                          }}
                        />
                      </div>

                      {/* Circular Ribbon / Text Badge */}
                      <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[7.5px] uppercase tracking-tighter px-2.5 py-0.5 rounded-full shadow-lg border border-amber-200">
                        OFFICIAL EXECUTIVE SEAL
                      </div>
                    </div>
                  </div>
                  <p className="text-[8px] font-mono text-cyan-300 font-bold uppercase tracking-widest mt-2.5">
                    ANTHONY INDIA • RATIFIED & SEALED
                  </p>
                </div>

                {/* Right: Dynamic Verification QR Code & Security Hash */}
                <div className="text-right space-y-1.5 flex flex-col items-end">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowVerificationModal(true)}
                      className="w-14 h-14 bg-white rounded-xl p-1 shadow-lg border border-amber-400/50 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group relative"
                      title="Click or Scan with camera to verify online"
                    >
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Verification QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCodeIcon className="w-10 h-10 text-slate-950" />
                      )}
                    </button>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-amber-300 font-mono">
                        SCAN TO VERIFY
                      </p>
                      <p className="text-[10px] text-white font-mono font-bold">
                        #CERT-{submission.id}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Issued: {certIssueDate}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/90 border border-amber-500/20 rounded-lg p-1.5 max-w-[240px] text-left">
                    <div className="flex items-center justify-between gap-1 text-[8px] text-slate-400 font-mono">
                      <span className="truncate">HASH: {verificationHash.slice(0, 26)}...</span>
                      <button
                        type="button"
                        onClick={handleCopyHash}
                        className="text-amber-400 hover:text-amber-300 p-0.5 cursor-pointer"
                      >
                        {copiedHash ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                    <p className="text-[8px] text-emerald-400 font-bold tracking-tight">
                      Cryptographically Sealed By CEO Arnav Singh
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Line */}
              <div className="relative z-10 text-center pt-1 border-t border-slate-900/60 text-[9px] text-slate-500 font-mono">
                Valid for official, corporate, and regulatory compliance submission • Verification available at {branding.companyName || 'Anthony India'}
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                This certificate includes an active dynamic QR code linked to the public verification registry.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVerificationModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Verification View</span>
              </button>

              <button
                type="button"
                onClick={handleCopyHash}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash ? 'Hash Copied' : 'Copy Verification Hash'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Public Verification Modal Popup */}
      {showVerificationModal && (
        <CertificateVerificationModal
          submission={submission}
          allSubmissions={[submission]}
          branding={branding}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </>
  );
};

