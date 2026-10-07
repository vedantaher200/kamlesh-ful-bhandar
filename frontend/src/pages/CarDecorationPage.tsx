import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, MessageCircle, ArrowLeft, Sparkles, Phone } from 'lucide-react';
import { api, createWhatsAppUrl } from '../services/api';
import { CarDecorationPost } from '../types/index';
import LightboxModal, { LightboxImageItem } from '../components/LightboxModal';

export default function CarDecorationPage() {
  const [posts, setPosts] = useState<CarDecorationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await api.getPublishedCarDecorations();
        if (res.success) {
          setPosts(res.posts);
        } else {
          setError('Failed to load car decoration posts.');
        }
      } catch (err: any) {
        console.error('Error loading car decorations:', err);
        setError(err.message || 'Failed to load car decorations.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const lightboxItems: LightboxImageItem[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    image: p.image,
    categoryLabel: 'Car Decoration',
    subCategory: 'Car Decoration',
    altText: p.title,
    priceText: p.priceText || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'Price on Request'),
    floralStyle: p.description || 'Fresh Flower Decoration'
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#059669',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Section Header - Single Option: CAR DECORATION */}
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#ecfdf5',
              color: '#065f46',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            <Car size={15} />
            Floral Vehicle Styling
          </div>
          <h1 className="section-title">CAR DECORATION</h1>
          <p
            style={{
              fontSize: '1.2rem',
              fontStyle: 'italic',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-gold, #d97706)',
              margin: '0.25rem 0 0.5rem'
            }}
          >
            Beautiful Floral Decorations for Every Celebration
          </p>
          <p className="section-description">
            Fresh flower styling for wedding cars, groom entries, and celebratory family vehicles across Nashik.
          </p>
        </div>

        {/* Listing of Admin-Published Posts (Single Source of Truth) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
            <p>Loading published car decoration designs...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#dc2626' }}>
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px dashed #cbd5e1',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <Car size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#334155', margin: '0 0 0.5rem' }}>
              No photo available yet.
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Our team is currently updating new car decoration designs. Contact us directly on WhatsApp to get custom car decoration ideas and instant quotes.
            </p>
            <a
              href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about car flower decoration in Nashik.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ display: 'inline-flex', margin: '0 auto' }}
            >
              <MessageCircle size={17} />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}
          >
            {posts.map((post, index) => {
              const displayPrice = post.priceText || (post.price ? `₹${post.price.toLocaleString('en-IN')}` : 'Price on Request');
              const whatsappMsg = `Hello Kamlesh Ful Bhandar, I saw this Car Decoration on your website ("${post.title}" - ${displayPrice}) and I would like to know availability and book.`;

              return (
                <div
                  key={post.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Original Image */}
                  <div
                    style={{
                      position: 'relative',
                      height: '240px',
                      cursor: 'pointer',
                      backgroundColor: '#f1f5f9',
                      overflow: 'hidden'
                    }}
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.92)',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px'
                      }}
                    >
                      Tap to zoom
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Car Decoration
                    </span>

                    <h2
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.15rem',
                        color: 'var(--color-primary-dark)',
                        margin: '0 0 0.5rem',
                        lineHeight: 1.35
                      }}
                    >
                      {post.title}
                    </h2>

                    {post.description && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: '#64748b',
                          margin: '0 0 1rem',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {post.description}
                      </p>
                    )}

                    {/* Price & WhatsApp CTA */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Price</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                          {displayPrice}
                        </div>
                      </div>

                      <a
                        href={createWhatsAppUrl(whatsappMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{
                          padding: '0.5rem 0.9rem',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          borderRadius: '6px'
                        }}
                      >
                        <MessageCircle size={15} />
                        <span>Enquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WhatsApp Custom Quote Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0d3d29 0%, #15573d 100%)',
            borderRadius: '16px',
            padding: '2rem 2.25rem',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.35rem', color: '#ffffff' }}>
              Want a Custom Floral Decoration for Your Car?
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Share your car photo and occasion date with us on WhatsApp. We provide fresh flowers and on-site decoration anywhere in Nashik.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to get a quote for car flower decoration in Nashik.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: '0.75rem 1.4rem', fontSize: '0.92rem' }}
            >
              <MessageCircle size={18} />
              <span>WhatsApp Us for Quote</span>
            </a>

            <a
              href="tel:9921972936"
              className="btn btn-outline-white"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.92rem' }}
            >
              <Phone size={17} />
              <span>Call 9921972936</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        items={lightboxItems}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
}
