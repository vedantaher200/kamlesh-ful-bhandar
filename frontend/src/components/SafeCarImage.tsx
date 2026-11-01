import React, { useState } from 'react';
import { Car, Sparkles, ImageOff } from 'lucide-react';

/**
 * Checks if a car decoration image URL is an unrelated dummy/seed image or known broken link.
 */
export const isUnrelatedOrBrokenCarImage = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string' || !url.trim()) return true;
  const lower = url.toLowerCase();
  // Known unrelated demo photos from initial seed (gift box, mountain, broken 404 link)
  if (lower.includes('photo-1549465220-1a8b9238cd48')) return true; // wrapped gift box
  if (lower.includes('photo-1492691527719-9d1e07e534b4')) return true; // mountain landscape
  if (lower.includes('photo-1519225424987-4340d8aa8f61')) return true; // broken 404 on unsplash
  return false;
};

interface SafeCarImageProps {
  src: string | null | undefined;
  alt: string;
  height?: string | number;
  onClick?: () => void;
  showZoomBadge?: boolean;
}

export default function SafeCarImage({
  src,
  alt,
  height = '240px',
  onClick,
  showZoomBadge = true
}: SafeCarImageProps) {
  const [loadError, setLoadError] = useState(false);
  const isInvalid = isUnrelatedOrBrokenCarImage(src) || loadError;

  if (isInvalid) {
    return (
      <div
        style={{
          position: 'relative',
          height,
          backgroundColor: '#f8fafc',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
          textAlign: 'center',
          borderBottom: '1px solid #e2e8f0',
          userSelect: 'none'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(5, 150, 105, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            marginBottom: '0.65rem'
          }}
        >
          <Car size={24} />
        </div>
        <p
          style={{
            margin: '0 0 0.25rem',
            fontWeight: 600,
            fontSize: '0.88rem',
            color: '#334155'
          }}
        >
          Photograph Updating Soon
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#64748b',
            lineHeight: 1.35,
            maxWidth: '240px'
          }}
        >
          Handcrafted fresh flower vehicle styling available on request
        </p>
        <span
          style={{
            marginTop: '0.65rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#059669',
            background: '#ecfdf5',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px'
          }}
        >
          <Sparkles size={11} /> Fresh Design
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        height,
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: '#f1f5f9',
        overflow: 'hidden'
      }}
      onClick={onClick}
    >
      <img
        src={src!}
        alt={alt}
        loading="lazy"
        onError={() => setLoadError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.3s ease'
        }}
      />
      {showZoomBadge && onClick && (
        <span
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.92)',
            color: 'var(--color-primary-dark, #0a261c)',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          Tap to zoom
        </span>
      )}
    </div>
  );
}
