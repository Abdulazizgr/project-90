import React from 'react';

interface ApexLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  withGlow?: boolean;
}

export const ApexLogo: React.FC<ApexLogoProps> = ({
  size = 40,
  className = '',
  style = {},
  withGlow = true
}) => {
  const iconSize = Math.round(size * 0.6);
  const radius = Math.round(size * 0.28);

  return (
    <div
      className={`apex-logo-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: `${radius}px`,
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 55%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: withGlow 
          ? '0 6px 20px rgba(99, 102, 241, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.18) inset' 
          : '0 0 0 1px rgba(255, 255, 255, 0.12) inset',
        flexShrink: 0,
        overflow: 'hidden',
        ...style
      }}
      aria-label="Apex OS Logo"
    >
      {/* Ambient background light sheen */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '70%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Modern Apex Peak SVG Mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <linearGradient id="apexGradWhite" x1="12" y1="2.5" x2="12" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="apexCoreCyan" x1="12" y1="14.5" x2="12" y2="20.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Outer Apex Delta / Peak */}
        <path
          d="M12 2.75L3.3 19.5C2.9 20.3 3.5 21 4.4 21H8.5L12 14L15.5 21H19.6C20.5 21 21.1 20.3 20.7 19.5L12 2.75Z"
          fill="url(#apexGradWhite)"
        />

        {/* Inner Apex Performance Core */}
        <path
          d="M12 15.5L9.6 20H14.4L12 15.5Z"
          fill="url(#apexCoreCyan)"
        />

        {/* Summit Beacon Point */}
        <circle cx="12" cy="4" r="1.1" fill="#38bdf8" />
      </svg>
    </div>
  );
};

