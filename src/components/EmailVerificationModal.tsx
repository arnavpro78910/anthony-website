import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { CompanyBranding, UserAccount } from '../types';
import {
  verifyEmailCode,
  resendEmailVerificationCode,
  getUserByEmail
} from '../utils/storage';
import { sendRealVerificationEmail } from '../services/authService';

interface EmailVerificationModalProps {
  email: string;
  branding: CompanyBranding;
  onSuccess: (user: UserAccount) => void;
  onBackOrCancel: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  email,
  branding,
  onSuccess,
  onBackOrCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Trigger automated email dispatch to recipient's email address on mount
  useEffect(() => {
    if (!email) return;

    const user = getUserByEmail(email);
    if (user && user.verificationCode) {
      setSendingEmail(true);
      sendRealVerificationEmail(email, user.verificationCode, user.name, branding.companyName)
        .then((res) => {
          if (res.success) {
            setSuccessStatus(`Verification code successfully dispatched to your email.`);
            if (res.previewUrl) {
              setPreviewUrl(res.previewUrl);
            }
          }
        })
        .catch((err) => {
          console.warn('Background email dispatch note:', err);
        })
        .finally(() => {
          setSendingEmail(false);
        });
    }
  }, [email, branding.companyName]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first digit input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const singleChar = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleChar;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next box
    if (index < 5 && singleChar) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      const fullCode = digits.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setError(null);

    const nextIndex = Math.min(5, pastedData.length);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = verifyEmailCode(email, code);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'Invalid verification code. Please check your email and try again.');
      }
      setLoading(false);
    }, 350);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccessStatus(null);
    const res = resendEmailVerificationCode(email);
    if (res.success && res.code) {
      setResendCooldown(45);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      setSendingEmail(true);
      const emailRes = await sendRealVerificationEmail(email, res.code, undefined, branding.companyName);
      setSendingEmail(false);
      if (emailRes.success) {
        setSuccessStatus(`A fresh verification code has been sent to ${email}.`);
        if (emailRes.previewUrl) {
          setPreviewUrl(emailRes.previewUrl);
        }
      } else {
        setError(emailRes.error || 'Failed to dispatch email verification message.');
      }
    } else {
      setError(res.error || 'Failed to generate a new verification code.');
    }
  };

  const isFull = digits.every((d) => d !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Email Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
            A confirmation code has been sent directly to:
            <span className="block font-mono font-bold text-blue-300 mt-0.5 break-all">
              {email}
            </span>
          </p>
        </div>

        {/* Status / Success Message */}
        {successStatus && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successStatus}</span>
          </div>
        )}

        {/* Ethereal Mail Sandbox Preview link */}
        {previewUrl && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-1.5 shadow-md">
            <span className="block font-bold">🧪 DEV ENVIRONMENT DETECTED</span>
            <span className="block text-[11px] text-slate-300 leading-normal">
              Direct SMTP port restrictions are active on container runtime. Your email was successfully routed to our secure, interactive Ethereal test mailbox.
            </span>
            <a 
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 hover:underline pt-1 text-xs"
            >
              <span>Click Here to View Sent Email & Retrieve PIN ↗</span>
            </a>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 6-Digit PIN input boxes */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            Enter 6-Digit Code
          </label>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-mono font-bold rounded-xl border bg-slate-950 text-white focus:outline-none focus:ring-2 transition-all ${
                  digit
                    ? 'border-blue-500 ring-1 ring-blue-500/50'
                    : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Button: Verify */}
        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={loading || !isFull}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Resend Code & Back actions */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onBackOrCancel}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-xs"
          >
            ← Change Email / Back
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || sendingEmail}
            className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer text-xs ${
              resendCooldown > 0 || sendingEmail
                ? 'text-slate-500 cursor-not-allowed'
                : 'text-blue-400 hover:text-blue-300'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
