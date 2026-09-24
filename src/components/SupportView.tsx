import React, { useState } from 'react';
import {
  Headphones,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Home,
  FileCheck2,
  ClipboardList,
  User,
  MessageSquare,
  ChevronDown,
  Bot,
  Zap,
  ArrowRight,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { CompanyBranding, UserAccount } from '../types';
import { getThemeClasses } from '../utils/theme';
import { CEOSignature } from './CEOSignature';

interface SupportViewProps {
  branding: CompanyBranding;
  currentUser: UserAccount;
  onNavigateToTab: (tab: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant') => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  branding,
  currentUser,
  onNavigateToTab,
}) => {
  const theme = getThemeClasses(branding.themePreset);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Support Ticket Form State
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
        'All data in transit and at rest is secured with 256-bit encryption. Uploaded documents (PDFs, RFPs, architectural briefs) are strictly quarantined in isolated enterprise storage and accessible only by authorized solutions directors.',
    },
    {
      question: 'How can I check the live status of my submission?',
      answer:
        'You can visit the "Status" tab in your User Dashboard at any time. It provides a real-time progress timeline, assigned reviewer notes, and downloadable certified PDF receipts.',
    },
    {
      question: 'What if my organization requires a mutual NDA before technical discovery?',
      answer:
        'You can check the "Mutual NDA Required" checkbox directly inside the intake form, or contact our legal and executive desk at ' +
        (branding.supportEmail || 'arnavpro78910@gmail.com') +
        ' to receive an executed mutual confidentiality agreement.',
    },
    {
      question: 'Who can I contact if I need urgent help with my account or submission quota?',
      answer:
        'You can use the Quick Support Ticket form on this page or email our support desk directly at ' +
        (branding.supportEmail || 'arnavpro78910@gmail.com') +
        ' for expedited escalation within 2 hours.',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in" id="support-view-root">
      {/* 1. HERO SUPPORT BANNER */}
      <section className="relative rounded-2xl bg-[#0b1329] text-white overflow-hidden border border-slate-800 shadow-md animate-fade-in">
        <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Headphones className="w-3.5 h-3.5" />
                <span>24/7 Corporate Support Desk</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Clock className="w-3.5 h-3.5" />
                <span>24-48 hr Response Time</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Customer Support & Contact Channels
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Have questions regarding your intake form, technical evaluation, or portal account? Our dedicated support team and help desk are here to assist you immediately.
            </p>
          </div>

          {/* Quick SLA Box */}
          <div className="shrink-0 bg-slate-900/90 backdrop-blur-xs p-5 rounded-xl border border-slate-700/80 space-y-2 text-xs w-full md:w-64">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Support Availability:</span>
              <span className="text-emerald-400 font-bold">Mon – Fri</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Help Desk Hours:</span>
              <span className="text-white font-bold">{branding.supportHours || '09:00 - 18:00 IST'}</span>
            </div>
            <div className="pt-2 border-t border-slate-700/80 flex items-center gap-1.5 text-blue-300 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Direct Reviewer Escalation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED AI SUPPORT ASSISTANT LAUNCH CARD */}
      <section className="enterprise-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Gemini AI Assistant • 24/7 Active</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Online
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Chat with {branding.companyName || 'Anthony India'} AI Assistant
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Instant automated guidance for intake form submissions, live status tracking, quota limits, and company processes. Trained strictly on {branding.companyName || 'Anthony India'} policies in English & Hindi.
          </p>

          <div className="flex items-center gap-2 mt-4 flex-wrap text-xs">
            <span className="text-slate-400 font-medium">Quick Topics:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">📝 How to Fill Forms</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">🔍 Track Submission</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">🔒 Quota Allocation</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">🏢 Company & CEO</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <button
            type="button"
            onClick={() => onNavigateToTab('assistant')}
            className="enterprise-btn-primary flex items-center justify-center gap-2.5"
            id="launch-chatbot-assistant-btn"
          >
            <Bot className="w-4 h-4 text-blue-200" />
            <span>Open AI Support Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* LOGICAL INTERCONNECT NAVIGATION HUB */}
      <section className="enterprise-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Quick Portal Routing:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateToTab('home')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Home Page</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('form')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
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
            <span>3. Submission Status</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('account')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-purple-600" />
            <span>4. My Account</span>
          </button>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & DIRECT CHANNELS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Support */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Email Contact Desk</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Send formal inquiries, RFPs, or technical attachments to our support email.
            </p>
            <p className="text-xs font-bold text-slate-900 mt-3 truncate">
              {branding.supportEmail || 'arnavpro78910@gmail.com'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedEmail ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Email!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Email Address</span>
              </>
            )}
          </button>
        </div>

        {/* Phone Support */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Phone Support Line</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Speak directly with an intake manager during business operating hours.
            </p>
            <p className="text-xs font-bold text-slate-900 mt-3 truncate">
              {branding.phoneSupport || '+1 (800) 555-0199'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyPhone}
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedPhone ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Phone!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Phone Number</span>
              </>
            )}
          </button>
        </div>

        {/* Office Address & Location */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Corporate Office Address</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Global Headquarters & Official Operating Center
            </p>
            <p className="text-xs font-bold text-slate-900 mt-3 leading-relaxed">
              {branding.officeLocation || 'Suite 400, Global Tech Center, Sector 62'}
            </p>
          </div>
          <a
            href={`mailto:${branding.supportEmail}`}
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors text-center"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Direct Message</span>
          </a>
        </div>
      </section>

      {/* 3. SUBMIT QUICK SUPPORT TICKET FORM & FREQUENTLY ASKED QUESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Support Form */}
        <section className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Submit Quick Support Ticket</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Need urgent help or have a question about your intake submission? Fill out this quick form for fast support.
          </p>

          {ticketSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 my-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-900 text-base">Support Ticket Logged!</h3>
              <p className="text-xs text-emerald-800">
                Your inquiry has been assigned ticket ID <strong className="font-mono text-emerald-950 bg-emerald-200/60 px-2 py-0.5 rounded">{ticketId}</strong>.
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Our support team will review your message and reply to <strong>{currentUser.email}</strong> within 2 to 4 hours.
              </p>
              <button
                type="button"
                onClick={() => setTicketSubmitted(false)}
                className="mt-2 py-2 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Submit Another Support Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSupportTicket} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Logged User / Contact Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.name} (${currentUser.email})`}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Support Category
                  </label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="submission-help">Form Submission Question</option>
                    <option value="status-inquiry">Submission Status & Review Help</option>
                    <option value="quota-limit">Increase Application Limit</option>
                    <option value="technical">Portal Technical Issue</option>
                    <option value="general">General Support Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Line (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your question..."
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Support Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what you need assistance with in detail..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket to Support Desk</span>
              </button>
            </form>
          )}
        </section>

        {/* FAQ Section */}
        <section className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Find immediate answers to common questions about intake form processing, evaluation SLA, and document security.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left bg-slate-50 hover:bg-slate-100/80 font-bold text-xs text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 border-t border-slate-100 leading-relaxed animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* FLOATING ACTION TRIGGER FOR CHATBOT */}
      <button
        type="button"
        onClick={() => onNavigateToTab('assistant')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#0b1329] hover:bg-[#111c3d] text-white rounded-2xl shadow-xl hover:shadow-2xl border border-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer font-bold text-xs"
        title="Open AI Support Assistant"
        id="floating-ai-assistant-btn"
      >
        <div className="relative">
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
        <span>AI Support Assistant</span>
      </button>
    </div>
  );
};
