import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { CompanyBranding } from '../types';

interface CompanyLogoProps {
  branding?: CompanyBranding;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  branding,
  size = 'md',
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset image error state whenever branding logo changes
  useEffect(() => {
    setImgError(false);
  }, [branding?.logoUrl, branding?.logoType]);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-base',
    lg: 'w-14 h-14 rounded-2xl text-xl',
    xl: 'w-20 h-20 rounded-2xl text-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  const isIconType = branding?.logoType === 'icon';
  const logoUrl = branding?.logoUrl || '/assets/images/company_logo_emblem.jpg';
  const showImage = !isIconType && !imgError && Boolean(logoUrl);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-bold shadow-sm shrink-0 ${sizeClasses[size]} ${className} ${
        onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''
      }`}
      title={branding?.companyName || 'Company Logo'}
    >
      {showImage ? (
        <img
          key={logoUrl}
          src={logoUrl}
          alt={branding?.companyName || 'Company Logo'}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-[inherit]"
        />
      ) : (
        <Building2 className={`${iconSizes[size]} text-blue-400`} />
      )}
    </div>
  );
};

