import React, { useState, useEffect, useRef } from 'react';
import { FormTemplate, CompanyBranding, FormSubmission, UserAccount } from '../types';
import { FormField } from './FormFields';
import { generateTrackingId, saveSubmission, getUserSubmissions, isUserVip } from '../utils/storage';
import {
  distributeFormFieldsIntoSections,
  getSectionStatus,
  saveDraftWizardProgress,
  getDraftWizardProgress,
  clearDraftWizardProgress,
  FormSectionGroup
} from '../utils/formSectionDistributor';
import { sendSubmissionStatusEmail } from '../services/gmailService';
import { notify } from '../utils/notifications';
import {
  Send,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Lock,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck2,
  AlertTriangle,
  Crown
} from 'lucide-react';

interface ActiveFormProps {
  template: FormTemplate;
  branding: CompanyBranding;
  currentUser: UserAccount | null;
  existingSubmission: FormSubmission | null;
  onOpenAuthModal: () => void;
  onViewSubmission: () => void;
  onSubmitSuccess: (submission: FormSubmission) => void;
  onDraftStatusChange: (status: 'idle' | 'saving' | 'saved') => void;
  onCloseWizard: () => void;
}

export const ActiveForm: React.FC<ActiveFormProps> = ({
  template,
  branding,
  currentUser,
  existingSubmission,
  onOpenAuthModal,
  onViewSubmission,
  onSubmitSuccess,
  onDraftStatusChange,
  onCloseWizard,
}) => {
  const userIdKey = currentUser ? currentUser.id : 'guest';
  const userSubs = currentUser ? getUserSubmissions(currentUser.id, currentUser.email) : [];
  const maxLimit = currentUser ? Math.min(9, Math.max(1, currentUser.submissionLimit || 1)) : 1;
  const isLimitReached = Boolean(currentUser && userSubs.length >= maxLimit);

  // Intelligently compute sections for this template (only non-empty sections)
  const sections = React.useMemo(() => {
    return distributeFormFieldsIntoSections(template.fields);
  }, [template.fields]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestCeoReview, setRequestCeoReview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimeout = useRef<number | null>(null);

  // Load saved draft on mount or initialize defaults
  useEffect(() => {
    const saved = getDraftWizardProgress(template.id, userIdKey);
    if (saved && saved.formData && Object.keys(saved.formData).length > 0) {
      setFormData(saved.formData);
      if (typeof saved.currentSectionIndex === 'number' && saved.currentSectionIndex <= sections.length) {
        setCurrentSectionIndex(saved.currentSectionIndex);
      }
    } else {
      // Pre-fill user profile information if available
      if (currentUser) {
        setFormData({
          fullName: currentUser.name || '',
          workEmail: currentUser.email || '',
          employeeName: currentUser.name || '',
          employeeEmail: currentUser.email || '',
          applicantName: currentUser.name || '',
          applicantEmail: currentUser.email || '',
          contactPerson: currentUser.name || '',
          contactEmail: currentUser.email || '',
          clientName: currentUser.name || '',
        });
      } else {
        setFormData({});
      }
      setCurrentSectionIndex(0);
    }
    setErrors({});
  }, [template.id, userIdKey, sections.length]);

  // Handle input changes and auto-save draft
  const handleFieldChange = (fieldId: string, value: any) => {
    const updated = { ...formData, [fieldId]: value };
    setFormData(updated);

    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }

    onDraftStatusChange('saving');
    if (autoSaveTimeout.current) {
      window.clearTimeout(autoSaveTimeout.current);
    }
    autoSaveTimeout.current = window.setTimeout(() => {
      saveDraftWizardProgress(template.id, userIdKey, currentSectionIndex, updated);
      onDraftStatusChange('saved');
      setTimeout(() => onDraftStatusChange('idle'), 2000);
    }, 600);
  };

  // Close wizard and save progress with floating notification
  const handleCloseAndSave = () => {
    if (autoSaveTimeout.current) {
      window.clearTimeout(autoSaveTimeout.current);
    }
    saveDraftWizardProgress(template.id, userIdKey, currentSectionIndex, formData);
    onDraftStatusChange('saved');
    notify.success(`Draft saved for "${template.title}". Reopen anytime to continue from Step ${currentSectionIndex + 1}.`);
    onCloseWizard();
  };

  // Reset all fields & clear draft completely
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset this form? All entered information will be cleared.')) {
      if (autoSaveTimeout.current) {
        window.clearTimeout(autoSaveTimeout.current);
      }
      clearDraftWizardProgress(template.id, userIdKey);
      
      // Reset to profile defaults instead of empty
      if (currentUser) {
        setFormData({
          fullName: currentUser.name || '',
          workEmail: currentUser.email || '',
          employeeName: currentUser.name || '',
          employeeEmail: currentUser.email || '',
          applicantName: currentUser.name || '',
          applicantEmail: currentUser.email || '',
          contactPerson: currentUser.name || '',
          contactEmail: currentUser.email || '',
          clientName: currentUser.name || '',
        });
      } else {
        setFormData({});
      }
      
      setErrors({});
      setCurrentSectionIndex(0);
      onDraftStatusChange('idle');
      notify.info('Form fields have been reset to default.');
    }
  };

  const isReviewStep = currentSectionIndex === sections.length;
  const currentSection: FormSectionGroup | null = !isReviewStep ? sections[currentSectionIndex] : null;

  // Validate current section before moving to next
  const validateCurrentSection = (): boolean => {
    if (isReviewStep) return true;
    if (!currentSection) return true;

    const newErrors: Record<string, string> = {};
    currentSection.fields.forEach((field) => {
      const val = formData[field.id];
      if (field.required) {
        if (val === undefined || val === null || val === '') {
          newErrors[field.id] = `${field.label} is required.`;
          return;
        }
        if (field.type === 'checkbox' && val !== true) {
          newErrors[field.id] = 'Required to proceed.';
          return;
        }
      }

      if (val) {
        if (field.type === 'email' && typeof val === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            newErrors[field.id] = 'Enter a valid email address.';
          }
        }
        if (field.type === 'tel' && typeof val === 'string') {
          if (val.replace(/\D/g, '').length < 7) {
            newErrors[field.id] = 'Enter a valid phone number.';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) {
      return;
    }
    const nextIdx = Math.min(sections.length, currentSectionIndex + 1);
    setCurrentSectionIndex(nextIdx);
    saveDraftWizardProgress(template.id, userIdKey, nextIdx, formData);
  };

  const handleBack = () => {
    const prevIdx = Math.max(0, currentSectionIndex - 1);
    setCurrentSectionIndex(prevIdx);
    saveDraftWizardProgress(template.id, userIdKey, prevIdx, formData);
  };

  // Final Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (isLimitReached) {
      notify.error(`Submission quota limit reached (${userSubs.length}/${maxLimit}). You cannot submit more applications.`);
      return;
    }

    // Full form validation check
    const newErrors: Record<string, string> = {};
    template.fields.forEach((field) => {
      const val = formData[field.id];
      if (field.required) {
        if (val === undefined || val === null || val === '') {
          newErrors[field.id] = `${field.label} is required.`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Find the first section with an error
      const errorFieldId = Object.keys(newErrors)[0];
      const targetSecIdx = sections.findIndex(s => s.fields.some(f => f.id === errorFieldId));
      if (targetSecIdx !== -1) {
        setCurrentSectionIndex(targetSecIdx);
      }
      notify.error('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    const startTime = Date.now();
    const minLoadingDuration = 1200; // ensure smooth visual feedback

    setTimeout(() => {
      const trackingId = generateTrackingId(template.id);
      const isVipAcc = isUserVip(currentUser);

      const submission: FormSubmission = {
        id: trackingId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        templateId: template.id,
        formTitle: template.title,
        submittedAt: new Date().toISOString(),
        status: isVipAcc ? 'Under Evaluation' : 'Pending Review',
        data: formData,
        companyName: branding.companyName,
        requestCeoReview: Boolean(requestCeoReview),
        isVipSubmission: Boolean(isVipAcc),
        isSentToCeo: Boolean(isVipAcc),
        workflowStage: isVipAcc ? 'ceo_desk' : 'department_review',
        qrVerificationUrl: typeof window !== 'undefined' ? `${window.location.origin}/?verify=${trackingId}` : undefined,
        statusNotes: isVipAcc ? 'VIP Strategic Account submission received directly at CEO Executive Desk.' : undefined,
      };

      saveSubmission(submission);

      sendSubmissionStatusEmail({
        email: currentUser.email,
        userName: currentUser.name,
        submissionId: trackingId,
        formTitle: template.title,
        status: submission.status,
        statusNotes: isVipAcc
          ? 'Your filing has been routed directly to the Chief Executive Officer.'
          : 'Your filing has been registered in the system ledger and is pending administrative review.',
        companyName: branding.companyName,
        isCeo: isVipAcc,
        isVip: isVipAcc,
      }).catch((e) => console.warn('Email dispatch warning:', e));

      clearDraftWizardProgress(template.id, userIdKey);
      onDraftStatusChange('idle');
      setIsSubmitting(false);
      notify.success(`Submission successful! Tracking ID: #${submission.id}`);
      onSubmitSuccess(submission);
    }, 1200);
  };

  // Build navigation items: Sections + Review box
  const allNavBoxes = [
    ...sections.map((sec, idx) => ({
      id: sec.id,
      title: sec.title,
      index: idx,
      isReview: false,
      status: getSectionStatus(sec, formData),
    })),
    {
      id: 'review',
      title: 'Review',
      index: sections.length,
      isReview: true,
      status: 'green' as const,
    },
  ];

  if (template.settings?.isActive === false) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <Lock className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">{template.title} is Closed</h2>
        <p className="text-xs text-slate-500 mt-2">New submissions are temporarily paused for this form.</p>
        <button
          type="button"
          onClick={onCloseWizard}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Back to Forms
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-4 animate-fade-in" id="company-form-wizard-container">
      {/* Enterprise Corporate Form Header & Stepper */}
      <div className="enterprise-card p-4 sm:p-6 mb-5 relative animate-fade-in">
        {/* Top Bar with Title, Encrypted Badge, Auto-Save Status, and Close */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                Certified Intake
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit Encrypted</span>
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
              {template.title}
            </h2>
            {template.subtitle && (
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                {template.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Auto-Save Draft Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Draft Auto-Saved</span>
            </div>

            {/* Prominent Cross Button to Exit Form Wizard with Auto-Saved Draft */}
            <button
              type="button"
              id="wizard-close-exit-btn"
              onClick={handleCloseAndSave}
              className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 transition-all cursor-pointer text-xs font-bold shadow-2xs active:scale-95"
              title="Close and save draft (you can reopen anytime to continue)"
              aria-label="Close and save draft"
            >
              <span>Save & Close</span>
              <div className="w-5 h-5 rounded-full bg-slate-200 group-hover:bg-rose-200/80 flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-700" />
              </div>
            </button>
          </div>
        </div>

        {/* Dot Condition Navigation System */}
        <div className="pt-4" id="form-wizard-stepper-dots">
          {/* Stepper Cards with Dot Condition Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {allNavBoxes.map((box) => {
              const isActive = currentSectionIndex === box.index;
              const isPast = currentSectionIndex > box.index;

              // Dot status color mapping:
              // - Red dot: Required fields pending in this section
              // - Amber/Yellow dot: Optional fields empty, required satisfied
              // - Green dot: Complete / reviewed
              const dotColor =
                box.status === 'red'
                  ? 'bg-rose-500 ring-4 ring-rose-100'
                  : box.status === 'yellow'
                  ? 'bg-amber-500 ring-4 ring-amber-100'
                  : 'bg-emerald-500 ring-4 ring-emerald-100';

              const statusText =
                box.status === 'red'
                  ? 'Required fields empty'
                  : box.status === 'yellow'
                  ? 'Optional fields empty'
                  : 'Section complete';

              return (
                <button
                  key={box.id}
                  id={`step-nav-btn-${box.id}`}
                  type="button"
                  onClick={() => {
                    setCurrentSectionIndex(box.index);
                    saveDraftWizardProgress(template.id, userIdKey, box.index, formData);
                  }}
                  className={`relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 text-white font-bold border-blue-900 shadow-md ring-2 ring-blue-900/20'
                      : isPast
                      ? 'bg-blue-50/60 hover:bg-blue-50 border-blue-200 text-blue-950 font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}
                  title={`${box.title}: ${statusText}`}
                >
                  {/* Step Number Badge */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isPast && box.status === 'green' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      box.index + 1
                    )}
                  </div>

                  {/* Section Label & Dot Condition Indicator */}
                  <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                    <span className="text-xs truncate block">{box.title}</span>

                    {/* Dot Condition Badge */}
                    <div className="flex items-center gap-1 shrink-0" title={statusText}>
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-all ${dotColor} ${
                          isActive && box.status === 'red' ? 'animate-pulse' : ''
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stepper Dot Condition Legend */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Section Status:</span>
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-100" />
                <span>Required Pending</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-100" />
                <span>Optional Empty</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                <span>Complete</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Fields Container / Review Container */}
      <div
        key={isReviewStep ? 'review-step' : `section-${currentSectionIndex}`}
        className="enterprise-card p-5 sm:p-8 mb-5 animate-fade-in"
      >
        {!isReviewStep ? (
          /* REGULAR FORM SECTION STEP */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{currentSection?.title} Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please provide all necessary certified information below.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Step {currentSectionIndex + 1} of {sections.length + 1}
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {currentSection?.fields.map((field) => (
                <div key={field.id} id={`field-container-${field.id}`} className="space-y-1.5 text-left">
                  <FormField
                    field={field}
                    value={formData[field.id]}
                    error={errors[field.id]}
                    onChange={(val) => handleFieldChange(field.id, val)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* REVIEW & SUMMARY STEP */
          <div className="space-y-5 text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Summary & Official Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please review all entered information carefully before committing your official submission.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Final Step
              </span>
            </div>

            {/* Summary Cards by Section */}
            <div className="space-y-4">
              {sections.map((sec) => (
                <div key={sec.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                    {sec.title} Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {sec.fields.map((f) => {
                      const val = formData[f.id];
                      let displayVal = '—';
                      if (val !== undefined && val !== null && val !== '') {
                        if (typeof val === 'boolean') {
                          displayVal = val ? 'Yes / Agreed' : 'No';
                        } else if (typeof val === 'object' && val.name) {
                          displayVal = val.name;
                        } else {
                          displayVal = String(val);
                        }
                      }

                      return (
                        <div key={f.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">{f.label}</span>
                          <span className="font-semibold text-slate-800 break-words mt-0.5 block">{displayVal}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quota Limit Warning (if reached) */}
            {isLimitReached && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-0.5">
                  <span className="font-bold">Submission Quota Limit Reached ({userSubs.length}/{maxLimit})</span>
                  <p className="text-amber-800 leading-relaxed">
                    Your account has reached its authorized filing quota of {maxLimit} submission(s). Further submissions are locked.
                  </p>
                </div>
              </div>
            )}

            {/* CEO Review Request Checkbox (if enabled) */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
              <input
                type="checkbox"
                id="requestCeoReviewCheck"
                checked={requestCeoReview}
                onChange={(e) => setRequestCeoReview(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-slate-300"
              />
              <label htmlFor="requestCeoReviewCheck" className="text-xs text-blue-950 cursor-pointer leading-relaxed">
                <strong className="font-bold">Request Priority Executive Evaluation:</strong> Route this submission directly to the executive review desk for expedited clearance and senior director oversight.
              </label>
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={currentSectionIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentSectionIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                : 'enterprise-btn-secondary'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {/* Center Reset Button (HIDDEN on Review step) */}
          {!isReviewStep ? (
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Reset all entered values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Fields</span>
            </button>
          ) : (
            <div />
          )}

          {/* Next / Submit Button */}
          {!isReviewStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="enterprise-btn-primary text-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLimitReached}
              className={`relative overflow-hidden flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-80 ${
                isLimitReached
                  ? 'bg-amber-600 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSubmitting && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-800/40 overflow-hidden">
                  <div className="h-full bg-white animate-pulse w-full origin-left scale-x-50 transition-all duration-1000 ease-out" />
                </div>
              )}
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting & Saving to Firestore...</span>
                </div>
              ) : isLimitReached ? (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  <span>Quota Limit Reached</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Official Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
