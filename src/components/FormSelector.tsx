import React, { useState } from 'react';
import {
  Briefcase,
  UserCheck,
  ClipboardList,
  Building2,
  Clock,
  FileText,
  Shield,
  Layers,
  Globe,
  HelpCircle,
  Settings,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { FormCategory, FormTemplate } from '../types';

interface FormSelectorProps {
  templates: FormTemplate[];
  selectedId: FormCategory;
  onSelect: (id: FormCategory) => void;
  onStartFilling: (template: FormTemplate) => void;
  isLimitReached?: boolean;
  userSubmissionsCount?: number;
  maxLimit?: number;
  onViewStatus?: () => void;
}

export const FormSelector: React.FC<FormSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
  onStartFilling,
  isLimitReached = false,
  userSubmissionsCount = 0,
  maxLimit = 1,
  onViewStatus,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'ClipboardList':
        return <ClipboardList className="w-4 h-4 text-indigo-600" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'Globe':
        return <Globe className="w-4 h-4 text-cyan-600" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'Settings':
        return <Settings className="w-4 h-4 text-slate-700" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Briefcase className="w-4 h-4 text-slate-600" />;
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-full mb-8 animate-fade-in" id="company-form-selector">
      {/* Submission Limit Reached Notice */}
      {isLimitReached && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-amber-950">
                  Submission Limit Reached ({userSubmissionsCount}/{maxLimit})
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Locked
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Your account has used all {maxLimit} authorized form submission slots. New submissions are currently locked.
              </p>
            </div>
          </div>
          {onViewStatus && (
            <button
              type="button"
              onClick={onViewStatus}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Track My Filings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
            Intake Directory
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Select Form Category
          </h2>
          <p className="text-xs text-slate-500">
            {isLimitReached
              ? `Account quota utilized (${userSubmissionsCount}/${maxLimit}). Review available form categories below:`
              : 'Choose the designated category and proceed with certified step-by-step submission.'}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, idx) => {
          const isSelected = template.id === selectedId;
          const isActive = template.settings?.isActive !== false;
          const isExpanded = expandedId === template.id;

          return (
            <div
              key={template.id}
              id={`form-card-${template.id}`}
              style={{ animationDelay: `${idx * 0.07}s` }}
              className={`bg-white rounded-xl border p-5 flex flex-col justify-between shadow-xs card-hover-lift animate-fade-in ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md'
                  : 'border-slate-200/90 hover:border-blue-300'
              } ${!isActive ? 'opacity-70' : ''}`}
            >
              <div>
                {/* Header Icon + Department Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                      {getIcon(template.iconName)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {template.department}
                    </span>
                  </div>
                  {!isActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Closed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {template.estimatedTime}
                    </span>
                  )}
                </div>

                {/* Main Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {template.title}
                </h3>

                {/* Subtitle & Expandable Info */}
                <div className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {!isExpanded ? (
                    <p>
                      {template.subtitle || 'Official certified intake and submission documentation.'}{' '}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(template.id, e)}
                        className="text-blue-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
                      >
                        Details
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </p>
                  ) : (
                    <div className="space-y-2 animate-in fade-in duration-150">
                      <p className="text-slate-600">{template.subtitle}</p>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1 text-left">
                        <p>
                          <strong className="text-slate-800">Purpose:</strong> Documentation filing for {template.department}.
                        </p>
                        <p>
                          <strong className="text-slate-800">Workflow:</strong> Intake Submission → Automated Verification → Executive Review → Final Receipt.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(template.id, e)}
                        className="text-blue-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5 text-[11px]"
                      >
                        Hide Details
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Filling Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] font-medium text-slate-400">
                  {template.fields.length} Fields
                </span>

                {isLimitReached ? (
                  <button
                    type="button"
                    onClick={onViewStatus}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all cursor-pointer"
                    title={`Submission quota reached (${userSubmissionsCount}/${maxLimit}). Click to track your status.`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Limit Reached</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(template.id);
                      onStartFilling(template);
                    }}
                    disabled={!isActive}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                      isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Fill Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
