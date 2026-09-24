import firebaseConfig from '../../firebase-applet-config.json';
import { syncGmailDispatcherToFirestore, getGmailDispatcherFromFirestore } from './firestoreService';
import { DEFAULT_BRANDING } from '../data/templates';

const GMAIL_TOKEN_KEY = 'portal_gmail_oauth_token';
const GMAIL_USER_EMAIL_KEY = 'portal_gmail_sender_email';
const GMAIL_TOKEN_EXPIRY_KEY = 'portal_gmail_token_expiry';

declare global {
  interface Window {
    google?: any;
  }
}

export interface GmailSession {
  accessToken: string;
  senderEmail: string;
  expiresAt: number;
}

/**
 * Get stored Gmail OAuth credentials if still valid
 */
export function getStoredGmailSession(): GmailSession | null {
  try {
    const token = localStorage.getItem(GMAIL_TOKEN_KEY);
    const email = localStorage.getItem(GMAIL_USER_EMAIL_KEY);
    const expiryStr = localStorage.getItem(GMAIL_TOKEN_EXPIRY_KEY);

    if (!token || !email) return null;
    const expiresAt = expiryStr ? parseInt(expiryStr, 10) : 0;

    // Check if token has expired (with 2 min buffer)
    if (expiresAt && Date.now() > expiresAt - 120000) {
      clearStoredGmailSession();
      return null;
    }

    return {
      accessToken: token,
      senderEmail: email,
      expiresAt: expiresAt || Date.now() + 3600 * 1000,
    };
  } catch {
    return null;
  }
}

export function saveGmailSession(accessToken: string, senderEmail: string, expiresInSeconds: number = 3600): void {
  try {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(GMAIL_TOKEN_KEY, accessToken);
    localStorage.setItem(GMAIL_USER_EMAIL_KEY, senderEmail);
    localStorage.setItem(GMAIL_TOKEN_EXPIRY_KEY, expiresAt.toString());

    // Also sync to Firestore so all users can benefit from the configured sender
    syncGmailDispatcherToFirestore({ accessToken, senderEmail, expiresAt }).catch(() => {});
  } catch (err) {
    console.error('Failed to store Gmail session', err);
  }
}

export function clearStoredGmailSession(): void {
  try {
    localStorage.removeItem(GMAIL_TOKEN_KEY);
    localStorage.removeItem(GMAIL_USER_EMAIL_KEY);
    localStorage.removeItem(GMAIL_TOKEN_EXPIRY_KEY);
    syncGmailDispatcherToFirestore(null).catch(() => {});
  } catch {}
}

/**
 * Connect to Gmail using Google Identity Services (GSI)
 */
export function requestGmailAccess(): Promise<{ success: boolean; session?: GmailSession; error?: string }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      resolve({
        success: false,
        error: 'Google Identity Services library is loading. Please try again in a moment.',
      });
      return;
    }

    const clientId = firebaseConfig.oAuthClientId;
    if (!clientId) {
      resolve({
        success: false,
        error: 'Google OAuth Client ID is not configured in this app.',
      });
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        prompt: 'consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            resolve({
              success: false,
              error: tokenResponse.error_description || tokenResponse.error || 'Gmail authorization was denied.',
            });
            return;
          }

          const accessToken = tokenResponse.access_token;
          const expiresIn = parseInt(tokenResponse.expires_in, 10) || 3600;

          // Fetch user profile to identify sender address
          let senderEmail = 'authorized-gmail-sender';
          try {
            const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData.emailAddress) {
                senderEmail = profileData.emailAddress;
              }
            }
          } catch (e) {
            console.warn('Could not fetch Gmail profile email address', e);
          }

          const session: GmailSession = {
            accessToken,
            senderEmail,
            expiresAt: Date.now() + expiresIn * 1000,
          };

          saveGmailSession(accessToken, senderEmail, expiresIn);
          resolve({ success: true, session });
        },
      });

      tokenClient.requestAccessToken();
    } catch (err: any) {
      console.error('Error initializing Gmail token client:', err);
      resolve({
        success: false,
        error: err?.message || 'Failed to initiate Gmail authentication flow.',
      });
    }
  });
}

/**
 * Format RFC 2822 standard email for Gmail API
 */
