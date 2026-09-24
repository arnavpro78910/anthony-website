import { FormSubmission, CompanyBranding, UserAccount, ActivityLog, FormTemplate } from '../../types';

export type CEOTabId =
  | 'overview'
  | 'queue'
  | 'company_governance'
  | 'user_quotas'
  | 'announcements'
  | 'analytics'
  | 'activity'
  | 'admin'
  | 'form_management';

export type QueueSubFilter =
  | 'all'
  | 'pending'
  | 'vip'
  | 'approved_by_ceo'
  | 'escalated'
  | 'certified'
  | 'action_required'
  | 'approved';

export type QueueRoutingFilter =
  | 'all'
  | 'admin_forwarded'
  | 'vip_direct'
  | 'admin_handled'
  | 'unhandled';

export type QueueSortOrder =
  | 'newest'
  | 'oldest'
  | 'vip_first'
  | 'pending_first';

export interface CEONotification {
  message: string;
  type: 'success' | 'info' | 'error';
}
