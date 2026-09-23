import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Send,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Cpu,
  Globe,
  Lock,
  Shield,
  Briefcase,
  Zap,
  Target,
  Compass,
  ChevronRight
} from 'lucide-react';
import { CompanyBranding, UserAccount } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { getThemeClasses } from '../utils/theme';
import { Home, ClipboardList, User } from 'lucide-react';

interface AboutCompanyViewProps {
  branding: CompanyBranding;
  currentUser: UserAccount;
  onNavigateToForm: () => void;
  onNavigateToTab?: (tab: 'home' | 'form' | 'status' | 'account' | 'support') => void;
}

export const AboutCompanyView: React.FC<AboutCompanyViewProps> = ({
  branding,
  currentUser,
  onNavigateToForm,
  onNavigateToTab,
}) => {
  const theme = getThemeClasses(branding.themePreset);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quick Support Ticket / Inquiry State
  const [supportCategory, setSupportCategory] = useState('submission-help');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(branding.supportEmail || 'arnavpro78910@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(branding.phoneSupport || '+1 (800) 555-0199');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const generatedId = `SUP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(generatedId);
    setTicketSubmitted(true);
    setSupportSubject('');
    setSupportMessage('');
  };

  const faqs = [
    {
      question: 'How quickly will my submitted intake form be evaluated?',
      answer:
        'All client inquiries, partner registrations, and department requests are assigned to a designated technical review manager within 2 to 4 hours of submission. Full technical evaluations and commercial proposals are delivered within 24 to 48 business hours.',
    },
    {
      question: 'Can I save a draft of my form and complete it later?',
      answer:
        'Yes! The portal features automatic draft preservation. Any information entered into the form fields is stored in your secure local session and restored automatically upon your next visit.',
    },
    {
      question: 'How is my confidential information and attached documentation protected?',
      answer:
        'All data in transit and at rest is secured with 256-bit encryption. Uploaded documents (PDFs, RFPs, architectural briefs) are strictly quarantined in isolated enterprise storage and accessible only by authorized solutions directors under mutual non-disclosure agreements.',
    },
    {
      question: 'How can I check the live status of my submission?',
      answer:
        'You can visit the "My Submission Status" tab in your User Dashboard at any time. It provides a real-time progress timeline, assigned reviewer notes, and downloadable certified PDF receipts.',
    },
    {
      question: 'What if my organization requires a mutual NDA before technical discovery?',
      answer:
        'You can check the "Mutual NDA Required" checkbox directly inside the intake form, or contact our legal and executive desk at ' + (branding.supportEmail || 'arnavpro78910@gmail.com') + ' to receive an executed mutual confidentiality agreement.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300" id="about-company-root">
      {/* 1. TOP HERO SECTION WITH DIRECT FORM NAVIGATION BUTTON */}
      <section className="relative rounded-3xl bg-slate-900 text-white overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-radial from-blue-900/30 via-slate-900/80 to-slate-950/95 pointer-events-none" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Portal</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Est. {branding.foundedYear || '2021'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{branding.officeLocation || 'Global Technology Hub'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {branding.companyName || 'Anthony India'}
            </h1>
            <p className="text-sm sm:text-base text-blue-200/90 font-medium mt-1">
              {branding.tagline || 'Enterprise Software, Cloud Modernization & Certified Intake Architecture'}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-3.5 leading-relaxed">
              {branding.aboutUs ||
                'Anthony India is a premier enterprise digital solutions and cloud consultancy firm. We engineer high-throughput software architectures, mission-critical DevOps pipelines, enterprise AI integration, and secure intake compliance workflows for multinational corporations and fast-scaling organizations worldwide.'}
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mt-6">
              <button
                id="hero-navigate-to-form-btn"
                type="button"
                onClick={onNavigateToForm}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Fill Out Intake Form Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#support-matrix"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Support & Contact Desk</span>
              </a>
            </div>
          </div>

          {/* Right Emblem & Live Metrics Preview */}
          <div className="shrink-0 bg-slate-800/80 backdrop-blur-xs p-6 rounded-2xl border border-slate-700 flex flex-col gap-4 max-w-sm lg:w-80 shadow-md">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-700/80">
              <CompanyLogo branding={branding} size="lg" />
              <div>
                <h3 className="text-sm font-bold text-white">{branding.companyName || 'Anthony India'}</h3>
                <p className="text-[11px] text-slate-400">Official Intake Portal</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">SLA Response</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">24 – 48 Hours</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Security Grade</span>
                <span className="text-base font-bold text-blue-400 mt-0.5 block">256-Bit SSL</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Architecture</span>
                <span className="text-base font-bold text-purple-400 mt-0.5 block">Cloud Native</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Availability</span>
                <span className="text-base font-bold text-amber-400 mt-0.5 block">99.99% Uptime</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToForm}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs border border-blue-400/30 transition-colors cursor-pointer"
            >
              <span>Instant Form Access</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* QUICK CROSS-NAVIGATION HUB */}
      {onNavigateToTab && (
        <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Quick Portal Navigation:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateToTab('home')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Home</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('form')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Form Filling</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('status')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Status</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('account')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>4. Account</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. MISSION, VISION & CORE VALUES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mission Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed flex-1">
            {branding.companyMission ||
              'To accelerate enterprise digital capabilities with zero-compromise security, robust architectural excellence, and lightning-fast operational turnaround.'}
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Our Vision</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed flex-1">
            {branding.companyVision ||
              'To be the globally recognized trusted partner for seamless cloud transformation, intelligent software governance, and automated organizational intake workflows.'}
          </p>
        </div>

        {/* Certified Trust Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Security & Integrity</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed flex-1">
            Enterprise submissions are protected under institutional confidentiality frameworks. Every client payload is timestamped, audited, and strictly reviewed by accredited engineering leads.
          </p>
        </div>
      </section>

      {/* 3. ABOUT THE CEO & EXECUTIVE LEADERSHIP */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* CEO Avatar Card */}
          <div className="flex flex-col items-center text-center lg:w-72 shrink-0 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 w-full lg:w-72">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md border-2 border-white">
                {branding.ceoName ? branding.ceoName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AS'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white" title="Verified Executive">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-4">
              {branding.ceoName || 'Arnav Sharma'}
            </h3>
            <span className="text-xs font-semibold text-blue-600 mt-0.5">
              {branding.ceoTitle || 'Founder & Chief Executive Officer'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Executive Leadership</span>
            </span>

            <div className="w-full border-t border-slate-200 my-4 pt-4 text-left space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-semibold text-slate-800">{branding.companyName || 'Anthony India'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Contact:</span>
                <a href={`mailto:${branding.supportEmail}`} className="font-semibold text-blue-600 hover:underline truncate max-w-[130px]">
                  {branding.supportEmail || 'arnavpro78910@gmail.com'}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToForm}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <span>Submit Form to CEO Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CEO Narrative & Executive Letter */}
          <div className="flex-1 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">Executive Leadership Profile</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                About the Chief Executive Officer
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {branding.ceoBio ||
                'Arnav Sharma is a visionary technologist and systems architect with over a decade of deep expertise in distributed cloud architectures, enterprise security governance, and high-velocity engineering strategy. Under his leadership, Anthony India has helped dozens of enterprise clients scale mission-critical workloads with 99.99% uptime and streamlined compliance.'}
            </p>

            {/* Executive Letter Box */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 sm:p-6 relative">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>A Message from the CEO to Clients & Partners</span>
              </div>
              <blockquote className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                "{branding.ceoMessage ||
                  'At Anthony India, every client inquiry and intake document is treated with the highest degree of technical precision, confidentiality, and executive oversight. We built this portal to ensure your requests are evaluated swiftly by senior solutions engineers without bureaucratic delays. We look forward to partnering with your organization.'}"
              </blockquote>
              <div className="mt-3.5 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">— {branding.ceoName || 'Arnav Sharma'}</span>
                <span className="text-slate-500 font-medium">Founder & CEO, {branding.companyName || 'Anthony India'}</span>
              </div>
            </div>

            {/* Core Competencies badges */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Executive Core Practice Areas:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200">
                  Cloud Infrastructure & DevOps
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200">
                  Enterprise Software Engineering
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200">
                  AI & ML Solution Architecture
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200">
                  Cybersecurity & Compliance Audit
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUPPORT OPTIONS & CHANNELS MATRIX */}
      <section id="support-matrix" className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">Assistance & Escalation</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Support Channels & Help Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Need assistance with your intake submission, technical specifications, or compliance documents? Our team is available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email Support Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Email Support</h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct corporate inbox for formal inquiries, RFP submissions, and legal review.
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-slate-800 truncate">
                  {branding.supportEmail || 'arnavpro78910@gmail.com'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Copy Email Address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Response &lt; 4 Hours</span>
              <a
                href={`mailto:${branding.supportEmail || 'arnavpro78910@gmail.com'}?subject=Inquiry%20via%20User%20Portal&body=Hello%20Anthony%20India%20Team,%0A%0AMy%20Name:%20${encodeURIComponent(currentUser.name)}%0AAccount%20Email:%20${encodeURIComponent(currentUser.email)}%0A%0AInquiry%20Details:%0A`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Compose Email</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Phone / Hotline Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Phone & Hotline</h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct phone assistance for immediate intake clarification and urgent consultation.
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-slate-800 truncate">
                  {branding.phoneSupport || '+1 (800) 555-0199'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Copy Phone Number"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Mon - Fri: 8am - 8pm EST</span>
              <a
                href={`tel:${(branding.phoneSupport || '+18005550199').replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>Call Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Corporate Office Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Technology Center</h3>
              <p className="text-xs text-slate-500 mt-1">
                Global engineering center and primary cloud operations hub.
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                {branding.officeLocation || 'Global Cloud Technology Hub • New Delhi & Bangalore'}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Global Coverage</span>
              {branding.websiteUrl && (
                <a
                  href={branding.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. DIRECT SUPPORT INQUIRY DESK (Quick Ticket Launcher) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Zap className="w-4 h-4" />
            <span>Instant Dispatch Desk</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Submit a Quick Support Ticket or Direct Question
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Have a question prior to submitting your formal intake? Fill out this ticket to reach our operations desk immediately.
          </p>

          {ticketSubmitted ? (
            <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in zoom-in-95">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-950">Support Ticket Logged: {ticketId}</h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Thank you, {currentUser.name}. Your inquiry has been dispatched to our support queue at {branding.supportEmail}. A senior consultant will follow up with your email ({currentUser.email}) within 2 hours.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketSubmitted(false)}
                      className="text-xs font-bold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Submit Another Query
                    </button>
                    <button
                      type="button"
                      onClick={onNavigateToForm}
                      className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Proceed to Intake Form</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendSupportTicket} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Category</label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="submission-help">Intake Form Submission Guidance</option>
                    <option value="technical-specs">Technical Scope & Architecture Question</option>
                    <option value="nda-legal">NDA & Legal Confidentiality</option>
                    <option value="urgent-escalation">Urgent Commercial Escalation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Header</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scope question for Cloud Migration project"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Question / Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide any specific details or questions you need assistance with..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500">
                  Signed in as <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.email})
                </span>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Ticket to Operations</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">Knowledge Base</span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-6 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PROMINENT BOTTOM CALL-TO-ACTION BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-200 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ready to submit your formal application or inquiry?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Launch the Official Intake Form
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
              Fill out your requirements, attach necessary briefs or specifications, and receive a prompt evaluation from our solutions engineering team.
            </p>
          </div>

          <button
            id="bottom-navigate-to-form-btn"
            type="button"
            onClick={onNavigateToForm}
            className="shrink-0 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-sm sm:text-base shadow-xl shadow-slate-950/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Proceed to Form Application</span>
            <ArrowRight className="w-5 h-5 text-blue-700" />
          </button>
        </div>
      </section>
    </div>
  );
};
