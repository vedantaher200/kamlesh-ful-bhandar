import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { GalleryImage } from '../types/index';
import { createWhatsAppUrl } from '../services/api';

interface LightboxModalProps {
  item: GalleryImage | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function LightboxModal({ item, onClose, onPrev, onNext }: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div className="lightbox-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close-btn" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        <button
          className="lightbox-close-btn"
          style={{ right: 'auto', left: '-50px', top: '50%', transform: 'translateY(-50%)' }}
          onClick={onPrev}
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="lightbox-image-wrapper">
          <img src={item.image} alt={item.title} />
        </div>

        <button
          className="lightbox-close-btn"
          style={{ right: '-50px', top: '50%', transform: 'translateY(-50%)' }}
          onClick={onNext}
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>

        <div className="lightbox-caption">
          <h3>{item.title}</h3>
          <p>{item.categoryName || item.category}</p>
          <div style={{ marginTop: '0.75rem' }}>
            <a
              href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I saw this design in your gallery ("${item.title}") and would like details/pricing.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              <MessageCircle size={15} />
              <span>Enquire About This Design on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
