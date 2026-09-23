import React, { useState, useEffect } from 'react';
import { X, Building, Mail, MapPin, Sparkles, Image as ImageIcon, RotateCcw, Check, Upload, Loader2 } from 'lucide-react';
import { CompanyBranding } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { DEFAULT_BRANDING } from '../data/templates';
import { compressImageFile } from '../utils/imageUtils';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: CompanyBranding;
  onSave: (newBranding: CompanyBranding) => void;
}

const GENERATED_LOGO_PATH = '/assets/images/company_logo_emblem.jpg';

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSave,
}) => {
  const [formData, setFormData] = useState<CompanyBranding>({ ...branding });
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...branding });
      setCustomUrlInput(branding.logoUrl && branding.logoUrl !== GENERATED_LOGO_PATH ? branding.logoUrl : '');
      setSaveSuccessNotice(false);
    }
  }, [isOpen, branding]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleCancel = () => {
    // Revert form data back to original branding and close
    setFormData({ ...branding });
    onClose();
  };

  const handleResetToDefault = () => {
    setFormData({ ...DEFAULT_BRANDING });
    setCustomUrlInput('');
  };

  const handleQuickPreset = (name: string, tagline: string, email: string) => {
    setFormData({
      ...formData,
      companyName: name,
      tagline: tagline,
      supportEmail: email,
    });
  };

  const handleSelectLogoType = (type: 'generated' | 'icon' | 'custom', customUrl?: string) => {
    if (type === 'generated') {
      setFormData({
        ...formData,
        logoType: 'generated',
        logoUrl: GENERATED_LOGO_PATH,
      });
    } else if (type === 'icon') {
      setFormData({
        ...formData,
        logoType: 'icon',
        logoUrl: '',
      });
    } else if (type === 'custom') {
      setFormData({
        ...formData,
        logoType: 'custom',
        logoUrl: customUrl || customUrlInput || GENERATED_LOGO_PATH,
      });
    }
  };

  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedDataUrl = await compressImageFile(file, 280);
        setFormData({
          ...formData,
          logoType: 'custom',
          logoUrl: compressedDataUrl,
        });
        setCustomUrlInput(compressedDataUrl);
      } catch (err) {
        console.error('File compression failed:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        id="company-settings-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Company Brand & Logo Control</h3>
              <p className="text-[11px] text-slate-500">Admin management for company identity and live portal header</p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Cancel and close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Live Preview Header Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
              <span>LIVE HEADER PREVIEW</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-time
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CompanyLogo branding={formData} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-white truncate">
                    {formData.companyName || 'Company Name'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    User Portal
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {formData.tagline || 'Tagline / Subtitle'}
                </p>
              </div>
            </div>
          </div>

          {/* Logo Selector Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Company Logo Selection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Generated Tech Emblem */}
              <button
                type="button"
                onClick={() => handleSelectLogoType('generated')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  formData.logoType === 'generated' || (!formData.logoType && formData.logoUrl)
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                  <img
                    src={GENERATED_LOGO_PATH}
                    alt="Anthony India Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">Tech Emblem</span>
                  <span className="block text-[10px] text-slate-500">Corporate Blue</span>
                </div>
              </button>

              {/* Option 2: Classic Vector Icon */}
              <button
                type="button"
                onClick={() => handleSelectLogoType('icon')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  formData.logoType === 'icon'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">Vector Icon</span>
                  <span className="block text-[10px] text-slate-500">Minimal Building</span>
                </div>
              </button>

              {/* Option 3: Custom Upload / URL */}
              <label
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  formData.logoType === 'custom'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">Upload Custom</span>
                  <span className="block text-[10px] text-slate-500">PNG / JPG / SVG</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Company Name & Tagline */}
          <div className="space-y-3">
            <div>
              <label htmlFor="setting-company-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Company / Business Name *
              </label>
              <input
                id="setting-company-name"
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Anthony India"
              />
            </div>

            <div>
              <label htmlFor="setting-company-tagline" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Portal Subtitle / Department Tagline
              </label>
              <input
                id="setting-company-tagline"
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Enterprise Software & Cloud Consultancy"
              />
            </div>
          </div>

          {/* Email and Office Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="setting-company-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Inquiries Email
              </label>
              <input
                id="setting-company-email"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="arnavpro78910@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="setting-company-location" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                HQ / Office Location
              </label>
              <input
                id="setting-company-location"
                type="text"
                value={formData.officeLocation}
                onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Global Cloud Technology Hub"
              />
            </div>
          </div>

          {/* Welcome Note & Header Subtitle */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="setting-welcome-note" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Home Portal Welcome Note
              </label>
              <input
                id="setting-welcome-note"
                type="text"
                value={formData.primaryWelcomeMessage || ''}
                onChange={(e) => setFormData({ ...formData, primaryWelcomeMessage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Welcome to the Corporate Intake & Filing Portal"
              />
            </div>
          </div>

          {/* CEO & Leadership Customization */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="setting-ceo-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  CEO / Founder Name
                </label>
                <input
                  id="setting-ceo-name"
                  type="text"
                  value={formData.ceoName || ''}
                  onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Arnav Sharma"
                />
              </div>

              <div>
                <label htmlFor="setting-ceo-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  CEO Official Title
                </label>
                <input
                  id="setting-ceo-title"
                  type="text"
                  value={formData.ceoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, ceoTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Founder & Chief Executive Officer"
                />
              </div>
            </div>

            <div>
              <label htmlFor="setting-ceo-letter" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Executive Letter / Message from CEO
              </label>
              <textarea
                id="setting-ceo-letter"
                rows={2}
                value={formData.ceoBio || ''}
                onChange={(e) => setFormData({ ...formData, ceoBio: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Message from CEO displayed in executive letter card on Home..."
              />
            </div>
          </div>

          {/* About Company, Mission & Vision */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="setting-about-company" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                About Company Overview
              </label>
              <textarea
                id="setting-about-company"
                rows={2}
                value={formData.aboutUs || ''}
                onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary of company services and history..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="setting-company-mission" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Our Mission
                </label>
                <textarea
                  id="setting-company-mission"
                  rows={2}
                  value={formData.companyMission || ''}
                  onChange={(e) => setFormData({ ...formData, companyMission: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Corporate mission statement..."
                />
              </div>

              <div>
                <label htmlFor="setting-company-vision" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Our Vision
                </label>
                <textarea
                  id="setting-company-vision"
                  rows={2}
                  value={formData.companyVision || ''}
                  onChange={(e) => setFormData({ ...formData, companyVision: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Corporate vision statement..."
                />
              </div>
            </div>
          </div>

          {/* Quick presets for convenience */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Company Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  handleQuickPreset('Anthony India', 'Enterprise Software & Cloud Consultancy', 'arnavpro78910@gmail.com');
                  handleSelectLogoType('generated');
                }}
                className="text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Anthony India (Default)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('Nexus Digital Solutions', 'Enterprise Software & Cloud Consultancy', 'hello@nexusdigital.io')}
                className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Tech Agency
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('Vanguard Financial Group', 'Global Asset Management & Corporate Advisory', 'compliance@vanguard-corp.internal')}
                className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Finance & Legal
              </button>
            </div>
          </div>

          {/* Footer Controls: Cancel, Reset, Save */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              id="reset-settings-default-btn"
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset all settings to default Anthony India branding"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset to Anthony India Default
            </button>

            <div className="flex items-center justify-end gap-2.5">
              <button
                id="cancel-settings-btn"
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Cancel Changes
              </button>
              <button
                id="save-settings-btn"
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {saveSuccessNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Save & Apply'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
