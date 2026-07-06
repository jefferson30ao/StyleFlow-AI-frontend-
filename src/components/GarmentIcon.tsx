import React from 'react';
import type { GarmentCategory } from '../types';

interface GarmentIconProps {
  category: GarmentCategory;
  color: string;
  className?: string;
  size?: number;
}

export const GarmentIcon: React.FC<GarmentIconProps> = ({ category, color, className = '', size = 48 }) => {
  // Simple check for high contrast borders
  const isLight = color.toUpperCase() === '#FFFFFF' || color.toUpperCase() === '#FFFDF0' || color.toUpperCase() === '#F9FAFB';

  const renderPath = () => {
    switch (category) {
      case 'tops':
        // A nice T-shirt/Blouse outline path
        return (
          <path d="M17 3c-.7 0-1.3.4-1.6 1L14 6H10L8.6 4c-.3-.6-.9-1-1.6-1H4c-1.1 0-2 .9-2 2v4c0 .6.4 1.1.9 1.2l2.1.7V20c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9.9l2.1-.7c.5-.1.9-.6.9-1.2V5c0-1.1-.9-2-2-2h-3z" />
        );
      case 'bottoms':
        // Elegant pants/skirt silhouette
        return (
          <path d="M18 3H6c-.6 0-1 .4-1 1v17c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-8h2v8c0 .6.4 1 1 1h4c.6 0 1-.4 1-1V4c0-.6-.4-1-1-1z" />
        );
      case 'outerwear':
        // A jacket/coat silhouette
        return (
          <path d="M19 3H5c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 5h2v15H9V5zm6 15h-2V5h2v15zM5 5h2v15H5V5zm14 15h-2V5h2v15z" />
        );
      case 'shoes':
        // An elegant sneaker/boot silhouette
        return (
          <path d="M21 15c-1.5 0-3-1-4.5-2-1.5-1-3-2-5-2H4c-1.1 0-2 .9-2 2v4c0 .6.4 1 1 1h16.5c1.4 0 2.5-1.1 2.5-2.5V15h-1z" />
        );
      case 'accessories':
        // Sunglasses / handbag combination path
        return (
          <path d="M17 6h-2V5c0-1.66-1.34-3-3-3S9 3.34 9 5v1H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-1c0-.55.45-1 1-1s1 .45 1 1v1h-2V5zm6 14H7V8h10v11z" />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.06)',
        color: isLight ? 'var(--color-text-primary)' : '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={className}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: 0.95,
          filter: isLight ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      >
        {renderPath()}
      </svg>
      
      {/* Decorative shading overlay to feel premium */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.08) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
