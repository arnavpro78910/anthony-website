import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Settings,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  RotateCcw,
  X,
  Sliders,
  FileText,
  ChevronRight,
  Hash,
  Mail,
  Shield,
  Building,
  Globe,
  HelpCircle,
  Save,
  Sparkles,
  AlertCircle,
  Code,
  Briefcase,
  UserCheck,
  ClipboardList,
  Building2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { FormTemplate, FormFieldDefinition, FormSettings, CompanyBranding } from '../types';
import { saveTemplate, deleteTemplate, resetTemplatesToDefault } from '../utils/storage';

interface FormBlueprintStudioProps {
  templates: FormTemplate[];
  branding: CompanyBranding;
  onRefreshData: () => void;
  showNotification: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

const AVAILABLE_ICONS = [
  { name: 'Briefcase', label: 'Briefcase / Corporate' },
  { name: 'UserCheck', label: 'User Verification / HR' },
  { name: 'ClipboardList', label: 'Clipboard / Intake' },
  { name: 'Building2', label: 'Building / Office' },
  { name: 'FileText', label: 'File / Document' },
  { name: 'Shield', label: 'Shield / Security' },
  { name: 'Layers', label: 'Layers / Architecture' },
  { name: 'Globe', label: 'Globe / International' },
  { name: 'HelpCircle', label: 'Help / Support' },
  { name: 'Settings', label: 'Settings / Technical' },
  { name: 'Sparkles', label: 'Sparkles / Innovation' },
];

const FIELD_TYPES: { type: FormFieldDefinition['type']; label: string; desc: string }[] = [
  { type: 'text', label: 'Short Text', desc: 'Single-line input for names, titles, codes' },
  { type: 'textarea', label: 'Long Text (Textarea)', desc: 'Multi-line detailed input' },
  { type: 'email', label: 'Email Address', desc: 'Validated email format' },
  { type: 'tel', label: 'Phone Number', desc: 'Telephone / mobile number' },
  { type: 'number', label: 'Number', desc: 'Numeric values, budgets, counts' },
  { type: 'select', label: 'Dropdown Select', desc: 'Single selection from a list of options' },
  { type: 'radio', label: 'Radio Choices', desc: 'Single selection from visible radio buttons' },
  { type: 'checkbox', label: 'Single Checkbox', desc: 'Agreement or boolean yes/no toggle' },
  { type: 'date', label: 'Date Picker', desc: 'Standard calendar date selector' },
  { type: 'file', label: 'File Upload', desc: 'Document, PDF, or resume attachment' },
];

export const FormBlueprintStudio: React.FC<FormBlueprintStudioProps> = ({
  templates,
  branding,
  onRefreshData,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  
  // Editor & Studio state
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editorSubTab, setEditorSubTab] = useState<'settings' | 'fields' | 'preview' | 'json'>('settings');

  // Blueprint deletion state (in-app modal, replaces window.confirm)
  const [blueprintToDelete, setBlueprintToDelete] = useState<FormTemplate | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Field editing sub-modal state
  const [editingField, setEditingField] = useState<FormFieldDefinition | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isNewField, setIsNewField] = useState(false);

  // Section editing state
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  // Copy JSON feedback
  const [copiedJson, setCopiedJson] = useState(false);

