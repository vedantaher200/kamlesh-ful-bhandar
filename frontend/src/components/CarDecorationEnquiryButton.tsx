import React, { useEffect, useState } from 'react';
import { ExternalLink, Image as ImageIcon, MessageCircle, X, Car } from 'lucide-react';
import { createWhatsAppUrl, getConfiguredWhatsAppNumber } from '../services/api';
import { isUnrelatedOrBrokenCarImage } from './SafeCarImage';


export interface CarDecorationEnquiryItem {
  id: string;
  title: string;
  image: string;
  description?: string | null;
  price?: number | null;
  availability?: string | null;
}

export const getCarDecorationPrice = (price?: number | null) =>
  typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : 'Price on Request';

interface Props {
  item: CarDecorationEnquiryItem;
  serviceLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export default function CarDecorationEnquiryButton({ item, serviceLabel = 'Car Decoration', className = 'btn btn-whatsapp', style, compact = false }: Props) {
  const [whatsappNumber, setWhatsappNumber] = useState('919921972936');
  const [showShareSteps, setShowShareSteps] = useState(false);

  useEffect(() => {
    let active = true;
    getConfiguredWhatsAppNumber().then((number) => {
      if (active) setWhatsappNumber(number);
    });
    return () => { active = false; };
  }, []);

  const price = getCarDecorationPrice(item.price);
  const message = [
    `Hello Kamlesh Ful Bhandar, I would like to enquire about this ${serviceLabel.toLowerCase()} design.`,
    `Design: ${item.title}`,
    `Reference ID: ${item.id}`,
    `Description: ${item.description?.trim() || 'No description provided.'}`,
    `Price: ${price}`,
    ...(item.availability?.trim() ? [`Availability: ${item.availability.trim()}`] : []),
    `Photo URL: ${item.image}`,
    'Please confirm availability and booking details for this design.'
  ].join('\n');
  const whatsappUrl = createWhatsAppUrl(message, whatsappNumber);

  const handleShareDirectly = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: message,
          url: item.image
        });
        return;
      } catch {
        // Fall back to window.open
      }
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const openEnquiry = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowShareSteps(true);
  };

  return (
    <>
      <button type="button" onClick={openEnquiry} className={className} style={style}>
        <MessageCircle size={compact ? 14 : 16} />
        <span>Enquire on WhatsApp</span>
      </button>

      {showShareSteps && (
        <div
          role="presentation"
          onClick={() => setShowShareSteps(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15, 23, 42, 0.68)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`car-enquiry-title-${item.id}`}
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(100%, 460px)', background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <h2 id={`car-enquiry-title-${item.id}`} style={{ margin: 0, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Share this exact design</h2>
                <p style={{ margin: '0.35rem 0 0', color: '#475569', fontSize: '0.9rem' }}>{item.title}</p>
              </div>
              <button type="button" aria-label="Close sharing instructions" onClick={() => setShowShareSteps(false)} style={{ background: 'none', border: 0, cursor: 'pointer', padding: '0.2rem' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', margin: '1rem 0', padding: '0.7rem', borderRadius: '10px', background: '#f8fafc' }}>
              {!isUnrelatedOrBrokenCarImage(item.image) ? (
                <img src={item.image} alt={item.title} style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div style={{ width: 76, height: 76, borderRadius: 8, background: 'rgba(5, 150, 105, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Car size={32} />
                </div>
              )}
              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                <strong>{price}</strong>
                <div>{!isUnrelatedOrBrokenCarImage(item.image) ? 'WhatsApp message includes the design photo link so the image preview appears in chat.' : 'Custom floral car decoration handcrafted fresh for your occasion.'}</div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
              You can open the prepared WhatsApp chat directly to discuss vehicle type, flowers, and customization.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageCircle size={16} /> Open prepared chat
              </a>
              {!isUnrelatedOrBrokenCarImage(item.image) && (
                <a href={item.image} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={16} /> Open photo <ExternalLink size={14} />
                </a>
              )}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button type="button" onClick={handleShareDirectly} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ExternalLink size={14} /> Share via Apps
                </button>
              )}
            </div>

          </section>
        </div>
      )}
    </>
  );
}