function createRawMimeMessage({
  to,
  from,
  subject,
  html,
  text,
}: {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}): string {
  const boundary = `__portal_boundary_${Date.now()}__`;
  const fromHeader = from ? `From: ${from}\r\n` : '';
  const messageParts = [
    fromHeader,
    `To: ${to}\r\n`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r\n`,
    'MIME-Version: 1.0\r\n',
    `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`,
    `--${boundary}\r\n`,
    'Content-Type: text/plain; charset="UTF-8"\r\n',
    'Content-Transfer-Encoding: 7bit\r\n\r\n',
    `${text || ''}\r\n\r\n`,
    `--${boundary}\r\n`,
    'Content-Type: text/html; charset="UTF-8"\r\n',
    'Content-Transfer-Encoding: 7bit\r\n\r\n',
    `${html}\r\n\r\n`,
    `--${boundary}--`,
  ];

  const raw = messageParts.join('');
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send real email directly via Google's Gmail API
 */
export async function sendEmailViaGmailApi(
  accessToken: string,
  params: {
    to: string;
    from?: string;
    subject: string;
    html: string;
    text?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const raw = createRawMimeMessage(params);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error?.message || `Gmail API Error: ${response.statusText}`;
      return { success: false, error: msg };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('Failed to send email via Gmail API:', err);
    return { success: false, error: err?.message || 'Network error communicating with Gmail API.' };
  }
}

/**
 * Render standard secure verification email template
 */
export function renderVerificationEmailHtml(
  code: string,
  recipientName: string,
  companyName: string = 'Company Portal'
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">${companyName}</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">Secure Identity & Access Management</p>
      </div>

      <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0;">Hello <b>${recipientName}</b>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Thank you for registering your account on the <b>${companyName}</b>. To activate your account and verify your identity, please enter the following 6-digit confirmation code:
      </p>

      <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700; margin-bottom: 8px;">
          Your 6-Digit Verification Code
        </div>
        <div style="font-size: 38px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 10px; color: #2563eb; display: inline-block;">
          ${code}
        </div>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
        <p style="color: #166534; font-size: 12px; margin: 0; line-height: 1.5;">
          🔒 <b>Security Notice:</b> This code is valid for 15 minutes. For your security, this code was delivered exclusively to this email address and is not displayed on the portal. Never share this code with anyone.
        </p>
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">
        If you did not request this account registration or code, you can safely disregard this email. No changes will be made to your account.
      </p>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          Sent securely via ${companyName} Automated Authentication System
        </p>
      </div>
    </div>
  `;
}

/**
 * Universal dispatcher: Sends verification email using Gmail API (if connected)
 * or via the backend SMTP service. Never returns or leaks the code in the response.
 */
export async function dispatchAccountVerificationEmail(
  email: string,
  code: string,
  name?: string,
  companyName?: string
): Promise<{ success: boolean; method: 'gmail_api' | 'smtp_service'; message: string; error?: string }> {
  const recipientName = name || email.split('@')[0];
  const company = companyName || 'Company Portal';
  const html = renderVerificationEmailHtml(code, recipientName, company);
  const text = `Hello ${recipientName},\n\nYour 6-digit verification code for ${company} is: ${code}\n\nValid for 15 minutes. Sent securely to your email.\n`;
  const subject = `Your Verification Code for ${company}`;

  // 1. Try Gmail API if OAuth session is active (local or global Firestore session)
  let gmailSession = getStoredGmailSession();
  if (!gmailSession) {
    try {
      const globalSession = await getGmailDispatcherFromFirestore();
      if (globalSession && globalSession.accessToken) {
        gmailSession = globalSession;
      }
    } catch {}
  }

  if (gmailSession && gmailSession.accessToken) {
    try {
      const gmailResult = await sendEmailViaGmailApi(gmailSession.accessToken, {
        to: email,
        from: gmailSession.senderEmail,
        subject,
        html,
        text,
      });

      if (gmailResult.success) {
        return {
          success: true,
          method: 'gmail_api',
          message: `Verification code delivered directly to ${email} via Gmail API (Message ID: ${gmailResult.messageId || 'sent'}).`,
        };
      }
      console.warn('Gmail API sending failed, falling back to server dispatcher:', gmailResult.error);
    } catch (e) {
      console.warn('Gmail API dispatch exception, falling back to server dispatcher:', e);
    }
  }

  // 2. Fallback to server email dispatcher
  try {
    let customSmtp: any = undefined;
    try {
      const customSmtpRaw = localStorage.getItem('company_custom_smtp_settings');
      if (customSmtpRaw) {
        const parsed = JSON.parse(customSmtpRaw);
        if (parsed.enabled) {
          customSmtp = parsed;
        }
      }
    } catch {}

    const res = await fetch('/api/send-email-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gmailSession?.accessToken ? { Authorization: `Bearer ${gmailSession.accessToken}` } : {}),
      },
      body: JSON.stringify({
        email,
        code,
        name: recipientName,
        companyName: company,
        customSmtp,
      }),
    });

    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        method: 'smtp_service',
        message: `Verification code sent to ${email}. Please check your email inbox.`,
        previewUrl: data.previewUrl || undefined,
      } as any;
    } else {
      return {
        success: false,
        method: 'smtp_service',
        message: '',
        error: data.error || 'Failed to dispatch email verification message.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      method: 'smtp_service',
      message: '',
      error: err?.message || 'Network error while contacting email service.',
    };
  }
}

