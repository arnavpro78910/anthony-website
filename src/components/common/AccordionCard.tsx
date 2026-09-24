import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  id?: string;
}

export const AccordionCard: React.FC<AccordionCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  children,
  className = '',
  headerClassName = '',
  id
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer select-none ${headerClassName}`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right-aligned small arrow that rotates when expanded */}
        <div
          className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 shrink-0 ${
            isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : 'hover:bg-slate-200'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 animate-in fade-in-50 duration-200">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
