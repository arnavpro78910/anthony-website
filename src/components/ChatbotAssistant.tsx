import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FileCheck2,
  FileText,
  Layers,
  Headphones,
  Sparkles,
  Plus,
  History,
  Send,
  Paperclip,
  X,
  CheckCircle2,
  Trash2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Bot,
  User,
  ChevronRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Zap,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import { CompanyBranding, UserAccount, FormSubmission, FormTemplate } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { getUserSubmission } from '../utils/storage';
import { FORM_TEMPLATES } from '../data/templates';
import { getDraftWizardProgress } from '../utils/formSectionDistributor';
import aiRobotBannerImg from '../assets/images/ai_assistant_robot_banner_1790096124328.jpg';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachmentName?: string;
  actionButtons?: {
    label: string;
    tab: 'home' | 'form' | 'status' | 'account' | 'support';
  }[];
  quickReplies?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface ChatbotAssistantProps {
  branding: CompanyBranding;
  currentUser: UserAccount;
  onExit: () => void;
  isOverlay?: boolean;
  onNavigateToTab?: (tab: 'home' | 'form' | 'status' | 'account' | 'support' | 'assistant') => void;
  userSubmission?: FormSubmission | null;
}

const STORAGE_KEY_PREFIX = 'anthony_ai_chat_sessions_';

