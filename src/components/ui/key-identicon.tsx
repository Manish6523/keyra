"use client";

import { useMemo } from "react";

interface KeyIdenticonProps {
  value: string;
  size?: number;
  className?: string;
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

export function KeyIdenticon({ value, size = 36, className }: KeyIdenticonProps) {
  const hash = useMemo(() => hashString(value || "keyra-default"), [value]);

  const config = useMemo(() => {
    // Generate deterministic complementary HSL hues
    const h1 = hash % 360;
    const h2 = (h1 + 90 + (hash % 90)) % 360;
    
    // Choose geometric patterns deterministically
    const shapeType = hash % 4; // 0: concentric rings, 1: cross-mesh, 2: core-polygon, 3: solar-burst
    const rotation = (hash % 12) * 30; // 0, 30, 60, ... degrees
    const dashPattern = [
      "4 4",
      "8 4",
      "12 4 4 4",
      "6 2 2 2",
    ][hash % 4];
    
    const scale = 0.85 + ((hash % 10) / 60); // 0.85 to 1.01

    return {
      color1: `hsl(${h1}, 75%, 60%)`,
      color2: `hsl(${h2}, 85%, 45%)`,
      shapeType,
      rotation,
      dashPattern,
      scale,
    };
  }, [hash]);

  const renderShape = () => {
    switch (config.shapeType) {
      case 0: // concentric rings
        return (
          <>
            <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" strokeDasharray={config.dashPattern} />
            <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.65" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.9" />
          </>
        );
      case 1: // cross-mesh
        return (
          <>
            <line x1="50" y1="18" x2="50" y2="82" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
            <line x1="18" y1="50" x2="82" y2="50" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray={config.dashPattern} />
            <rect x="42" y="42" width="16" height="16" rx="4" fill="currentColor" opacity="0.9" />
          </>
        );
      case 2: // core-polygon
        return (
          <>
            <polygon points="50,20 78,38 78,72 50,88 22,72 22,38" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" strokeDasharray={config.dashPattern} />
            <polygon points="50,32 68,44 68,64 50,76 32,64 32,44" fill="currentColor" opacity="0.8" />
            <circle cx="50" cy="50" r="6" fill="#fff" opacity="0.8" />
          </>
        );
      case 3: // solar-burst
      default:
        return (
          <>
            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.8" strokeDasharray={config.dashPattern} />
            <path d="M 50 15 L 50 25 M 50 75 L 50 85 M 15 50 L 25 50 M 75 50 L 85 50 M 26 26 L 34 34 M 66 66 L 74 74 M 74 26 L 66 34 M 34 66 L 26 74" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="50" cy="50" r="14" fill="currentColor" opacity="0.9" />
          </>
        );
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0 ${className}`}
    >
      {/* Background Gradient overlay */}
      <div
        className="absolute inset-0 opacity-15 dark:opacity-20 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${config.color1}, ${config.color2})`,
        }}
      />
      
      {/* Foreground SVG Pattern */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1.5 transition-all duration-300"
        style={{
          color: config.color1,
          transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
        }}
      >
        <defs>
          <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color1} />
            <stop offset="100%" stopColor={config.color2} />
          </linearGradient>
        </defs>
        <g style={{ color: `url(#grad-${hash})` }}>
          {renderShape()}
        </g>
      </svg>
    </div>
  );
}
