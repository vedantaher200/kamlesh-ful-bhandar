import React, { useEffect, useState, useMemo } from 'react';
import { ZoomIn, Info, Sparkles, MessageCircle } from 'lucide-react';
import { api, createWhatsAppUrl } from '../services/api';
import { GalleryImage } from '../types/index';
import LightboxModal, { LightboxImageItem } from '../components/LightboxModal';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../data/portfolioData';

export default function Gallery() {
  const [dbImages, setDbImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'All', label: 'All Photos' },
    { key: 'car-decoration', label: 'Car Decoration' },
    { key: 'haar-varmala', label: 'Haar & Varmala' },
    { key: 'wedding-engagement', label: 'Wedding & Engagement' },
    { key: 'bouquets', label: 'Bouquets & Gifts' },
    { key: 'entrance-decoration', label: 'Door & Entrance' },
    { key: 'fresh-flowers', label: 'Fresh Flowers' },
    { key: 'customer-work', label: 'Real Customer Work' }
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await api.getGallery();
        if (res.success) setDbImages(res.images);
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Combine portfolio items with any dbImages
  const allCombinedItems: LightboxImageItem[] = useMemo(() => {
    const portfolioConverted: LightboxImageItem[] = PORTFOLIO_ITEMS.map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      categoryLabel: p.categoryLabel,
      subCategory: p.subCategory,
      altText: p.altText,
      priceText: p.priceText,
      suitableFor: p.suitableFor,
      floralStyle: p.floralStyle
    }));

    const dbConverted: LightboxImageItem[] = dbImages.map((d) => ({
      id: d.id,
      title: d.title,
      image: d.image,
      categoryLabel: d.categoryName || d.category,
      subCategory: d.categoryName || d.category,
      altText: d.title,
      priceText: 'Price on Request',
      suitableFor: 'Event Decoration',
      floralStyle: 'Fresh Flowers'
    }));

    return [...portfolioConverted, ...dbConverted];
  }, [dbImages]);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return allCombinedItems;

    return allCombinedItems.filter((item) => {
      const matchPortfolio = PORTFOLIO_ITEMS.find((p) => p.id === item.id);
      if (matchPortfolio) {
        return matchPortfolio.category === selectedCategory;
      }
      return (
        item.categoryLabel?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        item.subCategory?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    });
  }, [selectedCategory, allCombinedItems]);

  const handleOpen = (idx: number) => setActiveIndex(idx);
  const handleClose = () => setActiveIndex(null);

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Visual Portfolio</span>
          <h1 className="section-title">Our Work & Customer Gallery</h1>
          <p
            style={{
              fontSize: '1.2rem',
              fontStyle: 'italic',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-gold, #d97706)',
              margin: '0.25rem 0 0.5rem'
            }}
          >
            Real Designs. Real Flowers. Real Celebrations.
          </p>
          <p className="section-description">
            Browse our complete photo collection of wedding car decorations, royal varmalas, celebration bouquets, fresh flowers and venue entrances in Nashik.
          </p>
        </div>

        {/* CATEGORY BAR */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`filter-btn ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '25px',
                fontSize: '0.86rem',
                fontWeight: selectedCategory === cat.key ? 700 : 500,
                cursor: 'pointer',
                border: selectedCategory === cat.key ? '1px solid var(--color-primary-dark)' : '1px solid #e2e8f0',
                background: selectedCategory === cat.key ? 'var(--color-primary-dark)' : '#ffffff',
                color: selectedCategory === cat.key ? '#ffffff' : '#334155',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            No images available in this category.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {filteredItems.map((item, index) => {
              const whatsappMsg = `Hello Kamlesh Ful Bhandar, I saw this design in your gallery ("${item.title}") and would like to know price and availability.`;

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: '240px',
                      cursor: 'pointer',
                      backgroundColor: '#f1f5f9'
                    }}
                    onClick={() => handleOpen(index)}
                  >
                    <img
                      src={item.image}
                      alt={item.altText || item.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 40%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '0.75rem'
                      }}
                    >
                      {item.subCategory && (
                        <span
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: 'var(--color-primary-dark)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px'
                          }}
                        >
                          {item.subCategory}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.05rem',
                        color: 'var(--color-primary-dark)',
                        margin: '0 0 0.35rem'
                      }}
                    >
                      {item.title}
                    </h3>
                    {item.floralStyle && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
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
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                        {item.priceText || 'Price on Request'}
                      </span>
                      <a
                        href={createWhatsAppUrl(whatsappMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        <MessageCircle size={14} />
                        <span>Enquire</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgraded Lightbox Modal */}
      <LightboxModal
        items={filteredItems}
        currentIndex={activeIndex || 0}
        isOpen={activeIndex !== null}
        onClose={handleClose}
        onIndexChange={(newIdx) => setActiveIndex(newIdx)}
      />
    </div>
  );
}
