import React, { useEffect, useState } from 'react';
import { ZoomIn, Info } from 'lucide-react';
import { api } from '../services/api';
import { GalleryImage } from '../types/index';
import LightboxModal from '../components/LightboxModal';

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'All', label: 'All Photos' },
    { key: 'Wedding', label: 'Wedding' },
    { key: 'Car', label: 'Car Decoration' },
    { key: 'Flower', label: 'Flower Arrangements' },
    { key: 'Bouquets', label: 'Bouquets' },
    { key: 'Events', label: 'Events' },
    { key: 'Traditional', label: 'Traditional & Puja' }
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await api.getGallery(selectedCategory === 'All' ? undefined : selectedCategory);
        if (res.success) setImages(res.images);
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

  const handleOpen = (idx: number) => setActiveIndex(idx);
  const handleClose = () => setActiveIndex(null);
  const handlePrev = () => {
    if (activeIndex === null) return;
    setActiveIndex(activeIndex > 0 ? activeIndex - 1 : images.length - 1);
  };
  const handleNext = () => {
    if (activeIndex === null) return;
    setActiveIndex(activeIndex < images.length - 1 ? activeIndex + 1 : 0);
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Visual Portfolio</span>
          <h1 className="section-title">Decoration & Floral Gallery</h1>
          <p className="section-description">
            Explore our visual portfolio of weddings, cars, garlands, bouquets, and grand celebrations in Nashik.
          </p>
        </div>

        {/* CATEGORY BAR */}
        <div className="catalog-filter-bar" style={{ marginBottom: '2rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`filter-btn ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '650px', margin: '-0.5rem auto 2.5rem', padding: '0.65rem 1.25rem', background: 'rgba(203, 162, 57, 0.08)', border: '1px solid rgba(203, 162, 57, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--color-primary-dark)' }}>
          <Info size={18} style={{ flexShrink: 0, color: 'var(--color-gold)' }} />
          <span>
            Representative floral styles and inspiration concepts. Custom setups are handcrafted on-site in Nashik to your venue specifications.
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '4rem 0' }}>Loading gallery photos from database...</p>
        ) : images.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>No images available in this category.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {images.map((item, index) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  height: '300px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--color-cream-border)'
                }}
                onClick={() => handleOpen(index)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(13, 53, 39, 0.75)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    opacity: 0,
                    transition: 'opacity var(--transition-base)',
                    padding: '1rem',
                    textAlign: 'center'
                  }}
                  className="gallery-hover-overlay"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <ZoomIn size={36} color="var(--color-gold)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>{item.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}>{item.categoryName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeIndex !== null && images[activeIndex] && (
        <LightboxModal
          item={images[activeIndex]}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
