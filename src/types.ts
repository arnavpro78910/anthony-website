export type FormCategory = string;

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'radio' | 'file' | 'checkbox' | 'date';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  section?: string;
  defaultValue?: string | number | boolean;
  validationRule?: {
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
}

export type FormField = FormFieldDefinition;

export interface FormSettings {
  isActive?: boolean;
  submissionLimitPerUser?: number;
  confirmationMessage?: string;
  allowDrafts?: boolean;
  requireAuth?: boolean;
  notificationEmail?: string;
  accessRole?: 'all' | 'verified_only' | 'internal_only';
}

export interface FormTemplate {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  estimatedTime: string;
  department: string;
  category?: string;
  sections: string[];
  fields: FormFieldDefinition[];
  settings?: FormSettings;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  previewUrl?: string;
}

export interface FormSubmission {
  id: string; // e.g. REQ-2026-8492
  userId: string; // linked user ID
  userEmail: string; // submitter email
  userName: string; // submitter full name
  templateId: FormCategory;
  formTitle: string;
  submittedAt: string;
  status: 'Pending Review' | 'Under Evaluation' | 'Approved' | 'Acknowledged' | 'Action Required' | 'Rejected';
  statusNotes?: string;
  data: Record<string, string | number | boolean | string[] | UploadedFileMeta | null>;
  companyName: string;
  cloudSyncedAt?: string;
  storageBackend?: string;
  device?: string;
  // Workflow & Verification System
  workflowStage?: 'department_review' | 'ceo_desk' | 'admin_review' | 'ceo_review' | 'completed'; // Stage in 2-step review workflow
  qrVerificationUrl?: string; // Tamper-proof verification URL encoded in certificate QR
  certificateSerialNumber?: string; // e.g. CERT-2026-8492
  lastEmailNotificationSentAt?: string;
  // Executive CEO Review & VIP Routing:
  requestCeoReview?: boolean; // User preference checkbox set on form
  isVipSubmission?: boolean; // True if submitted from a VIP account (directly to CEO)
  isSentToCeo?: boolean; // True if in CEO review queue (VIP or forwarded by Admin)
  sentToCeoByAdmin?: boolean; // True if forwarded to CEO by Admin
  sentByAdminName?: string; // Name/identifier of Admin who forwarded form
  sentToCeoAt?: string; // ISO timestamp when sent to CEO
  isCertified?: boolean; // True if CEO has issued an official certificate
  certifiedAt?: string; // ISO timestamp when certified by CEO
  approvedByCeo?: boolean; // True if explicitly approved by CEO
  ceoApprovedAt?: string; // ISO timestamp when approved by CEO
  deletedByAdminOrCeo?: boolean; // True if removed/rejected by Admin or CEO from their dashboard
  hiddenFromAdminCeo?: boolean; // True if removed from Admin & CEO desks, while remaining visible on User dashboard
  isLocked?: boolean; // True if locked from editing/status changes after Admin or CEO deletion
  deletedByUser?: boolean; // True if permanently deleted by the submitting user
  rejectedAt?: string; // ISO timestamp when rejected
  rejectedByRole?: 'Admin' | 'CEO'; // Role that rejected/deleted the submission
  lastHandledByAdminName?: string; // Name of the admin who last updated the status
  lastHandledAt?: string; // Timestamp of the last status update
  complianceScore?: number; // Automatic compliance integrity score (0-100)
}

export type AdminControlLevel = 'half' | 'full';

export interface UserAccount {
  id: string;
  username?: string;
  email: string;
  name: string;
  password?: string;
  role?: 'user' | 'admin' | 'ceo';
  createdAt: string;
  hasSubmitted: boolean;
  submittedFormId?: string; // id of the 1 submission
  isVip?: boolean; // Declared as VIP Strategic Account by CEO (direct routing to CEO)
  adminControlLevel?: 'half' | 'full'; // Control level for admin accounts set by CEO
  // Account Ban & Suspension Controls:
  isBanned?: boolean;
  bannedUntil?: string; // ISO string timestamp when ban expires, or null/undefined if permanent/not banned
  bannedAt?: string;
  banReason?: string;
  banDurationMinutes?: number;
  failedLoginAttempts?: number;
  // Submission Quota Controls:
  submissionLimit?: number; // default 1
  // Authentication & Verification:
  authProvider?: 'email' | 'google';
  emailVerified?: boolean;
  avatarUrl?: string;
  verificationCode?: string;
  verificationCodeExpires?: number;
  recoveryCode?: string;
  recoveryCodeExpires?: number;
  // Real-time Session & Device Tracking:
  lastLoginAt?: string;
  lastActiveAt?: number;
  isOnline?: boolean;
  lastLoginDevice?: string;
  lastDevice?: string;
  loginCount?: number;
  lastAction?: string;
  lastActionAt?: string;
}

export interface ActivityLog {
  id: string;
  type: 'login' | 'register' | 'submission' | 'logout' | 'status_change' | 'quota_change' | 'ban' | 'unban';
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string; // ISO string
  device: string;
  details: string;
  meta?: Record<string, any>;
}

export interface CompanyBranding {
  companyName: string;
  tagline: string;
  supportEmail: string;
  officeLocation: string;
  department: string;
  logoUrl?: string;
  logoType?: 'icon' | 'custom' | 'generated';
  themePreset?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';
  primaryWelcomeMessage?: string;
  instructionsText?: string;
  phoneSupport?: string;
  websiteUrl?: string;
  aboutUs?: string;
  companyMission?: string;
  companyVision?: string;
  ceoName?: string;
  ceoTitle?: string;
  ceoBio?: string;
  ceoMessage?: string;
  ceoAvatarUrl?: string;
  foundedYear?: string;
  supportHours?: string;
  emergencyContact?: string;
  // Executive Email Notification Controls:
  emailNotificationsEnabled?: boolean; // When false, automated status change & workflow emails are turned off
  allowPasswordResetEmailsOnly?: boolean; // When true, forget password recovery emails always remain operational
  registrationNumber?: string; // e.g. Corporate Identity Number (CIN) or registration number
  taxId?: string; // GSTIN or general Tax ID
  authorizedCapital?: string; // Authorized share capital
  customCopyrightText?: string; // Custom footer copyright notice
}