/**
 * Dispatches an automated status change notification email to the user
 * Respects CEO / Organization executive setting to turn off routine emails while preserving password recovery
 */
export async function sendSubmissionStatusEmail({
  email,
  userName,
  submissionId,
  formTitle,
  status,
  statusNotes,
  companyName = 'ANTHONY INDIA',
  isCeo = false,
  isVip = false,
}: {
  email: string;
  userName: string;
  submissionId: string;
  formTitle: string;
  status: string;
  statusNotes?: string;
  companyName?: string;
  isCeo?: boolean;
  isVip?: boolean;
}): Promise<{ success: boolean; message?: string; error?: string; skipped?: boolean }> {
  try {
    if (!email) return { success: false, error: 'No recipient email provided' };

    // Check CEO / Governance setting: If emails are turned off by CEO, skip notification
    try {
      const storedBrandingRaw = typeof window !== 'undefined'
        ? (localStorage.getItem('company_portal_branding_v2') || localStorage.getItem('company_branding_v3'))
        : null;
      if (storedBrandingRaw) {
        const parsedBranding = JSON.parse(storedBrandingRaw);
        if (parsedBranding.emailNotificationsEnabled === false) {
          console.log('Status email dispatch muted: Skipping outbound notification to speed up process.');
          return {
            success: true,
            skipped: true,
            message: 'Email notifications are muted in CEO Settings.',
          };
        }
      } else if (DEFAULT_BRANDING.emailNotificationsEnabled === false) {
        // Fallback to default if no local branding found
        console.log('Status email dispatch muted (default): Skipping outbound notification.');
        return {
          success: true,
          skipped: true,
          message: 'Email notifications muted by default.',
        };
      }
    } catch (e) {
      // Ignore localStorage parse errors and proceed
    }

    // DISPATCH NON-BLOCKING: We don't await the fetch if we want it to be "instant"
    // However, to satisfy the return type, we can return immediately and fire the fetch in background
    const dispatchInBackground = async () => {
      let customSmtp: any = undefined;
      try {
        const customSmtpRaw = typeof window !== 'undefined' ? localStorage.getItem('company_custom_smtp_settings') : null;
        if (customSmtpRaw) {
          const parsed = JSON.parse(customSmtpRaw);
          if (parsed.enabled) {
            customSmtp = parsed;
          }
        }
      } catch {}

      try {
        await fetch('/api/send-submission-status-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userName,
            submissionId,
            formTitle,
            status,
            statusNotes,
            companyName,
            isCeo,
            isVip,
            customSmtp,
          }),
        });
      } catch (err) {
        console.warn('Background email dispatch failed (silent):', err);
      }
    };

    // Execute in background without awaiting
    dispatchInBackground();

    // Return immediately to make the UI fast
    return { 
      success: true, 
      message: 'Email dispatch initiated in background for high-speed operation.' 
    };
  } catch (err: any) {
    console.warn('Status notification email could not be sent:', err);
    return { success: false, error: err?.message || 'Email dispatch failed' };
  }
}

