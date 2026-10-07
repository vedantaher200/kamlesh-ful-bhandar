import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from '../services/api';

export interface LightboxImageItem {
  id: string;
  title: string;
  image: string;
  categoryLabel?: string;
  subCategory?: string;
  altText?: string;
  priceText?: string;
  suitableFor?: string;
  floralStyle?: string;
}

interface LightboxModalProps {
  items: LightboxImageItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
}

export default function LightboxModal({
  items,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange
}: LightboxModalProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, currentIndex, items.length]);

  if (!isOpen || !currentItem) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIdx = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    onIndexChange(newIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIdx = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    onIndexChange(newIdx);
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    setTouchStartX(null);
  };

  const whatsappMsg = `Hello Kamlesh Ful Bhandar, I saw this design on your website ("${currentItem.title}" - ${currentItem.categoryLabel || 'Floral Work'}) and I would like to know the price and availability.`;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 12, 0.94)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        padding: '1rem'
      }}
    >
      <div
        className="lightbox-wrapper"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f1713',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Top Bar: Counter & Close */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#e2e8f0',
            fontSize: '0.9rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-gold, #f59e0b)' }}>
              {currentIndex + 1}
            </span>
            <span style={{ color: '#94a3b8' }}>of</span>
            <span>{items.length}</span>
            {currentItem.subCategory && (
              <span
                style={{
                  marginLeft: '0.75rem',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  color: '#f8fafc'
                }}
              >
                {currentItem.subCategory}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close Lightbox"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Center: Image with Arrows */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: '320px',
            maxHeight: '62vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050806',
            overflow: 'hidden'
          }}
        >
          <img
            src={currentItem.image}
            alt={currentItem.altText || currentItem.title}
            style={{
              maxWidth: '100%',
              maxHeight: '62vh',
              objectFit: 'contain',
              userSelect: 'none'
            }}
          />

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous Image"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 19, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next Image"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 19, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bottom Details & Direct WhatsApp CTA */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#0f1713',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ flex: '1 1 280px' }}>
            <h3
              style={{
                color: '#ffffff',
                fontSize: '1.05rem',
                margin: '0 0 0.25rem',
                fontFamily: 'var(--font-serif)'
              }}
            >
              {currentItem.title}
            </h3>
            <div
              style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              {currentItem.floralStyle && <span>Style: {currentItem.floralStyle}</span>}
              {currentItem.suitableFor && <span>• Suitable: {currentItem.suitableFor}</span>}
              <span style={{ color: 'var(--color-gold, #f59e0b)', fontWeight: 600 }}>
                • {currentItem.priceText || 'Price on Request'}
              </span>
            </div>
          </div>

          <div>
            <a
              href={createWhatsAppUrl(whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '8px'
              }}
            >
              <MessageCircle size={17} />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
