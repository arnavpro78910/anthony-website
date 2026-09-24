export interface ThemeColors {
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  primaryBorder: string;
  primaryRing: string;
  pillBg: string;
  pillText: string;
}

export function getThemeClasses(preset?: string): ThemeColors {
  switch (preset) {
    case 'indigo':
      return {
        primaryBg: 'bg-indigo-600',
        primaryHover: 'hover:bg-indigo-700',
        primaryText: 'text-indigo-600',
        primaryBorder: 'border-indigo-200',
        primaryRing: 'focus:ring-indigo-600',
        pillBg: 'bg-indigo-50',
        pillText: 'text-indigo-700',
      };
    case 'emerald':
      return {
        primaryBg: 'bg-emerald-600',
        primaryHover: 'hover:bg-emerald-700',
        primaryText: 'text-emerald-600',
        primaryBorder: 'border-emerald-200',
        primaryRing: 'focus:ring-emerald-600',
        pillBg: 'bg-emerald-50',
        pillText: 'text-emerald-700',
      };
    case 'amber':
      return {
        primaryBg: 'bg-amber-500',
        primaryHover: 'hover:bg-amber-600',
        primaryText: 'text-amber-600',
        primaryBorder: 'border-amber-200',
        primaryRing: 'focus:ring-amber-500',
        pillBg: 'bg-amber-50',
        pillText: 'text-amber-800',
      };
    case 'rose':
      return {
        primaryBg: 'bg-rose-600',
        primaryHover: 'hover:bg-rose-700',
        primaryText: 'text-rose-600',
        primaryBorder: 'border-rose-200',
        primaryRing: 'focus:ring-rose-600',
        pillBg: 'bg-rose-50',
        pillText: 'text-rose-700',
      };
    case 'violet':
      return {
        primaryBg: 'bg-violet-600',
        primaryHover: 'hover:bg-violet-700',
        primaryText: 'text-violet-600',
        primaryBorder: 'border-violet-200',
        primaryRing: 'focus:ring-violet-600',
        pillBg: 'bg-violet-50',
        pillText: 'text-violet-700',
      };
    case 'slate':
      return {
        primaryBg: 'bg-slate-700',
        primaryHover: 'hover:bg-slate-800',
        primaryText: 'text-slate-700',
        primaryBorder: 'border-slate-300',
        primaryRing: 'focus:ring-slate-700',
        pillBg: 'bg-slate-100',
        pillText: 'text-slate-800',
      };
    case 'blue':
    default:
      return {
        primaryBg: 'bg-blue-600',
        primaryHover: 'hover:bg-blue-700',
        primaryText: 'text-blue-600',
        primaryBorder: 'border-blue-200',
        primaryRing: 'focus:ring-blue-600',
        pillBg: 'bg-blue-50',
        pillText: 'text-blue-700',
      };
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Rejected':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'Action Required':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Under Evaluation':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}