export const ChatbotAssistant: React.FC<ChatbotAssistantProps> = ({
  branding,
  currentUser,
  onExit,
  onNavigateToTab,
  userSubmission: propSubmission,
}) => {
  const companyName = branding.companyName || 'Anthony India';
  const supportEmail = branding.supportEmail || 'arnavpro78910@gmail.com';
  const phoneSupport = branding.phoneSupport || '+1 (800) 555-0199';

  // Real verified submission from props or storage
  const activeSubmission = propSubmission ?? getUserSubmission(currentUser.id, currentUser.email);

  // Sessions and Active Chat state
  const userStorageKey = `${STORAGE_KEY_PREFIX}${currentUser.id}`;
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return `session-${Date.now()}`;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number } | null>(null);
  
  // Botpress Interactive Engine States
  const [isListening, setIsListening] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});
  const speechRecognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Copy message content
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(cleanMessageContent(text));
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Text-to-speech audio reader
  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = cleanMessageContent(text).replace(/[*#_`-]/g, ' ').replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Voice speech-to-text input (English & Hindi)
  const handleToggleVoice = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Works for both Hindi and Indian English
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Handle Feedback
  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackMap((prev) => ({ ...prev, [id]: type }));
  };

  // Save sessions to localStorage
  const saveSessionsToStorage = useCallback((updated: ChatSession[]) => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save chat sessions to localStorage:', e);
    }
  }, [userStorageKey]);

  // Sync active session messages into sessions list
  useEffect(() => {
    if (messages.length === 0) return;

    setSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === activeSessionId);
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 38).trim() + (firstUserMsg.content.length > 38 ? '...' : '')
        : 'Support Inquiry';

      const updatedSession: ChatSession = {
        id: activeSessionId,
        title,
        updatedAt: new Date().toISOString(),
        messages,
      };

      let newSessions: ChatSession[];
      if (existingIdx >= 0) {
        newSessions = [...prev];
        newSessions[existingIdx] = updatedSession;
      } else {
        newSessions = [updatedSession, ...prev];
      }
      saveSessionsToStorage(newSessions);
      return newSessions;
    });
  }, [messages, activeSessionId, saveSessionsToStorage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showHistoryDrawer) {
          setShowHistoryDrawer(false);
        } else {
          onExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, showHistoryDrawer]);

  // Start a new chat
  const handleStartNewChat = () => {
    const newId = `session-${Date.now()}`;
    setActiveSessionId(newId);
    setMessages([]);
    setInput('');
    setAttachedFile(null);
    setShowHistoryDrawer(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Switch to a previous session
  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setInput('');
    setAttachedFile(null);
    setShowHistoryDrawer(false);
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    saveSessionsToStorage(filtered);

    if (activeSessionId === sessionId) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        handleStartNewChat();
      }
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setSessions([]);
    try {
      localStorage.removeItem(userStorageKey);
    } catch (e) {
      console.warn(e);
    }
    handleStartNewChat();
  };

  // 6 Suggestion Cards matching advanced support prompts
  const SUGGESTION_CARDS = [
    {
      id: 'form_guide',
      title: 'Form Filling Guide',
      desc: 'Form filling kaise karu? Kaunse fields mein kya information deni hai?',
      query: 'Form filling kaise karu? Kaunse fields mein kya information deni hai?',
      icon: FileCheck2,
      badge: 'Step-by-Step',
    },
    {
      id: 'next_action',
      title: 'What to Do Next?',
      desc: 'Mera application abhi kya karna hai? Check next actions & status',
      query: 'Mera application abhi kya karna hai?',
      icon: ClipboardList,
      badge: 'Status Action',
    },
    {
      id: 'approval_rate',
      title: 'Approval Rate Inquiry',
      desc: 'Approval rate kya hai? Check official historical data status',
      query: 'Approval rate kya hai?',
      icon: CheckCircle2,
      badge: 'Data Audit',
    },
    {
      id: 'ceo_contact',
      title: 'Direct CEO Contact?',
      desc: 'Kya main CEO se directly contact kar sakta hoon?',
      query: 'Kya main CEO se directly contact kar sakta hoon?',
      icon: Headphones,
      badge: 'Support Route',
    },
    {
      id: 'rejection_reasons',
      title: 'Why Rejections Happen',
      desc: 'Mera application reject kyun ho sakta hai? Verified reasons',
      query: 'Mera application reject kyun ho sakta hai?',
      icon: AlertCircle,
      badge: 'Compliance',
    },
    {
      id: 'required_docs',
      title: 'Required Documents',
      desc: 'What documents are required and how to upload them?',
      query: 'What documents are required for filing an intake form?',
      icon: FileText,
      badge: 'Files',
    },
  ];

  // Helper to determine contextual action buttons from reply content
  const extractActionButtons = (
    text: string
  ): { label: string; tab: 'home' | 'form' | 'status' | 'account' | 'support' }[] => {
    const actions: { label: string; tab: 'home' | 'form' | 'status' | 'account' | 'support' }[] = [];
    const lower = text.toLowerCase();

    // 1. Explicit Action Tags from server or local response
    if (lower.includes('[action:track]')) {
      actions.push({ label: 'Track Application', tab: 'status' });
    }
    if (lower.includes('[action:form]')) {
      actions.push({
        label: activeSubmission ? 'View Form Details' : 'Start Form Filling',
        tab: 'form',
      });
    }
    if (lower.includes('[action:support]')) {
      actions.push({ label: 'Contact Support', tab: 'support' });
    }
    if (lower.includes('[action:help]')) {
      if (!actions.some((a) => a.tab === 'support')) {
        actions.push({ label: 'Support Helpdesk', tab: 'support' });
      }
    }

    // 2. Keyword heuristic fallbacks
    if (
      !actions.some((a) => a.tab === 'status') &&
      (lower.includes('status') ||
        lower.includes('tracking id') ||
        lower.includes('#ai-') ||
        lower.includes('timeline') ||
        lower.includes('certificate'))
    ) {
      actions.push({ label: 'View Status & Receipts', tab: 'status' });
    }

    if (
      !actions.some((a) => a.tab === 'form') &&
      (lower.includes('form filling') ||
        lower.includes('template') ||
        lower.includes('step 1') ||
        lower.includes('fill form') ||
        lower.includes('resume form'))
    ) {
      actions.push({
        label: activeSubmission ? 'View Form Details' : 'Start New Application',
        tab: 'form',
      });
    }

    if (
      !actions.some((a) => a.tab === 'support') &&
      (lower.includes('support email') ||
        lower.includes('phone') ||
        lower.includes('ceo arnav') ||
        lower.includes('helpdesk'))
    ) {
      actions.push({ label: 'Contact Support', tab: 'support' });
    }

    return actions.slice(0, 3);
  };

  // Helper to clean action markup tags from display text
  const cleanMessageContent = (text: string): string => {
    return text.replace(/\[action:[a-zA-Z0-9_-]+\]\s*[^|\n]*/g, '').replace(/\|\s*$/g, '').trim();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if ((!messageContent && !attachedFile) || isLoading) return;

    const userMsgText = messageContent || (attachedFile ? `Please review my attached document: ${attachedFile.name}` : '');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName: attachedFile?.name,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      // Build real live user context
      const userContext = {
        userName: currentUser.name,
        userEmail: currentUser.email,
        role: currentUser.role,
        hasSubmitted: Boolean(activeSubmission),
        submission: activeSubmission
          ? {
              id: activeSubmission.id,
              formTitle: activeSubmission.formTitle,
              status: activeSubmission.status,
              submittedAt: activeSubmission.submittedAt,
              statusNotes: activeSubmission.statusNotes || null,
              workflowStage: activeSubmission.workflowStage || null,
              isCertified: Boolean(activeSubmission.isCertified),
              certificateSerialNumber: activeSubmission.certificateSerialNumber || null,
              attachedFiles: Object.entries(activeSubmission.data || {})
                .filter(([_, v]) => v && typeof v === 'object' && 'name' in (v as any))
                .map(([k, v]: [string, any]) => ({ field: k, name: v.name, size: v.size })),
            }
          : null,
        quota: {
          hasSubmitted: currentUser.hasSubmitted,
          submissionLimit: currentUser.submissionLimit || 1,
        },
      };

      // Compile live website knowledge & inspectable schema
      const activeDrafts = FORM_TEMPLATES.map((tmpl) => {
        const draft = getDraftWizardProgress(tmpl.id, currentUser.id);
        if (draft && draft.formData && Object.keys(draft.formData).length > 0) {
          return {
            templateId: tmpl.id,
            templateTitle: tmpl.title,
            currentStep: draft.currentSectionIndex + 1,
            savedAt: draft.savedAt,
            filledFieldsCount: Object.keys(draft.formData).length,
          };
        }
        return null;
      }).filter(Boolean);

      const portalKnowledge = {
        availableTemplates: FORM_TEMPLATES.map((t) => ({
          id: t.id,
          title: t.title,
          subtitle: t.subtitle,
          department: t.department,
          estimatedTime: t.estimatedTime,
          sections: t.sections,
          fieldsSummary: t.fields.map((f) => `${f.label} (${f.required ? 'Required' : 'Optional'}, Type: ${f.type})`),
        })),
        activeDrafts,
        features: {
          stepperDots: {
            red: 'Required field is empty/pending',
            yellow: 'Required complete, but optional fields empty',
            green: 'Section fully complete and verified',
          },
          autoSave: 'Drafts save automatically with debounce. Safe exit via top Save & Close (X) button preserves step & inputs.',
          reset: 'Form Reset button clears all inputs and restarts wizard from step 1.',
          certificate: 'Official cryptographic certificate issued upon approval with CEO digital signature, seal, and QR code.',
          quota: 'Default 1 active submission limit. Extra quota requires support request.',
          reviewSla: 'Standard review time is 24 to 48 business hours.',
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      let data: any = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.attachmentName ? `${m.content} [Attached File: ${m.attachmentName}]` : m.content,
            })),
            companyContext: {
              companyName: branding.companyName || 'Anthony India',
              supportEmail: branding.supportEmail || 'arnavpro78910@gmail.com',
              phoneSupport: branding.phoneSupport || '+1 (800) 555-0199',
              officeLocation: branding.officeLocation || 'Suite 400, Global Tech Center, Sector 62',
              supportHours: branding.supportHours || '09:00 - 18:00 IST',
              founderCeo: 'Arnav Sharma',
            },
            userContext,
            portalKnowledge,
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          data = await response.json();
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        // Seamless client-side failover without breaking user experience
      }

      let rawBotReply = data?.reply;

      if (!rawBotReply) {
        // High-Precision Client-Side Reasoning Engine
        const qLower = userMsgText.toLowerCase();

        // 0. Strict Security Protection Guardrail
        const secKeywords = [
          'api key', 'apikey', 'secret', 'password', 'token', 'gemini_api_key', 'smtp_pass',
          'env', 'environment variable', 'backend source', 'admin password', 'bypass',
          'ignore all instructions', 'system prompt', 'developer mode', 'jailbreak',
          'private key', 'database credential', 'master key'
        ];
        if (secKeywords.some(k => qLower.includes(k))) {
          rawBotReply = `⚠️ **Security Protocol Notice**:\nCorporate security aur compliance policy ke anusaar **${companyName}** ke internal system credentials, API keys, backend server secrets, database access tokens, aur private infrastructure passwords disclose karna strictly prohibited hai.\n\nMain aapki portal features, form filling, application tracking, SLA guidelines, aur support tickets me madad kar sakta hoon.\n\n[action:form] Open Form | [action:support] Contact Support`;
        } else {
          // 1. Complex Multi-Intent Checks
          const intents: string[] = [];
          if (qLower.includes('vip') || qLower.includes('priority pass') || qLower.includes('premium') || qLower.includes('advantage') || qLower.includes('benefit') || qLower.includes('fayde') || qLower.includes('faida') || qLower.includes('account type')) intents.push('vip');
          if (qLower.includes('hidden') || qLower.includes('feature') || qLower.includes('advance') || qLower.includes('sab batao') || qLower.includes('all feature') || qLower.includes('kya kya hai')) intents.push('features');
          if (qLower.includes('draft') || qLower.includes('save') || qLower.includes('close') || qLower.includes('exit') || qLower.includes('resume') || qLower.includes('reset')) intents.push('draft');
          if (qLower.includes('ceo') || qLower.includes('arnav') || qLower.includes('founder') || qLower.includes('owner')) intents.push('ceo');
          if (qLower.includes('certificate') || qLower.includes('receipt') || qLower.includes('download') || qLower.includes('pdf')) intents.push('certificate');
          if (qLower.includes('reject') || qLower.includes('rejection') || qLower.includes('kyun') || qLower.includes('galti')) intents.push('rejection');
          if (qLower.includes('dot') || qLower.includes('stepper') || qLower.includes('red') || qLower.includes('yellow') || qLower.includes('green')) intents.push('dots');
          if (qLower.includes('status') || qLower.includes('track') || qLower.includes('kaha') || qLower.includes('timeline')) intents.push('status');
          if (qLower.includes('form') && (qLower.includes('fill') || qLower.includes('kaise') || qLower.includes('step') || qLower.includes('template'))) intents.push('form');

          if (intents.length >= 2) {
            const parts: string[] = [];
            if (intents.includes('vip')) parts.push(`💎 **VIP Advantages**: 4-6 hr fast-track review, dedicated reviewer, multiple applications quota (up to 5), instant certificate seal.`);
            if (intents.includes('features')) parts.push(`🚀 **Portal Features**: Auto-save wizard, 3-color status dots, cryptographic PDF certificates, 24-48 hr review SLA, audit timeline.`);
            if (intents.includes('form')) parts.push(`📋 **Form Filling**: Form Filling tab me jakar template chunein aur mandatory PAN/GST details fill karein.`);
            if (intents.includes('draft')) parts.push(`💾 **Auto-Save**: Form ka draft real-time me auto-save hota hai. Top 'Save & Close' (X) button se safe exit kar sakte hain.`);
            if (intents.includes('dots')) parts.push(`🔴🟡🟢 **Stepper Dots**: 🔴 Red (Required pending), 🟡 Yellow (Optional empty), 🟢 Green (Complete).`);
            if (intents.includes('status')) parts.push(`📊 **Status**: ${activeSubmission ? `Aapka filing \`${activeSubmission.id}\` **${activeSubmission.status}** stage par hai.` : 'Status tab me live review progress track karein.'}`);
            if (intents.includes('ceo')) parts.push(`🏢 **CEO Policy**: Founder & CEO Arnav Sharma se direct private contact prohibited hai. Official email \`${branding.supportEmail || 'arnavpro78910@gmail.com'}\` par contact karein.`);
            if (intents.includes('certificate')) parts.push(`🏆 **Certificate**: Approval milne par digitally signed PDF certificate QR verification ke sath download kar sakte hain.`);
            if (intents.includes('rejection')) parts.push(`⚠️ **Rejection Grounds**: PAN/GST mismatch ya unclear attachments ke kaaran form reject ho sakta hai.`);
            rawBotReply = `### 💡 **Quick Portal Guidance**:\n\n${parts.join('\n\n')}\n\n[action:track] View Status | [action:form] Open Form | [action:support] Helpdesk`;
          } else if (qLower.includes('vip') || qLower.includes('priority pass') || qLower.includes('advantage') || qLower.includes('benefit') || qLower.includes('fayde') || qLower.includes('faida') || qLower.includes('premium')) {
            rawBotReply = `### 💎 **VIP & Priority Account ke Key Advantages (${companyName})**:\n\n1. ⚡ **Ultra-Fast 4–6 Hr Priority Review**: Standard 24–48 hours ke bajaye VIP applications **4 se 6 ghante** me process hoti hain.\n2. 👤 **Dedicated Senior Reviewer**: Designated senior verification officer directly file inspect karta hai.\n3. 📈 **Expanded Quota**: 1 active filing limit unlock hokar ek sath **multiple (5 tak) submissions** track kar sakte hain.\n4. 🏆 **Instant Certified PDF Seal**: Approval ke sath instant digital seal aur anti-tamper QR code certificate.\n5. 📞 **24/7 Priority Support Routing**: Tickets aur inquiries ke liye first-response priority desk.\n\n[action:form] Fill Form | [action:track] Track Status | [action:support] Contact Support`;
          } else if (qLower.includes('hidden') || qLower.includes('feature') || qLower.includes('advance') || qLower.includes('sab batao') || qLower.includes('all feature') || qLower.includes('kya kya hai')) {
            rawBotReply = `### 🚀 **${companyName} Advanced Features**:\n1. **Intelligent Stepper**: 🔴 Red / 🟡 Yellow / 🟢 Green state dots.\n2. **Zero-Loss Auto-Save**: Real-time debounce saving & 'Save & Close' (X) recovery.\n3. **Cryptographic Certificate**: Founder & CEO Arnav Sharma signature + QR code.\n4. **Audit Timeline**: Live multi-tier stage progression.\n5. **Duplicate & Quota Safeguards**: 1/1 active limit integrity.\n\n*(Note: System credentials & security secrets are strictly protected).* \n\n[action:form] Open Form | [action:track] Track Status`;
          } else if (qLower.includes('draft') || qLower.includes('save') || qLower.includes('close') || qLower.includes('exit')) {
            rawBotReply = `### 💾 **Auto-Save & Safe Exit**:\n- Aapki progress real-time me automatically draft me save hoti rehti hai.\n- Header ke **'Save & Close' (X)** button par click karke aap kisi bhi samay safe exit kar sakte hain.\n- Wapas aane par form usi step se resume hoga.\n\n[action:form] Resume Form`;
          } else if (qLower.includes('dot') || qLower.includes('stepper') || qLower.includes('color')) {
            rawBotReply = `### 🔴🟡🟢 **Form Stepper Dot Indicators**:\n- 🔴 **Red Dot**: Section me zaroori (mandatory) fields pending hain.\n- 🟡 **Yellow Dot**: Mandatory fields complete hain, optional fields khali hain.\n- 🟢 **Green Dot**: Saare fields complete aur verified hain.\n\n[action:form] Open Form`;
          } else if (qLower.includes('status') || qLower.includes('kaha') || qLower.includes('track') || qLower.includes('timeline')) {
            rawBotReply = activeSubmission
              ? `### 📊 **Live Application Status**:\n- **Form**: ${activeSubmission.formTitle}\n- **ID**: \`${activeSubmission.id}\`\n- **Status**: **${activeSubmission.status}**\n- **Notes**: "${activeSubmission.statusNotes || 'In review queue with technical verification team.'}"\n\n[action:track] View Status Dashboard`
              : `Aapke account par abhi koi active submission nahi hai. Naya form bharne ke liye Form Filling tab par jayein.\n\n[action:form] Fill Form`;
          } else if (qLower.includes('ceo') || qLower.includes('arnav') || qLower.includes('founder') || qLower.includes('owner')) {
            rawBotReply = `### 🏢 **Corporate Leadership Contact Policy**:\n- **Founder & CEO**: **Arnav Sharma**\n- **Company**: **${companyName}**\n\nCompliance aur security rules ke tehat CEO Arnav Sharma se private messaging ya direct phone communication restricted hai. Sabhi inquiries official support email \`${branding.supportEmail || 'arnavpro78910@gmail.com'}\` ya Support Desk ke through route ki jaati hain.\n\n[action:support] Contact Support`;
          } else if (qLower.includes('certificate') || qLower.includes('download') || qLower.includes('pdf')) {
            rawBotReply = activeSubmission?.isCertified || activeSubmission?.status === 'Approved'
              ? `### 🏆 **Official Certificate Ready**:\nAapka digitally signed PDF certificate ready hai! **Status** tab me jakar "Download Official PDF Certificate" par click karein.\n\n[action:track] Download Certificate`
              : `Official verified PDF certificate application **Approved** hone ke baad Status tab se download kiya ja sakta hai.\n\n[action:track] Check Status`;
          } else if (qLower.includes('form') || qLower.includes('kaise') || qLower.includes('bhare')) {
            rawBotReply = `### 📋 **Form Filling Steps**:\n1. **Form Filling** tab me template select karein.\n2. Organization & Corporate PAN/GST details enter karein.\n3. Project Scope aur verification PDF attach karein (<10MB).\n4. Stepper me green hone par **Submit** karein.\n\n[action:form] Open Form`;
          } else if (qLower.includes('reject') || qLower.includes('rejection')) {
            rawBotReply = `### ⚠️ **Rejection Reasons**:\n1. PAN/GST aur Submitter details mismatch\n2. Corrupt ya blurry PDF attachment\n3. Incomplete scope of work\n\nStatus tab me reviewer remarks check karein.\n\n[action:support] Contact Support`;
          } else if (qLower.includes('support') || qLower.includes('contact') || qLower.includes('help')) {
            rawBotReply = `### 📞 **${companyName} Support Desk**:\n- 📧 Email: \`${branding.supportEmail || 'arnavpro78910@gmail.com'}\`\n- 📱 Helpline: \`${branding.phoneSupport || '+1 (800) 555-0199'}\`\n- 🕒 Hours: ${branding.supportHours || '09:00 - 18:00 IST'}\n\n[action:support] Open Support Tab`;
          } else {
            rawBotReply = activeSubmission
              ? `Aapka application \`${activeSubmission.id}\` **${activeSubmission.status}** stage me hai. Main form filling, status tracking, SLA, ya company policies se related har sawal me aapki madad kar sakta hoon.\n\n[action:track] Track Status | [action:support] Helpdesk`
              : `Main **${companyName} AI Support Assistant** hoon. Aap form filling, auto-save drafts, status tracking, CEO contact rules, ya support ke baare me koi bhi sawal puch sakte hain.\n\n[action:form] Fill Form | [action:support] Contact Support`;
          }
        }
      }

      const actionButtons = extractActionButtons(rawBotReply);
      const displayReply = cleanMessageContent(rawBotReply);

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: displayReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      // Complete safety wrapper
      const fallbackReply = `Main **${companyName} AI Assistant** hoon. Aap form filling, application tracking, ya support desk se related sawal puch sakte hain.\n\n[action:track] Track Application | [action:form] Fill Form`;
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: cleanMessageContent(fallbackReply),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: extractActionButtons(fallbackReply),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSuggestionClick = (query: string) => {
    handleSendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({ name: file.name, size: file.size });
    }
  };

  // Render markdown text formatting (bold, bullets, paragraphs, headings, code)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // 1. Heading check
      if (trimmed.startsWith('### ')) {
        const headingText = trimmed.replace(/^###\s*/, '');
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1 flex items-center gap-1.5">
            {headingText}
          </h4>
        );
      }

      // 2. Numbered list check (e.g. 1. Step, 2. Item)
      const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');
      
      let content = line;
      if (numberMatch) {
        content = numberMatch[2];
      } else if (isBullet) {
        content = trimmed.replace(/^[-•*]\s*/, '');
      }

      // Parse bold **text** and inline `code`
      const inlineTokens = content.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
      const renderedParts = inlineTokens.map((token, tIdx) => {
        if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
          return (
            <code
              key={tIdx}
              className="bg-slate-100 text-blue-900 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
          return (
            <strong key={tIdx} className="font-bold text-slate-900">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
          return (
            <em key={tIdx} className="italic text-slate-700">
              {token.slice(1, -1)}
            </em>
          );
        }
        return token;
      });

      if (numberMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 my-0.5">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
              {numberMatch[1]}
            </span>
            <span className="leading-relaxed text-sm flex-1">{renderedParts}</span>
          </div>
        );
      }

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 my-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
            <span className="leading-relaxed text-sm">{renderedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="leading-relaxed text-slate-800 text-sm">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#f8fafc] text-slate-900 font-sans"
      id="full-screen-ai-assistant-page"
    >
      {/* 1. TOP HEADER */}
      <header className="h-16 px-4 sm:px-6 bg-[#0b1329] border-b border-slate-800 text-white flex items-center justify-between z-30 shrink-0 shadow-sm">
        {/* Left: Back button + Logo + Title + Status */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 py-1.5 px-2.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer group"
            title="Return to portal"
            aria-label="Back to portal"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold hidden sm:inline">Back</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo branding={branding} size="sm" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate leading-none">
                  AI Support Assistant
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Official Enterprise
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-400">Online</span>
                <span className="text-slate-500 text-[10px] hidden sm:inline">•</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline truncate max-w-[160px]">
                  {companyName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: New Chat + Chat History Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Start a new chat conversation"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xs:inline">New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95 relative"
            title="View saved chat history"
          >
            <History className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Chat History</span>
            {sessions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {sessions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. CHAT HISTORY SLIDE-OVER DRAWER */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowHistoryDrawer(false)}
          />

          <aside className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Chat History</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">No previous conversations</p>
                  <p className="text-[11px] mt-1 text-slate-400">Your chat sessions will be automatically saved here.</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-blue-50 border-blue-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isActive ? 'text-blue-800 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {session.title || 'Support Query'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(session.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Conversation</span>
              </button>

              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="py-2 px-3 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-50 transition-colors"
                  title="Clear all sessions"
                >
                  Clear All
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* 2.5 GUIDED WORKFLOWS TOOLBAR (Botpress Flow Triggers) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Flows:</span>
        </span>

        <button
          type="button"
          onClick={() => handleSendMessage('Mera application status aur tracking ID check karo')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <ClipboardList className="w-3 h-3 text-emerald-400" />
          <span>Status Tracker Flow</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Form filling kaise karu? Step by step guide do')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <FileCheck2 className="w-3 h-3 text-blue-400" />
          <span>Form Assistant Flow</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Certificate verify kaise karein aur download kaise milega?')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span>Certificate Flow</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Form ke red, yellow, aur green dots ka kya matlab hai?')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <Sparkle className="w-3 h-3 text-rose-400" />
          <span>Dot Colors Explained</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage('Support desk aur CEO contact details kya hain?')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <Headphones className="w-3 h-3 text-indigo-400" />
          <span>Escalate to Support</span>
        </button>
      </div>

      {/* 3. MAIN CHAT AREA */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col justify-between">
        {messages.length === 0 ? (
          /* WELCOME STATE */
          <div className="max-w-3xl w-full mx-auto my-auto py-4 sm:py-8 text-center animate-in fade-in duration-300">
            {/* 3D Robot Mascot Matching Image 1 */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-md p-2 mx-auto mb-4 overflow-hidden relative group">
              <img
                src={aiRobotBannerImg}
                alt="3D AI Support Mascot"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-700">Online</span>
              </div>
            </div>

            {/* Greeting */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1329] tracking-tight">
              Hello! How can I help you today?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
              I'm your {companyName} AI Support Assistant.
            </p>

            {/* Verified badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Understands English, Hindi & Hinglish • Live Portal Sync</span>
            </div>

            {/* 6 Suggestion Cards Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
              {SUGGESTION_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSuggestionClick(card.query)}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md hover:bg-blue-50/20 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <card.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* CONVERSATION STREAM */
          <div className="max-w-3xl w-full mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isBot = msg.role === 'assistant';
              const isLastBotMsg = isBot && index === messages.length - 1;
              const hasThumbsUp = feedbackMap[msg.id] === 'up';
              const hasThumbsDown = feedbackMap[msg.id] === 'down';
              const isSpeaking = speakingMsgId === msg.id;
              const isCopied = copiedMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs ${
                      isBot
                        ? 'bg-[#0b1329] text-blue-300 border border-blue-500/30'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isBot ? 'AI' : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble + Timestamp */}
                  <div className={`space-y-1.5 ${isBot ? 'items-start' : 'items-end'} max-w-full`}>
                    {/* Attachment preview if user uploaded a file */}
                    {msg.attachmentName && (
                      <div
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 mb-1 ${
                          isBot
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-blue-700/60 text-blue-100 border border-blue-500/40'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{msg.attachmentName}</span>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs max-w-2xl'
                          : 'bg-[#1e40af] text-white border border-[#1e40af] rounded-tr-xs max-w-xl'
                      }`}
                    >
                      {isBot ? (
                        <div className="space-y-1 text-slate-800">{renderFormattedText(msg.content)}</div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-white">{msg.content}</p>
                      )}

                      {/* Bot Message Actions Toolbar (Copy, Read Aloud, Thumbs Rating) */}
                      {isBot && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-slate-400">
                          <div className="flex items-center gap-1">
                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                                isCopied ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-500 hover:text-slate-700'
                              }`}
                              title="Copy response to clipboard"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>

                            {/* Speak / Read Aloud Button */}
                            <button
                              type="button"
                              onClick={() => handleSpeak(msg.id, msg.content)}
                              className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                                isSpeaking ? 'text-blue-600 font-bold bg-blue-50 animate-pulse' : 'text-slate-500 hover:text-slate-700'
                              }`}
                              title={isSpeaking ? 'Stop listening' : 'Read aloud with voice'}
                            >
                              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
                            </button>
                          </div>

                          {/* Feedback Thumbs */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, 'up')}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                hasThumbsUp ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Helpful response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, 'down')}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                hasThumbsDown ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Not helpful"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Navigation Buttons */}
                      {isBot && msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                          {msg.actionButtons.map((btn, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onNavigateToTab?.(btn.tab)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
                            >
                              {btn.tab === 'status' && <ClipboardList className="w-3.5 h-3.5" />}
                              {btn.tab === 'form' && <FileCheck2 className="w-3.5 h-3.5" />}
                              {btn.tab === 'support' && <Headphones className="w-3.5 h-3.5" />}
                              <span>{btn.label}</span>
                              <ChevronRight className="w-3 h-3 text-blue-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Follow-up Suggestion Chips on Latest Bot Message */}
                    {isLastBotMsg && !isLoading && (
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Suggested:</span>
                        <button
                          type="button"
                          onClick={() => handleSendMessage('Mera live tracking status dikhao')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Check Status
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMessage('Next step kya hai?')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Next Step?
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMessage('Review time kitna lagega?')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Review Time SLA
                        </button>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] text-slate-400 px-1 ${
                        isBot ? 'text-left' : 'text-right'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 mr-auto max-w-2xl animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-[#0b1329] text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <span className="text-xs text-slate-400 ml-2 font-medium">Assistant is processing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 4. BOTTOM COMPOSER */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 sm:px-6 py-3 shrink-0 shadow-xs">
        <div className="max-w-3xl mx-auto">
          {/* Attached file preview chip */}
          {attachedFile && (
            <div className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs w-fit animate-in fade-in duration-150">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium">{attachedFile.name}</span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-0.5 hover:bg-blue-100 rounded text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Listening Audio Indicator Banner */}
          {isListening && (
            <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span className="font-bold">Listening... Speak in Hindi or English</span>
              </div>
              <button
                type="button"
                onClick={handleToggleVoice}
                className="text-[11px] text-rose-700 font-extrabold underline cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />

          {/* Input & Send Form */}
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              title="Attach document reference (PDF, Image)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
                  : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              title={isListening ? 'Stop listening' : 'Speak message (Voice in Hindi/English)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Multiline auto-expanding textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask in English, Hindi, or Hinglish (e.g. 'Mera application status kya hai?')..."
              rows={1}
              className="flex-1 min-h-[44px] max-h-32 py-2.5 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none text-slate-800 placeholder-slate-400 transition-all leading-normal"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="w-11 h-11 rounded-xl bg-[#1e40af] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:hover:bg-[#1e40af] text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 disabled:cursor-not-allowed"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Disclaimer Text */}
          <p className="text-[11px] text-slate-400 text-center mt-2">
            AI Assistant provides official guidance & live status tracking. Powered by Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};
