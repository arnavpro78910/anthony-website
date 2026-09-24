import React, { useRef, useState } from 'react';
import { Upload, FileText, X, AlertCircle, Check } from 'lucide-react';
import { FormFieldDefinition, UploadedFileMeta } from '../types';

interface FormFieldProps {
  field: FormFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileMeta: UploadedFileMeta = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };
      onChange(fileMeta);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fileMeta: UploadedFileMeta = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };
      onChange(fileMeta);
    }
  };

  return (
    <div className="w-full space-y-1.5" id={`field-container-${field.id}`}>
      {/* Label and Required Asterisk */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={`input-${field.id}`}
          className="block text-sm font-semibold text-slate-800"
        >
          {field.label}{' '}
          {field.required && (
            <span className="text-red-500 font-bold" title="Required field">
              *
            </span>
          )}
        </label>
      </div>

      {/* Field Input Variant */}
      {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' ? (
        <input
          id={`input-${field.id}`}
          type={field.type}
          value={value || ''}
          placeholder={field.placeholder}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-300 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs'
          }`}
        />
      ) : null}

      {field.type === 'date' ? (
        <input
          id={`input-${field.id}`}
          type="date"
          value={value || ''}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-300 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs'
          }`}
        />
      ) : null}

      {field.type === 'select' ? (
        <div className="relative">
          <select
            id={`input-${field.id}`}
            value={value || ''}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 appearance-none transition-all ${
              error
                ? 'border-rose-300 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs'
            }`}
          >
            <option value="">-- Please select an option --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ) : null}

      {field.type === 'textarea' ? (
        <textarea
          id={`input-${field.id}`}
          rows={4}
          value={value || ''}
          placeholder={field.placeholder}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-300 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs'
          }`}
        />
      ) : null}

      {field.type === 'radio' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {field.options?.map((opt) => {
            const isChecked = value === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={`radio-${field.id}-${opt.value}`}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 font-medium'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  id={`radio-${field.id}-${opt.value}`}
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => onChange(opt.value)}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs leading-relaxed">{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : null}

      {field.type === 'checkbox' ? (
        <label
          htmlFor={`input-${field.id}`}
          className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer mt-1"
        >
          <input
            id={`input-${field.id}`}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-700 font-medium leading-relaxed">
            {field.label}
          </span>
        </label>
      ) : null}

      {/* File Dropzone */}
      {field.type === 'file' ? (
        <div>
          <input
            ref={fileInputRef}
            id={`input-${field.id}`}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          {value ? (
            <div className="flex items-center justify-between p-3.5 bg-blue-50/40 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {value.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(value.size)} • Ready for submission
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to upload or drag & drop document
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supported formats: PDF, DOCX, XLSX, ZIP (Max 15MB)
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Helper text or validation error */}
      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1" id={`error-${field.id}`}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : field.helperText ? (
        <p className="text-[11px] text-slate-500 mt-1" id={`helper-${field.id}`}>
          {field.helperText}
        </p>
      ) : null}
    </div>
  );
};
