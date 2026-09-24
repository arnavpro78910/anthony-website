import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Eye,
  Tag,
  ListFilter,
  Search,
  Plus,
  Edit2,
  Trash2,
  PlusCircle,
  Sliders,
  Settings,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { FormTemplate, FormField } from '../../types';
import { FORM_TEMPLATES } from '../../data/templates';

interface CEOFormManagementTabProps {
  templates: FormTemplate[];
  onSaveTemplate?: (template: FormTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

export const CEOFormManagementTab: React.FC<CEOFormManagementTabProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectTemplate, setInspectTemplate] = useState<FormTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New field input buffer
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'select' | 'file' | 'date' | 'number'>('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const filteredTemplates = templates.filter((tpl) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      tpl.title?.toLowerCase().includes(term) ||
      tpl.department?.toLowerCase().includes(term) ||
      tpl.subtitle?.toLowerCase().includes(term)
    );
  });

  const handleStartCreate = () => {
    const fresh: FormTemplate = {
      id: `tpl-${Date.now()}`,
      title: '',
      subtitle: '',
      department: 'Corporate',
      category: 'general',
      estimatedTime: '2-3 mins',
      sections: ['General'],
      iconName: 'FileText',
      fields: [
        {
          id: `f-${Date.now()}-1`,
          label: 'Full Legal Name',
          type: 'text',
          placeholder: 'Enter full legal name',
          required: true,
        },
        {
          id: `f-${Date.now()}-2`,
          label: 'Official Contact Email',
          type: 'text',
          placeholder: 'official@company.com',
          required: true,
        },
      ],
    };
    setEditingTemplate(fresh);
    setIsCreatingNew(true);
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim() || !editingTemplate) return;

    const newField: FormField = {
      id: `f-${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      placeholder: newFieldPlaceholder.trim() || undefined,
      required: newFieldRequired,
      options: newFieldType === 'select' && newFieldOptions.trim()
        ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean).map((o) => ({ label: o, value: o }))
        : undefined,
    };

    setEditingTemplate({
      ...editingTemplate,
      fields: [...(editingTemplate.fields || []), newField],
    });

    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldOptions('');
    setNewFieldRequired(true);
  };

  const handleRemoveField = (fieldId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields?.filter((f) => f.id !== fieldId) || [],
    });
  };

  const handleSaveEditing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.title.trim()) return;

    if (onSaveTemplate) {
      onSaveTemplate(editingTemplate);
    }

    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleDeleteScheme = (templateId: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the Form Scheme "${title}"?`)) {
      if (onDeleteTemplate) {
        onDeleteTemplate(templateId);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Intake Protocols & Form Blueprint Schemes
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>Filing Schema & Blueprint Control</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Create, edit, and configure active intake schemes, customize dynamic fields, define submission rules, and regulate department categories across the portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all form schemes to system defaults? This will restore the original 4 templates.')) {
                FORM_TEMPLATES.forEach(t => onSaveTemplate?.(t));
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-700 cursor-pointer transition-all self-start md:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Scheme</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blueprint schemes by title, department, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 font-mono border border-slate-700">
                  {tpl.department}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Scheme
                </span>
              </div>

              <h4 className="font-extrabold text-white text-base leading-snug">{tpl.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {tpl.subtitle}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
              <span className="text-slate-500 text-[11px] font-mono">
                {tpl.fields?.length || 0} Dynamic Fields
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInspectTemplate(tpl)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  title="Inspect Field Blueprint"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(tpl);
                    setIsCreatingNew(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteScheme(tpl.id, tpl.title)}
                  className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                  title="Delete Scheme"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INSPECT TEMPLATE MODAL */}
      {inspectTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 font-mono">
                  {inspectTemplate.department}
                </span>
                <h3 className="text-lg font-black text-white">{inspectTemplate.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectTemplate(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{inspectTemplate.subtitle}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Field Definitions ({inspectTemplate.fields?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {inspectTemplate.fields?.map((f, i) => (
                  <div
                    key={f.id || i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{f.label}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Type: {f.type} {f.required && '• Required'}
                      </p>
                    </div>
                    {f.options && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        {f.options.length} dropdown options
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectTemplate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE TEMPLATE MODAL */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditing}
            className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {isCreatingNew ? 'Create New Form Blueprint Scheme' : 'Configure Blueprint Scheme'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define submission requirements, department routing, and intake form fields
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Scheme Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  placeholder="e.g., Executive Strategic Proposal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Department / Regulatory Unit *
                </label>
                <input
                  type="text"
                  required
                  value={editingTemplate.department}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, department: e.target.value })}
                  placeholder="e.g., Executive Affairs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={editingTemplate.category || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  placeholder="e.g., strategic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Scheme Description / Guidelines
                </label>
                <textarea
                  rows={2}
                  value={editingTemplate.subtitle || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subtitle: e.target.value })}
                  placeholder="Provide instructions shown to submitters when completing this form..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Existing Dynamic Fields List */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Scheme Dynamic Fields ({editingTemplate.fields?.length || 0})
              </h4>

              <div className="space-y-2">
                {editingTemplate.fields?.map((f, index) => (
                  <div
                    key={f.id || index}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{f.label}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-amber-300">
                          {f.type}
                        </span>
                        {f.required && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-rose-950 text-rose-300 border border-rose-500/30">
                            Required
                          </span>
                        )}
                      </div>
                      {f.placeholder && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Placeholder: {f.placeholder}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveField(f.id)}
                      className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 cursor-pointer"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Field Sub-Form */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Add Custom Intake Field</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="e.g., Budget Allocation ($ USD)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Input Type
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="textarea">Multi-line Paragraph</option>
                    <option value="select">Dropdown Choice</option>
                    <option value="file">File / Document Attachment</option>
                    <option value="date">Date Selector</option>
                    <option value="number">Numeric Value</option>
                  </select>
                </div>

                {newFieldType === 'select' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Dropdown Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Placeholder Hint
                  </label>
                  <input
                    type="text"
                    value={newFieldPlaceholder}
                    onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                    placeholder="e.g., Select appropriate tier..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="new-field-required-chk"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="new-field-required-chk" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Required Field
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddField}
                disabled={!newFieldLabel.trim()}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 text-xs font-bold cursor-pointer transition-colors"
              >
                + Append Field to Blueprint
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
              >
                Save Scheme Blueprint
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
