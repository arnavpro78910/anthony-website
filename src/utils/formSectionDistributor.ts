import { FormFieldDefinition } from '../types';

export interface FormSectionGroup {
  id: 'personal' | 'requirements' | 'documents' | 'other';
  title: string;
  fields: FormFieldDefinition[];
}

export type SectionStatusColor = 'red' | 'yellow' | 'green';

/**
 * Intelligently distributes form fields into logical standard sections:
 * 1. Personal
 * 2. Requirements
 * 3. Documents
 * 4. Other (only if distinct fields remain)
 *
 * Guaranteed: Only sections that contain at least 1 field will be included.
 */
export function distributeFormFieldsIntoSections(fields: FormFieldDefinition[]): FormSectionGroup[] {
  if (!fields || fields.length === 0) {
    return [];
  }

  const persFields: FormFieldDefinition[] = [];
  const reqFields: FormFieldDefinition[] = [];
  const docFields: FormFieldDefinition[] = [];
  const otherFields: FormFieldDefinition[] = [];

  const personalKeywords = [
    'name', 'first', 'last', 'full', 'email', 'phone', 'tel', 'mobile',
    'contact', 'gender', 'dob', 'birth', 'age', 'father', 'mother', 'spouse',
    'address', 'city', 'state', 'zip', 'pincode', 'country', 'nationality',
    'citizen', 'aadhaar', 'pan', 'ssn', 'employee', 'applicant', 'client',
    'person', 'designation', 'organization', 'company_name', 'companyName'
  ];

  const documentKeywords = [
    'doc', 'file', 'upload', 'attachment', 'proof', 'passport', 'id_card',
    'photo', 'signature', 'certificate', 'w9', 'w8', 'tax', 'resume', 'cv',
    'license', 'statement', 'bill', 'receipt', 'spec_sheet'
  ];

  const requirementKeywords = [
    'purpose', 'reason', 'requirement', 'service', 'type', 'category', 'plan',
    'tier', 'duration', 'time', 'date', 'priority', 'urgency', 'scope', 'budget',
    'amount', 'cost', 'description', 'details', 'request', 'message', 'inquiry',
    'project', 'spec', 'industry', 'volume', 'option', 'agree', 'consent', 'terms'
  ];

  fields.forEach((field) => {
    const rawKey = `${field.id} ${field.label} ${field.section || ''}`.toLowerCase();

    // 1. Files & Uploads
    if (field.type === 'file' || documentKeywords.some((k) => rawKey.includes(k))) {
      docFields.push(field);
      return;
    }

    // 2. Personal contact / profile
    if (
      field.type === 'email' ||
      field.type === 'tel' ||
      personalKeywords.some((k) => rawKey.includes(k))
    ) {
      persFields.push(field);
      return;
    }

    // 3. Service requirements & specifications
    if (requirementKeywords.some((k) => rawKey.includes(k))) {
      reqFields.push(field);
      return;
    }

    // 4. Default / Other fallback
    otherFields.push(field);
  });

  // If everything ended up in 'other' (rare edge case), rebalance into Personal / Requirements
  if (persFields.length === 0 && reqFields.length === 0 && docFields.length === 0 && otherFields.length > 0) {
    reqFields.push(...otherFields);
    otherFields.length = 0;
  }

  const sections: FormSectionGroup[] = [];

  // Add only non-empty sections
  if (persFields.length > 0) {
    sections.push({
      id: 'personal',
      title: 'Personal',
      fields: persFields,
    });
  }

  if (reqFields.length > 0) {
    sections.push({
      id: 'requirements',
      title: 'Requirements',
      fields: reqFields,
    });
  }

  if (docFields.length > 0) {
    sections.push({
      id: 'documents',
      title: 'Documents',
      fields: docFields,
    });
  }

  if (otherFields.length > 0) {
    sections.push({
      id: 'other',
      title: 'Other',
      fields: otherFields,
    });
  }

  // Safety fallback
  if (sections.length === 0 && fields.length > 0) {
    sections.push({
      id: 'personal',
      title: 'Personal',
      fields: fields,
    });
  }

  return sections;
}

/**
 * Calculates the color indicator for a section:
 * - red: at least 1 required field in this section is empty
 * - yellow: all required fields are filled, but at least 1 optional field is empty
 * - green: all fields (required + optional) in this section are filled
 */
export function getSectionStatus(
  section: FormSectionGroup,
  formData: Record<string, any>
): SectionStatusColor {
  if (!section.fields || section.fields.length === 0) return 'green';

  let hasEmptyRequired = false;
  let hasEmptyOptional = false;

  for (const field of section.fields) {
    const val = formData[field.id];
    const isFilled =
      val !== undefined &&
      val !== null &&
      val !== '' &&
      (field.type !== 'checkbox' || val === true);

    if (field.required) {
      if (!isFilled) {
        hasEmptyRequired = true;
      }
    } else {
      if (!isFilled) {
        hasEmptyOptional = true;
      }
    }
  }

  if (hasEmptyRequired) return 'red';
  if (hasEmptyOptional) return 'yellow';
  return 'green';
}

const DRAFT_PREFIX = 'anthony_wizard_draft_v2_';

export interface SavedWizardProgress {
  templateId: string;
  currentSectionIndex: number;
  formData: Record<string, any>;
  savedAt: string;
}

export function saveDraftWizardProgress(
  templateId: string,
  userId: string,
  currentSectionIndex: number,
  formData: Record<string, any>
): void {
  try {
    const key = `${DRAFT_PREFIX}${templateId}_${userId || 'guest'}`;
    const payload: SavedWizardProgress = {
      templateId,
      currentSectionIndex,
      formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save wizard draft:', e);
  }
}

export function getDraftWizardProgress(
  templateId: string,
  userId: string
): SavedWizardProgress | null {
  try {
    const key = `${DRAFT_PREFIX}${templateId}_${userId || 'guest'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load wizard draft:', e);
    return null;
  }
}

export function clearDraftWizardProgress(templateId: string, userId: string): void {
  try {
    const key = `${DRAFT_PREFIX}${templateId}_${userId || 'guest'}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Failed to clear wizard draft:', e);
  }
}
