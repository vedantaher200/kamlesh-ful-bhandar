import React, { useState, useMemo } from 'react';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../data/portfolioData';
import LightboxModal from './LightboxModal';
import { createWhatsAppUrl } from '../services/api';
import { MessageCircle, Maximize2, Sparkles } from 'lucide-react';

type FilterCategory =
  | 'all'
  | 'car-decoration'
  | 'haar-varmala'
  | 'wedding-engagement'
  | 'bouquets'
  | 'birthday-gifts'
  | 'fresh-flowers'
  | 'entrance-decoration'
  | 'traditional-flower';

interface FilterTab {
  id: FilterCategory;
  label: string;
}

const TABS: FilterTab[] = [
  { id: 'all', label: 'All' },
  { id: 'car-decoration', label: 'Car Decoration' },
  { id: 'haar-varmala', label: 'Haar & Varmala' },
  { id: 'wedding-engagement', label: 'Wedding & Engagement' },
  { id: 'bouquets', label: 'Flower Bouquets' },
  { id: 'birthday-gifts', label: 'Birthday & Special Gifts' },
  { id: 'fresh-flowers', label: 'Fresh Flowers' },
  { id: 'entrance-decoration', label: 'Door & Entrance Decoration' },
  { id: 'traditional-flower', label: 'Traditional Flower Decoration' }
];

export default function RealCustomerGallery() {
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Filtered items based on active tab
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') {
      return PORTFOLIO_ITEMS;
    }
    if (activeTab === 'traditional-flower') {
      return PORTFOLIO_ITEMS.filter(
        (item) =>
          item.category === 'haar-varmala' ||
          item.subCategory?.toLowerCase().includes('traditional') ||
          item.style?.toLowerCase().includes('traditional') ||
          item.category === 'fresh-flowers'
      );
    }
    return PORTFOLIO_ITEMS.filter((item) => item.category === activeTab);
  }, [activeTab]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <section id="our-work-gallery" className="section-padding" style={{ background: '#ffffff' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#fef3c7',
              color: '#92400e',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            <Sparkles size={14} />
            Verified Portfolio
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              color: 'var(--color-primary-dark)',
              margin: '0 0 0.5rem'
            }}
          >
            OUR WORK
          </h2>
          <p
            style={{
              fontSize: '1.2rem',
              fontStyle: 'italic',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-gold, #d97706)',
              margin: '0 0 0.75rem'
            }}
          >
            Real Designs. Real Flowers. Real Celebrations.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Browse our complete photo gallery of actual floral decorations, wedding garlands, car styling and celebration bouquets crafted in Nashik.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '2.5rem'
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '25px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--color-primary-dark)' : '1px solid #e2e8f0',
                  background: isActive ? 'var(--color-primary-dark)' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#334155',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 10px rgba(13, 61, 41, 0.2)' : 'none'
                }}
              >
                {tab.label}
                {tab.id === 'all' && (
                  <span
                    style={{
                      marginLeft: '0.4rem',
                      fontSize: '0.75rem',
                      opacity: 0.85,
                      background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px'
                    }}
                  >
                    {PORTFOLIO_ITEMS.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredItems.map((item, index) => {
            const whatsappText = `Hello Kamlesh Ful Bhandar, I saw this design on your website ("${item.title}" - ${item.categoryLabel}) and I would like to know the price and availability.`;

            return (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: '240px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: '#f1f5f9'
                  }}
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={item.image}
                    alt={item.altText}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.35s ease'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '0.85rem'
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px'
                      }}
                    >
                      {item.subCategory}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(index);
                    }}
                    aria-label="View Fullscreen"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>

                <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.05rem',
                      color: 'var(--color-primary-dark)',
                      margin: '0 0 0.4rem',
                      lineHeight: 1.35
                    }}
                  >
                    {item.title}
                  </h3>

                  {item.floralStyle && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                      {item.floralStyle}
                    </p>
                  )}

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                      {item.priceText || 'Price on Request'}
                    </span>

                    <a
                      href={createWhatsAppUrl(whatsappText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{
                        padding: '0.45rem 0.8rem',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        borderRadius: '6px'
                      }}
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Component */}
        <LightboxModal
          items={filteredItems}
          currentIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onIndexChange={(newIndex) => setLightboxIndex(newIndex)}
        />
      </div>
    </section>
  );
}
