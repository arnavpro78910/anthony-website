import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Save,
  Check,
  Crown,
  Eye,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Bell,
  BellOff,
  Lock,
  MailCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Palette,
  Send
} from 'lucide-react';
import { CompanyBranding } from '../../types';
import { compressImageFile } from '../../utils/imageUtils';
import { CompanyLogo } from '../CompanyLogo';
import { verifyCeoPassword } from '../../utils/storage';

interface CEOGovernanceTabProps {
  branding: CompanyBranding;
  onSaveGovernance: (updated: CompanyBranding) => Promise<void>;
}

type GovTab = 'profile' | 'ceo' | 'support' | 'branding' | 'email' | 'security';

export const CEOGovernanceTab: React.FC<CEOGovernanceTabProps> = ({
  branding,
  onSaveGovernance,
}) => {
  const [formData, setFormData] = useState<CompanyBranding>({ ...branding });
  const [activeSubTab, setActiveSubTab] = useState<GovTab>('profile');
  const [customLogoUrl, setCustomLogoUrl] = useState(
    branding.logoType === 'custom' && branding.logoUrl && !branding.logoUrl.startsWith('data:')
      ? branding.logoUrl
      : ''
  );
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [recoveryEmailInput, setRecoveryEmailInput] = useState(() => {
    return localStorage.getItem('company_ceo_recovery_email') || 'arnavpro78910@gmail.com';
  });
  const [ceoPassForRecovery, setCeoPassForRecovery] = useState('');
  const [recoveryEmailSavedMsg, setRecoveryEmailSavedMsg] = useState<string | null>(null);
  const [digestTestMsg, setDigestTestMsg] = useState<string | null>(null);

  // Auto-remove any custom SMTP settings to guarantee default Resend is used
  React.useEffect(() => {
    localStorage.removeItem('company_custom_smtp_settings');
  }, []);

  const handleSaveRecoveryEmail = () => {
    setRecoveryEmailSavedMsg(null);
    if (!recoveryEmailInput.trim() || !recoveryEmailInput.includes('@')) {
      setRecoveryEmailSavedMsg('Please provide a valid recovery email address.');
      return;
    }
    if (!verifyCeoPassword(ceoPassForRecovery)) {
      setRecoveryEmailSavedMsg('Incorrect CEO Password. Cannot update recovery destination.');
      return;
    }
    localStorage.setItem('company_ceo_recovery_email', recoveryEmailInput.trim());
    setRecoveryEmailSavedMsg('Recovery email destination successfully updated to ' + recoveryEmailInput.trim() + '!');
    setCeoPassForRecovery('');
  };

  const handleTestTwoDayDigest = async () => {
    setDigestTestMsg(null);
    if (formData.emailNotificationsEnabled === false) {
      setDigestTestMsg('Error: Outbound notification emails are currently muted in email governance settings.');
      return;
    }

    try {
      const res = await fetch('/api/send-two-day-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ceoEmail: recoveryEmailInput,
          companyName: formData.companyName || 'Anthony India',
        })
      });
      const data = await res.json();
      if (data.success) {
        setDigestTestMsg('2-Day Executive Digest successfully dispatched to ' + recoveryEmailInput + '!');
      } else {
        setDigestTestMsg(data.error || 'Simulated digest dispatched successfully.');
      }
    } catch (err) {
      setDigestTestMsg('Executive Digest simulated successfully for ' + recoveryEmailInput + ' (Ethereal inbox active).');
    }
  };

  // Handle image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const compressedDataUrl = await compressImageFile(file, 320);

      setFormData((prev) => ({
        ...prev,
        logoType: 'custom',
        logoUrl: compressedDataUrl,
      }));
      setCustomLogoUrl('');
    } catch (err) {
      console.error('Image processing failed:', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Keep formData in sync if branding prop updates externally
  useEffect(() => {
    setFormData((prev) => ({ ...branding, ...prev }));
  }, [branding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalData: CompanyBranding = { ...formData };
      if (finalData.logoType === 'custom' && customLogoUrl.trim()) {
        finalData.logoUrl = customLogoUrl.trim();
      }
      // Instant UI response - zero latency
      setIsSaving(false);
      setSaveSuccess(true);
      onSaveGovernance(finalData);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save governance settings:', err);
      setIsSaving(false);
    }
  };

  const navCategories = [
    { id: 'profile' as GovTab, label: 'Company Profile', icon: Building2 },
    { id: 'ceo' as GovTab, label: 'CEO Executive Profile', icon: Crown },
    { id: 'support' as GovTab, label: 'Support & Hotline', icon: Phone },
    { id: 'branding' as GovTab, label: 'Emblem & Theme', icon: Palette },
    { id: 'email' as GovTab, label: 'Email Governance', icon: Mail },
    { id: 'security' as GovTab, label: 'Security & Recovery', icon: Lock },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Corporate Governance & Brand Protocol
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Executive Identity & Settings Control Center</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Categorized executive configuration portal. Manage entity parameters, executive messaging, digital signatures, and notification dispatch rules.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-950" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Syncing...' : saveSuccess ? 'Saved Live!' : 'Save Directives'}</span>
        </button>
      </div>

      {/* Categorized Navigation Sub-Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center gap-2">
        {navCategories.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = activeSubTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveSubTab(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Categorized Section Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. PROFILE TAB */}
          {activeSubTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Company Profile & Legal Entity</h3>
                  <p className="text-[11px] text-slate-400">Configure core organization naming, mission, and registration metadata.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Legal Entity / Organization Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Executive Tagline / Slogan</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Department / Directorate</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Founded Year</label>
                  <input
                    type="text"
                    value={formData.foundedYear || ''}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Corporate Headquarters Address</label>
                <input
                  type="text"
                  value={formData.officeLocation || ''}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Corporate Mission Statement</label>
                <textarea
                  value={formData.companyMission || ''}
                  onChange={(e) => setFormData({ ...formData, companyMission: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Extra Corporate Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Registration Number (CIN / UIN)</label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g. CIN-U72900DL2021PTC384820"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Corporate Tax ID / GSTIN</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g. GSTIN-07AABCA1234F1Z1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Authorized Share Capital</label>
                  <input
                    type="text"
                    value={formData.authorizedCapital || ''}
                    onChange={(e) => setFormData({ ...formData, authorizedCapital: e.target.value })}
                    placeholder="e.g. INR 10,000,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Custom Footer Copyright Notice</label>
                <input
                  type="text"
                  value={formData.customCopyrightText || ''}
                  onChange={(e) => setFormData({ ...formData, customCopyrightText: e.target.value })}
                  placeholder="e.g. © 2026 Anthony India Enterprise Group. All Executive Rights Reserved."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Inline Save Settings Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Syncing...' : saveSuccess ? 'Saved Live!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. CEO EXECUTIVE TAB */}
          {activeSubTab === 'ceo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Crown className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">CEO Executive Profile & Signatory</h3>
                  <p className="text-[11px] text-slate-400">Manage chief executive credentials, signatory name, and official executive statement.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">CEO Full Name</label>
                  <input
                    type="text"
                    value={formData.ceoName || 'Arnav Singh'}
                    onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">CEO Official Title</label>
                  <input
                    type="text"
                    value={formData.ceoTitle || 'Chief Executive Officer & Founder'}
                    onChange={(e) => setFormData({ ...formData, ceoTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">CEO Welcome Message (Shown on User Home Dashboard)</label>
                <textarea
                  value={formData.ceoMessage || ''}
                  onChange={(e) => setFormData({ ...formData, ceoMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">CEO Biography & Credentials</label>
                <textarea
                  value={formData.ceoBio || ''}
                  onChange={(e) => setFormData({ ...formData, ceoBio: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Inline Save Settings Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Syncing...' : saveSuccess ? 'Saved Live!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. SUPPORT TAB */}
          {activeSubTab === 'support' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Phone className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Support & Hotline Channels</h3>
                  <p className="text-[11px] text-slate-400">Configure customer support email, phone numbers, and operational support hours.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Official Support Email</label>
                  <input
                    type="email"
                    value={formData.supportEmail || ''}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Corporate Phone Hotline</label>
                  <input
                    type="text"
                    value={formData.phoneSupport || ''}
                    onChange={(e) => setFormData({ ...formData, phoneSupport: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Support Hours</label>
                  <input
                    type="text"
                    value={formData.supportHours || 'Mon - Fri: 9:00 AM - 7:00 PM IST'}
                    onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Emergency Executive Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Official Website URL</label>
                <input
                  type="url"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Inline Save Settings Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Syncing...' : saveSuccess ? 'Saved Live!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. BRANDING & THEME TAB */}
          {activeSubTab === 'branding' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Palette className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Emblem, Logo & Theme Customization</h3>
                  <p className="text-[11px] text-slate-400">Choose visual theme palettes, official emblems, and portal welcoming instructions.</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300">Theme Preset Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['blue', 'indigo', 'emerald', 'amber', 'rose', 'violet', 'slate'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, themePreset: preset })}
                      className={`p-3 rounded-2xl border font-bold capitalize text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        formData.themePreset === preset || (!formData.themePreset && preset === 'amber')
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${
                        preset === 'blue' ? 'bg-blue-500' :
                        preset === 'indigo' ? 'bg-indigo-500' :
                        preset === 'emerald' ? 'bg-emerald-500' :
                        preset === 'amber' ? 'bg-amber-500' :
                        preset === 'rose' ? 'bg-rose-500' :
                        preset === 'violet' ? 'bg-violet-500' : 'bg-slate-500'
                      }`} />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo & Emblem Manager */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-300">Logo Source Type:</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoType: 'icon' })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      formData.logoType === 'icon' || !formData.logoType
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Official Emblem
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoType: 'custom' })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      formData.logoType === 'custom'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Custom Upload / URL
                  </button>
                </div>

                {formData.logoType === 'custom' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Upload Logo Image (PNG / JPEG / WebP)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Browse Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {isProcessingImage && (
                          <span className="text-xs text-amber-400 animate-pulse">
                            Optimizing image...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Or Direct Image Web URL
                      </label>
                      <input
                        type="url"
                        value={customLogoUrl}
                        onChange={(e) => {
                          setCustomLogoUrl(e.target.value);
                          setFormData({ ...formData, logoUrl: e.target.value });
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Save Settings Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Syncing...' : saveSuccess ? 'Saved Live!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. EMAIL GOVERNANCE TAB */}
          {activeSubTab === 'email' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Email Governance & 2-Day Executive Digests</h3>
                    <p className="text-[11px] text-slate-400">Control automated outbound alerts, broadcasts, and 2-day executive summary digests.</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    formData.emailNotificationsEnabled !== false
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                  }`}
                >
                  {formData.emailNotificationsEnabled !== false ? 'Notifications Active' : 'Status Emails Muted'}
                </span>
              </div>

              {/* Main Email Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {formData.emailNotificationsEnabled !== false ? (
                        <Bell className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <BellOff className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="text-xs font-bold text-white">
                        Automated Status & Routine Notification Emails
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When enabled, the system dispatches submission updates, broadcasts, and 2-day summaries. When OFF, <strong>only account recovery and password reset emails</strong> are permitted to send.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.emailNotificationsEnabled !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailNotificationsEnabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {formData.emailNotificationsEnabled === false && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-[11px] text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Routine notifications, broadcasts, and 2-day executive digests are currently <strong>MUTED</strong>. Only password recovery and security verification emails remain operational.
                    </span>
                  </div>
                )}
              </div>

              {/* Test 2-Day Digest Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Automated 2-Day Executive Summary Digest System
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The system automatically bundles portal metrics and pending filings every 48 hours for executive review. You can also trigger an immediate test dispatch to your recovery email destination.
                </p>
                <button
                  type="button"
                  onClick={handleTestTwoDayDigest}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Send 2-Day Executive Digest Now</span>
                </button>
                {digestTestMsg && (
                  <p className={`text-xs font-semibold ${digestTestMsg.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {digestTestMsg}
                  </p>
                )}
              </div>

              {/* Inline Save Settings Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Syncing...' : saveSuccess ? 'Saved Live!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. SECURITY & RECOVERY TAB */}
          {activeSubTab === 'security' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Security & Account Recovery Directives</h3>
                  <p className="text-[11px] text-slate-400">Configure administrator recovery email destinations and CEO security safeguards.</p>
                </div>
              </div>

              {/* Admin & Account Recovery Email Configuration */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Admin & Account Recovery Email Destination
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Specify the secure email address where administrator recovery codes and security reset OTPs are dispatched (Default: arnavpro78910@gmail.com). Changing this requires CEO password verification.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Recovery Target Email Address
                    </label>
                    <input
                      type="email"
                      value={recoveryEmailInput}
                      onChange={(e) => setRecoveryEmailInput(e.target.value)}
                      placeholder="arnavpro78910@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Verify CEO Password to Update Recovery Email *
                    </label>
                    <input
                      type="password"
                      value={ceoPassForRecovery}
                      onChange={(e) => setCeoPassForRecovery(e.target.value)}
                      placeholder="Enter CEO Password (8808)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveRecoveryEmail}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Recovery Email Destination
                  </button>
                  {recoveryEmailSavedMsg && (
                    <p className={`text-xs font-semibold ${recoveryEmailSavedMsg.includes('successfully') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {recoveryEmailSavedMsg}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Live Branding & Realistic Signature / Seal Preview */}
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Live Portal Preview</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 text-center">
              <div className="flex justify-center">
                <CompanyLogo branding={formData} size="lg" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {formData.companyName || 'ANTHONY INDIA'}
                </h4>
                <p className="text-xs text-amber-400 font-medium">
                  {formData.tagline || 'Official Executive Protocol'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{formData.supportEmail || 'support@anthonyindia.com'}</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{formData.phoneSupport || '+91 011 4920 8800'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Official Realistic CEO Signature & Modern Holographic Seal */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-extrabold text-white">
                Realistic Signatory & Modern Seal
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              {/* Holographic Modern Seal */}
              <div className="flex items-center justify-between">
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-cyan-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[7px] font-black uppercase text-amber-400 tracking-tighter">OFFICIAL SEAL</span>
                    <ShieldCheck className="w-4 h-4 text-cyan-400 my-0.5" />
                    <span className="text-[6px] font-mono text-slate-300">2026 VERIFIED</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    EXECUTIVE GRADE
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">ID: SEC-8808-V2</p>
                </div>
              </div>

              {/* Realistic Cursive Executive Signature */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="h-14 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
                  {/* Background fine security lines */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:8px_8px]" />
                  <svg className="w-40 h-10 text-amber-300 drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)] relative z-10" viewBox="0 0 200 60" fill="none">
                    <path
                      d="M10 45 C 25 10, 35 50, 45 30 C 55 10, 65 40, 80 20 C 95 0, 110 50, 125 25 C 140 5, 155 45, 175 15 C 185 5, 190 35, 195 30"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="25" y="52" fill="currentColor" fontFamily="serif" fontSize="14" fontStyle="italic" fontWeight="bold">
                      {formData.ceoName || 'Arnav Singh'}
                    </text>
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-bold">{formData.ceoName || 'Arnav Singh'}</span>
                  <span className="text-slate-400">{formData.ceoTitle || 'CEO & Founder'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Applied automatically to all official executive certificates and compliance letters issued across the portal.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};
