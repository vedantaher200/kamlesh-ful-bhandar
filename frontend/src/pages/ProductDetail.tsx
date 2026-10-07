import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle,
  Phone,
  ArrowLeft,
  CalendarCheck,
  ShieldCheck,
  Truck,
  Sparkles,
  Info,
  ChevronRight,
  ImageOff
} from 'lucide-react';
import { api, createWhatsAppUrl, formatPrice } from '../services/api';
import { Product } from '../types/index';
import WhatsAppBookingModal from '../components/WhatsAppBookingModal';

export default function ProductDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.getProduct(idOrSlug);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.image);

          // Fetch category-based related products
          try {
            const relRes = await api.getRelatedProducts(res.product.slug || res.product.id);
            if (relRes.success) {
              setRelatedProducts(relRes.products);
            }
          } catch (relErr) {
            console.error('Error fetching related products:', relErr);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug]);

  if (loading) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', textAlign: 'center', minHeight: '65vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 600 }}>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', textAlign: 'center', minHeight: '65vh' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary-dark)' }}>
          {error || 'Product Not Found'}
        </h2>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Products Catalogue</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = product.availability === 'AVAILABLE';

  // Build image list: primary + additional images
  const allImages: string[] = [product.image];
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img.url && !allImages.includes(img.url)) {
        allImages.push(img.url);
      }
    });
  }

  const hasSpecifications = Boolean(
    product.length ||
      product.width ||
      product.height ||
      product.weight ||
      product.flowerType ||
      product.color ||
      product.suitableFor ||
      product.subcategory
  );

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem', background: '#faf8f5' }}>
      <div className="container">
        {/* BREADCRUMB & BACK LINK */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link to="/products" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={15} /> All Products
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          {product.category && (
            <>
              <Link to={`/products?category=${product.category.slug}`} style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>
                {product.category.name}
              </Link>
              <ChevronRight size={14} color="#94a3b8" />
            </>
          )}
          <span style={{ color: '#64748b', fontWeight: 500 }}>{product.name}</span>
        </div>

        {/* MAIN PRODUCT LAYOUT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
            background: '#ffffff',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-cream-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '4rem'
          }}
        >
          {/* LEFT: IMAGE & GALLERY THUMBNAILS */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-cream-border)',
                background: '#f8fafc',
                height: '460px',
                position: 'relative'
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <ImageOff size={48} />
                  <span style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No Real Photo Uploaded</span>
                </div>
              )}

              {/* Stock status badge */}
              <span
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: isAvailable ? 'rgba(22, 163, 74, 0.95)' : 'rgba(220, 38, 38, 0.95)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {isAvailable ? 'In Stock' : 'Currently Unavailable'}
              </span>
            </div>

            {/* Additional Image Thumbnails (Multi-Image Support) */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImage === imgUrl ? '2.5px solid var(--color-primary)' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      padding: 0,
                      background: '#f1f5f9',
                      flexShrink: 0
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div>
            {product.category && (
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--color-cream)',
                  border: '1px solid var(--color-cream-border)',
                  color: 'var(--color-primary-dark)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '0.75rem'
                }}
              >
                {product.category.name}
              </span>
            )}

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                color: 'var(--color-primary-dark)',
                lineHeight: 1.2,
                margin: '0 0 1rem'
              }}
            >
              {product.name}
            </h1>

            {/* Price block */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                {formatPrice(product.price, product.isContactForPrice, product.priceType)}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                • Nashik Shop Pickup & Delivery
              </span>
            </div>

            {/* Short Description */}
            <p style={{ color: 'var(--color-text-main)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description || product.shortDescription || 'Fresh floral design hand-assembled by Kamlesh Ful Bhandar in Nashik.'}
            </p>

            {/* SPECIFICATIONS TABLE */}
            {hasSpecifications && (
              <div
                style={{
                  background: 'var(--color-cream)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-cream-border)',
                  padding: '1.25rem',
                  marginBottom: '2rem'
                }}
              >
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary-dark)', margin: '0 0 0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={15} /> Specifications & Dimensions
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {product.flowerType && (
                    <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Flower Type</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{product.flowerType}</strong>
                    </div>
                  )}

                  {product.length && (
                    <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Approximate Length</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{product.length}</strong>
                    </div>
                  )}

                  {product.width && (
                    <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Diameter / Width</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{product.width}</strong>
                    </div>
                  )}

                  {product.color && (
                    <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Color Combination</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{product.color}</strong>
                    </div>
                  )}

                  {product.suitableFor && (
                    <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Suitable For</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{product.suitableFor}</strong>
                    </div>
                  )}

                  {product.subcategory && (
                    <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Design Style</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{product.subcategory}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOOKING BUTTONS (FRICTIONLESS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="btn btn-whatsapp"
                style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              >
                <MessageCircle size={22} />
                <span>Book on WhatsApp (Instant Order)</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <a href="tel:9921972936" className="btn btn-outline" style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem' }}>
                  <Phone size={17} />
                  <span>Call 9921972936</span>
                </a>

                <Link to="/bookings" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem' }}>
                  <CalendarCheck size={17} />
                  <span>Custom Quote</span>
                </Link>
              </div>
            </div>

            {/* TRUST BADGES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                <Sparkles size={17} color="var(--color-gold)" />
                <span>100% Fresh Daily Blooms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                <Truck size={17} color="var(--color-gold)" />
                <span>Delivery Across Nashik</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                <ShieldCheck size={17} color="var(--color-gold)" />
                <span>Pawan Nagar Local Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS ("YOU MAY ALSO LIKE" - STRICTLY SAME CATEGORY) */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <span className="section-tag">Category Recommendations</span>
              <h2 className="section-title" style={{ fontSize: '1.75rem' }}>
                You May Also Like ({product.category?.name || 'Related'})
              </h2>
            </div>

            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="product-card"
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-cream-border)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Link to={`/products/${rel.slug || rel.id}`} style={{ height: '180px', display: 'block', overflow: 'hidden' }}>
                    <img src={rel.image} alt={rel.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>

                  <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Link to={`/products/${rel.slug || rel.id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-primary-dark)', margin: '0 0 0.35rem' }}>
                        {rel.name}
                      </h4>
                    </Link>

                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: 'auto', marginBottom: '0.65rem' }}>
                      {formatPrice(rel.price, rel.isContactForPrice, rel.priceType)}
                    </div>

                    <Link to={`/products/${rel.slug || rel.id}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WHATSAPP BOOKING MODAL */}
      <WhatsAppBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        product={product}
      />
    </div>
  );
}
