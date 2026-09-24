import React from 'react';

interface CEOSignatureProps {
  className?: string;
  color?: string;
}

export const CEOSignature: React.FC<CEOSignatureProps> = ({ 
  className = "w-48 h-24", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      className={`${className} overflow-visible`} 
      viewBox="0 0 240 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0.5px 1px 1px rgba(0,0,0,0.4))' }}
    >
      {/* 
        A handwritten-style signature for "Arnav Singh"
        Crafted with fluid Bézier curves to simulate natural pen pressure and movement
      */}
      
      {/* Capital 'A' for Arnav */}
      <path 
        d="M20,65 C25,30 35,20 40,25 C45,30 35,75 30,75 C25,75 25,60 45,60 C65,60 70,55 75,50" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-95"
      />
      
      {/* 'rnav' - fluid lowercase connections */}
      <path 
        d="M75,50 C80,45 85,45 88,52 C90,60 85,65 92,62 C100,58 105,48 110,50 C115,52 112,65 118,65 C125,65 130,50 135,45 C140,40 145,65 130,65" 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-95"
      />
      
      {/* Capital 'S' for Singh - Large fluid loop */}
      <path 
        d="M150,35 C170,15 190,20 180,45 C170,70 140,65 160,85 C180,105 210,85 220,70" 
        stroke={color} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-95"
      />
      
      {/* 'ingh' - trailing lowercase */}
      <path 
        d="M220,70 C225,65 230,65 235,68 C240,72 235,85 242,82" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-90"
      />
      
      {/* Dot for 'i' in Singh */}
      <circle cx="228" cy="58" r="1.5" fill={color} className="opacity-95" />
      
      {/* Flourish tail at the very end - NO UNDERLINE */}
      <path 
        d="M242,82 C250,80 260,75 265,78" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        className="opacity-70"
      />
    </svg>
  );
};