  // Departments list for filter
  const departments = ['All', ...Array.from(new Set(templates.map((t) => t.department || 'General')))];

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || tpl.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  // Open editor for existing template
  const handleOpenEditor = (tpl: FormTemplate) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl)));
    setIsCreatingNew(false);
    setEditorSubTab('settings');
  };

  // Open editor for creating a new template
  const handleOpenCreateNew = () => {
    const newId = `custom-form-${Date.now().toString(36)}`;
    const newTpl: FormTemplate = {
      id: newId,
      title: 'New Custom Form Blueprint',
      subtitle: 'Official company intake form for client and internal operations.',
      department: 'Operations',
      iconName: 'ClipboardList',
      estimatedTime: '3-5 mins',
      sections: ['General Information', 'Request Details'],
      fields: [
        {
          id: 'full_name',
          label: 'Full Name',
          type: 'text',
          required: true,
          section: 'General Information',
          placeholder: 'e.g. Alex Morgan',
        },
        {
          id: 'contact_email',
          label: 'Email Address',
          type: 'email',
          required: true,
          section: 'General Information',
          placeholder: 'alex@company.com',
        },
        {
          id: 'notes',
          label: 'Inquiry / Project Details',
          type: 'textarea',
          required: true,
          section: 'Request Details',
          placeholder: 'Please provide complete details...',
        },
      ],
      settings: {
        isActive: true,
        submissionLimitPerUser: 1,
        confirmationMessage: 'Thank you! Your submission has been received by administration.',
        allowDrafts: true,
        requireAuth: true,
      },
      isCustom: true,
    };
    setEditingTemplate(newTpl);
    setIsCreatingNew(true);
    setEditorSubTab('settings');
  };

  // Save blueprint changes
  const handleSaveBlueprint = () => {
    if (!editingTemplate) return;

    if (!editingTemplate.title.trim()) {
      showNotification('Form title cannot be empty.', 'danger');
      return;
    }

    if (!editingTemplate.id.trim()) {
      showNotification('Form ID cannot be empty.', 'danger');
      return;
    }

    if (editingTemplate.fields.length === 0) {
      showNotification('The form blueprint must contain at least 1 input field.', 'danger');
      return;
    }

    // Ensure all sections referenced in fields exist
    const uniqueSections = Array.from(new Set([
      ...(editingTemplate.sections || []),
      ...editingTemplate.fields.map(f => f.section || 'General Information')
    ])).filter(Boolean);

    const finalizedTemplate: FormTemplate = {
      ...editingTemplate,
      sections: uniqueSections.length > 0 ? uniqueSections : ['General Information'],
      updatedAt: new Date().toISOString(),
    };

    saveTemplate(finalizedTemplate);
    onRefreshData();
    showNotification(`Form blueprint "${finalizedTemplate.title}" saved and synced successfully!`, 'success');
    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  // Toggle active/inactive status quickly from card
  const handleQuickToggleActive = (tpl: FormTemplate) => {
    const currentActive = tpl.settings?.isActive !== false;
    const updated: FormTemplate = {
      ...tpl,
      settings: {
        ...(tpl.settings || {}),
        isActive: !currentActive,
      },
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(updated);
    onRefreshData();
    showNotification(
      `Form "${tpl.title}" is now ${!currentActive ? 'ACTIVE (accepting submissions)' : 'INACTIVE (closed)'}.`,
      'info'
    );
  };

  // Delete blueprint action (in-app modal confirmed)
  const handleConfirmDeleteBlueprint = () => {
    if (!blueprintToDelete) return;
    deleteTemplate(blueprintToDelete.id);
    onRefreshData();
    showNotification(`Form blueprint "${blueprintToDelete.title}" was permanently removed.`, 'info');
    setBlueprintToDelete(null);
    if (editingTemplate?.id === blueprintToDelete.id) {
      setEditingTemplate(null);
    }
  };

  // Reset to default schemas
  const handleConfirmReset = () => {
    resetTemplatesToDefault();
    onRefreshData();
    showNotification('All form blueprints have been restored to system defaults.', 'success');
    setShowResetConfirm(false);
  };

  // Duplicate blueprint
  const handleDuplicateBlueprint = (tpl: FormTemplate) => {
    const duplicateId = `${tpl.id}-copy-${Date.now().toString(36).substring(2, 6)}`;
    const cloned: FormTemplate = {
      ...JSON.parse(JSON.stringify(tpl)),
      id: duplicateId,
      title: `${tpl.title} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(cloned);
    onRefreshData();
    showNotification(`Cloned blueprint "${cloned.title}". You can now customize it.`, 'success');
  };

  // Field operations inside editor
  const handleOpenAddField = (sectionName?: string) => {
    const defaultSection = sectionName || (editingTemplate?.sections?.[0] || 'General Information');
    const newFieldId = `field_${Date.now().toString(36)}`;
    setEditingField({
      id: newFieldId,
      label: 'New Field',
      type: 'text',
      required: false,
      section: defaultSection,
      placeholder: '',
      helperText: '',
      options: [],
    });
    setEditingFieldIndex(null);
    setIsNewField(true);
  };

  const handleOpenEditField = (field: FormFieldDefinition, index: number) => {
    setEditingField(JSON.parse(JSON.stringify(field)));
    setEditingFieldIndex(index);
    setIsNewField(false);
  };

  const handleSaveField = () => {
    if (!editingField || !editingTemplate) return;

    if (!editingField.label.trim()) {
      showNotification('Field label cannot be empty.', 'danger');
      return;
    }

    if (!editingField.id.trim()) {
      editingField.id = editingField.label.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }

    const currentFields = [...editingTemplate.fields];
    if (isNewField || editingFieldIndex === null) {
      currentFields.push(editingField);
    } else {
      currentFields[editingFieldIndex] = editingField;
    }

    setEditingTemplate({
      ...editingTemplate,
      fields: currentFields,
    });

    setEditingField(null);
    setEditingFieldIndex(null);
    setIsNewField(false);
  };

  const handleDeleteField = (index: number) => {
    if (!editingTemplate) return;
    const currentFields = editingTemplate.fields.filter((_, idx) => idx !== index);
    setEditingTemplate({
      ...editingTemplate,
      fields: currentFields,
    });
    showNotification('Field removed from schema.', 'info');
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingTemplate.fields.length) return;

    const newFields = [...editingTemplate.fields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIdx];
    newFields[targetIdx] = temp;

    setEditingTemplate({
      ...editingTemplate,
      fields: newFields,
    });
  };

  // Section operations
  const handleAddSection = () => {
    if (!editingTemplate || !newSectionName.trim()) return;
    const trimmed = newSectionName.trim();
    if (editingTemplate.sections.includes(trimmed)) {
      showNotification('Section already exists.', 'danger');
      return;
    }
    setEditingTemplate({
      ...editingTemplate,
      sections: [...editingTemplate.sections, trimmed],
    });
    setNewSectionName('');
    setShowAddSection(false);
  };

  const handleDeleteSection = (sectionName: string) => {
    if (!editingTemplate) return;
    if (editingTemplate.sections.length <= 1) {
      showNotification('A blueprint must have at least one section.', 'danger');
      return;
    }
    const remainingSections = editingTemplate.sections.filter(s => s !== sectionName);
    const fallbackSection = remainingSections[0];
    const updatedFields = editingTemplate.fields.map(f =>
      f.section === sectionName ? { ...f, section: fallbackSection } : f
    );
    setEditingTemplate({
      ...editingTemplate,
      sections: remainingSections,
      fields: updatedFields,
    });
    showNotification(`Section "${sectionName}" removed. Associated fields moved to "${fallbackSection}".`, 'info');
  };

  return (
    <div className="space-y-6" id="form-blueprint-studio-root">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Form Blueprint & Schema Studio
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 tracking-wider">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure dynamic intake schemas, adjust form settings, enable/disable form intake, add custom fields, validation rules, and publish changes in real-time across user portals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            title="Reset form schemas to default Anthony India blueprints"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateNew}
            id="create-new-blueprint-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer border border-amber-400"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Form Blueprint</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints by title, department, ID..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Dept:</span>
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedDepartment === dept
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* BLUEPRINTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No form blueprints matched your search</h4>
            <p className="text-xs text-slate-400 mt-1">Try another keyword or create a new form blueprint.</p>
          </div>
        ) : (
          filteredTemplates.map((tpl) => {
            const isActive = tpl.settings?.isActive !== false;
            return (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top Badges & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {tpl.department}
                      </span>
                      {tpl.isCustom && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Custom
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isActive ? '● Active' : '○ Closed / Inactive'}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      ID: {tpl.id}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h4 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {tpl.subtitle}
                  </p>

                  {/* Statistics / Specs */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">SECTIONS</span>
                      <span className="font-bold text-slate-900 text-xs">{tpl.sections.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">FIELDS</span>
                      <span className="font-bold text-slate-900 text-xs">{tpl.fields.length} inputs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">EST. TIME</span>
                      <span className="font-bold text-slate-900 text-xs">{tpl.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Form Settings Highlights */}
                  {tpl.settings && (
                    <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                      {tpl.settings.submissionLimitPerUser !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Limit per user: <strong>{tpl.settings.submissionLimitPerUser}</strong> form(s)</span>
                        </div>
                      )}
                      {tpl.settings.notificationEmail && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">Notifies: <strong>{tpl.settings.notificationEmail}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {/* Quick Active Toggle */}
                    <button
                      type="button"
                      onClick={() => handleQuickToggleActive(tpl)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                      title={isActive ? 'Click to close form intake' : 'Click to activate form intake'}
                    >
                      {isActive ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5 text-rose-600" />
                          <span>Close Intake</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>

                    {/* Duplicate Blueprint */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateBlueprint(tpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Duplicate / Clone this blueprint"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Delete Blueprint */}
                    <button
                      type="button"
                      onClick={() => setBlueprintToDelete(tpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Form Blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditor(tpl)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-amber-400 font-bold text-xs transition-colors cursor-pointer border border-amber-500/30 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Schema & Settings</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL BLUEPRINT SCHEMA & SETTINGS STUDIO MODAL */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Edit3 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {isCreatingNew ? 'Create New Form Blueprint' : `Edit: ${editingTemplate.title}`}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                      {editingTemplate.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Modify form identity, intake settings, add sections, and define interactive fields
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="bg-slate-900 px-6 py-2 border-b border-slate-800 flex items-center gap-2 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditorSubTab('settings')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  editorSubTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Form Settings & Policy</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorSubTab('fields')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  editorSubTab === 'fields'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sections & Fields ({editingTemplate.fields.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorSubTab('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  editorSubTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Interactive Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorSubTab('json')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  editorSubTab === 'json'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Schema JSON</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* SUBTAB 1: FORM SETTINGS & METADATA */}
              {editorSubTab === 'settings' && (
                <div className="space-y-6">
                  {/* General Identification */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>General Form Identification</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Form Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingTemplate.title}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="e.g. Client Solutions Intake Request"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Department / Operational Unit *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingTemplate.department}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, department: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="e.g. Client Services, HR, DevOps, Legal"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Subtitle & Brief Guidance *
                        </label>
                        <textarea
                          rows={2}
                          value={editingTemplate.subtitle}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, subtitle: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="Explain what this form is used for and required instructions..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Estimated Time to Complete
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.estimatedTime}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, estimatedTime: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="e.g. 5-7 mins"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Icon Emblem
                        </label>
                        <select
                          value={editingTemplate.iconName}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, iconName: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.name} value={ic.name}>
                              {ic.name} ({ic.label})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Intake Settings & Policy */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Intake Availability & Policy Controls</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Active Status */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Form Status (Active/Closed)</span>
                          <span className="text-[11px] text-slate-500">Allow users to select and submit this form</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingTemplate.settings?.isActive !== false}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              settings: {
                                ...(editingTemplate.settings || {}),
                                isActive: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Allow Drafts */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Auto-save Drafts</span>
                          <span className="text-[11px] text-slate-500">Preserve user progress automatically</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingTemplate.settings?.allowDrafts !== false}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              settings: {
                                ...(editingTemplate.settings || {}),
                                allowDrafts: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Max Limit */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Submissions Limit per User (1 - 9)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={9}
                          value={editingTemplate.settings?.submissionLimitPerUser || 1}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              settings: {
                                ...(editingTemplate.settings || {}),
                                submissionLimitPerUser: Math.min(9, Math.max(1, parseInt(e.target.value) || 1)),
                              },
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Caps the number of times an employee/client can submit this specific form.
                        </span>
                      </div>

                      {/* Notification Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Notification Recipient Email
                        </label>
                        <input
                          type="email"
                          value={editingTemplate.settings?.notificationEmail || ''}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              settings: {
                                ...(editingTemplate.settings || {}),
                                notificationEmail: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="e.g. intake@company.com"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Receives administrative alerts when a user submits this blueprint.
                        </span>
                      </div>

                      {/* Custom Thank-you Message */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Custom Confirmation / Receipt Message
                        </label>
                        <textarea
                          rows={2}
                          value={editingTemplate.settings?.confirmationMessage || ''}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              settings: {
                                ...(editingTemplate.settings || {}),
                                confirmationMessage: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="e.g. Thank you! Your application has been logged into our secure portal..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: SECTIONS & FIELDS DESIGNER */}
              {editorSubTab === 'fields' && (
                <div className="space-y-6">
                  {/* Section Manager */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Configured Form Sections ({editingTemplate.sections.length})
                      </span>
                      {!showAddSection && (
                        <button
                          type="button"
                          onClick={() => setShowAddSection(true)}
                          className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Section</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {editingTemplate.sections.map((sec) => (
                        <div
                          key={sec}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <span>{sec}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({editingTemplate.fields.filter(f => f.section === sec).length} fields)
                          </span>
                          {editingTemplate.sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                              title="Delete Section"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {showAddSection && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          value={newSectionName}
                          onChange={(e) => setNewSectionName(e.target.value)}
                          placeholder="Section Title (e.g. Budget & Timeline)"
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddSection}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black cursor-pointer"
                        >
                          Add Section
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSection(false);
                            setNewSectionName('');
                          }}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Field List Organized by Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Input Fields Designer ({editingTemplate.fields.length} total)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddField()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add New Field</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {editingTemplate.fields.map((f, idx) => (
                        <div
                          key={f.id ? `${f.id}-${idx}` : `f-${idx}`}
                          className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                        >
                          {/* Reorder Arrows */}
                          <div className="flex flex-col gap-0.5 text-slate-400">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveField(idx, 'up')}
                              className="p-1 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingTemplate.fields.length - 1}
                              onClick={() => handleMoveField(idx, 'down')}
                              className="p-1 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Field Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {f.label}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                {f.type}
                              </span>
                              {f.required ? (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  Required
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Optional</span>
                              )}
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Section: {f.section || 'General'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span className="font-mono">id: {f.id}</span>
                              {f.placeholder && <span className="truncate">placeholder: "{f.placeholder}"</span>}
                              {f.options && <span>{f.options.length} options</span>}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditField(f, idx)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: LIVE PREVIEW SIMULATION */}
              {editorSubTab === 'preview' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Live simulation mode: This is how your updated form will render to employees and clients in the user dashboard.
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-6">
                    {/* Header preview */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {editingTemplate.department}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          ⏱ {editingTemplate.estimatedTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{editingTemplate.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{editingTemplate.subtitle}</p>
                    </div>

                    {/* Section preview */}
                    {editingTemplate.sections.map((sec) => {
                      const fieldsInSec = editingTemplate.fields.filter(f => (f.section || 'General Information') === sec);
                      if (fieldsInSec.length === 0) return null;
                      return (
                        <div key={sec} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                            {sec}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fieldsInSec.map((fld) => (
                              <div key={fld.id} className={fld.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                  {fld.label} {fld.required && <span className="text-rose-500">*</span>}
                                </label>
                                {fld.type === 'textarea' ? (
                                  <textarea
                                    disabled
                                    placeholder={fld.placeholder || 'Textarea preview...'}
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
                                  />
                                ) : fld.type === 'select' ? (
                                  <select disabled className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-500">
                                    <option>{fld.placeholder || 'Select an option...'}</option>
                                    {(fld.options || []).map(opt => <option key={opt.value}>{opt.label}</option>)}
                                  </select>
                                ) : fld.type === 'checkbox' ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <input type="checkbox" disabled className="w-4 h-4 rounded text-blue-600" />
                                    <span className="text-xs text-slate-600">{fld.helperText || 'I agree and confirm'}</span>
                                  </div>
                                ) : fld.type === 'file' ? (
                                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                                    File attachment upload zone
                                  </div>
                                ) : (
                                  <input
                                    type={fld.type}
                                    disabled
                                    placeholder={fld.placeholder || `Enter ${fld.label}...`}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
                                  />
                                )}
                                {fld.helperText && fld.type !== 'checkbox' && (
                                  <span className="text-[10px] text-slate-400 mt-0.5 block">{fld.helperText}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB 4: RAW JSON SCHEMA */}
              {editorSubTab === 'json' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Standard JSON Form Blueprint Definition
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(editingTemplate, null, 2));
                        setCopiedJson(true);
                        setTimeout(() => setCopiedJson(false), 2000);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'Copied JSON!' : 'Copy Blueprint JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl border border-slate-800 overflow-x-auto max-h-[50vh]">
                    {JSON.stringify(editingTemplate, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveBlueprint}
                  id="save-form-blueprint-btn"
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-950 hover:bg-black text-amber-400 font-bold text-xs shadow-md transition-colors cursor-pointer border border-amber-500/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Publish Blueprint</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIELD EDITOR SUB-MODAL */}
      {editingField && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  {isNewField ? 'Add New Input Field' : `Edit Field: ${editingField.label}`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingField.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const autoId = isNewField ? label.toLowerCase().replace(/[^a-z0-9_]/g, '_') : editingField.id;
                    setEditingField({ ...editingField, label, id: autoId });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Estimated Budget ($ USD)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field ID (Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingField.id}
                    onChange={(e) => setEditingField({ ...editingField, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. project_budget"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign to Section
                  </label>
                  <select
                    value={editingField.section || editingTemplate?.sections?.[0] || 'General Information'}
                    onChange={(e) => setEditingField({ ...editingField, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {(editingTemplate?.sections || ['General Information']).map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field Input Type
                </label>
                <select
                  value={editingField.type}
                  onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {FIELD_TYPES.map((ft) => (
                    <option key={ft.type} value={ft.type}>
                      {ft.label} — {ft.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={editingField.placeholder || ''}
                  onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Enter project budget..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Helper / Explanatory Text
                </label>
                <input
                  type="text"
                  value={editingField.helperText || ''}
                  onChange={(e) => setEditingField({ ...editingField, helperText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Provide an approximate amount in USD"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Required Field?</span>
                  <span className="text-[11px] text-slate-500">User must fill this field before submitting</span>
                </div>
                <input
                  type="checkbox"
                  checked={editingField.required || false}
                  onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
              </div>

              {/* Options for Select and Radio */}
              {(editingField.type === 'select' || editingField.type === 'radio') && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Choice Options</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingField.options || [];
                        const nextNum = cur.length + 1;
                        setEditingField({
                          ...editingField,
                          options: [...cur, { label: `Option ${nextNum}`, value: `option_${nextNum}` }],
                        });
                      }}
                      className="text-xs text-blue-600 font-bold hover:text-blue-800 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(editingField.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...(editingField.options || [])];
                            newOpts[optIdx] = { ...newOpts[optIdx], label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') };
                            setEditingField({ ...editingField, options: newOpts });
                          }}
                          placeholder="Option Label"
                          className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = (editingField.options || []).filter((_, idx) => idx !== optIdx);
                            setEditingField({ ...editingField, options: newOpts });
                          }}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-amber-400 text-xs font-bold hover:bg-black cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE BLUEPRINT MODAL (Zero window.confirm, 100% reliable) */}
      {blueprintToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Form Blueprint?</h4>
                <p className="text-xs text-slate-500">Irreversible Schema Removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the blueprint schema for{' '}
              <strong className="text-slate-900">"{blueprintToDelete.title}"</strong> (ID: {blueprintToDelete.id})? This will remove it from both Google Cloud Firestore and the user intake portal.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBlueprintToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBlueprint}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirm Delete Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET DEFAULTS MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Reset All Blueprints?</h4>
                <p className="text-xs text-slate-500">Restore System Defaults</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will restore all default form categories and schemas back to their initial Anthony India enterprise definitions. Any deleted default templates will be restored.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer shadow-xs"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
