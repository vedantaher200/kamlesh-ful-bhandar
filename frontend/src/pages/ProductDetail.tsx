import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Phone, ArrowLeft, CalendarCheck, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { api, createWhatsAppUrl, formatPrice } from '../services/api';
import { Product } from '../types/index';

export default function ProductDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!idOrSlug) return;
      try {
        const res = await api.getProduct(idOrSlug);
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', textAlign: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary-dark)' }}>
          {error || 'Product Not Found'}
        </h2>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = product.availability === 'AVAILABLE';

  const orderMsg =
    product.whatsappMessage ||
    `Hello Kamlesh Ful Bhandar, I am interested in this product:\n\nProduct: ${product.name}\nPrice: ${formatPrice(
      product.price,
      product.isContactForPrice
    )}\nAvailability: ${product.availability}\n\nPlease share more details and availability.`;

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 3rem)', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            <ArrowLeft size={18} />
            <span>Back to All Products</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3.5rem', alignItems: 'start' }}>
          {/* Left: Product Image */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-cream-border)', boxShadow: 'var(--shadow-lg)' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '520px', objectFit: 'cover' }}
            />
          </div>

          {/* Right: Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {product.category && (
              <span className="section-tag" style={{ alignSelf: 'flex-start' }}>
                {product.category.name}
              </span>
            )}

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: 'var(--color-primary-dark)', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {formatPrice(product.price, product.isContactForPrice)}
              </div>
              <span
                className={`product-badge-stock ${isAvailable ? 'badge-available' : 'badge-out-of-stock'}`}
                style={{ position: 'static' }}
              >
                {isAvailable ? 'Available In Stock' : 'Currently Unavailable'}
              </span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cream-border)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Product Description
              </h3>
              <p style={{ color: 'var(--color-text-main)', lineHeight: 1.7, fontSize: '1.025rem' }}>
                {product.description || 'Fresh floral design hand-assembled by Kamlesh Ful Bhandar in Nashik.'}
              </p>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {isAvailable ? (
                <a
                  href={createWhatsAppUrl(orderMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
                >
                  <MessageCircle size={20} />
                  <span>Order on WhatsApp</span>
                </a>
              ) : (
                <div style={{ padding: '0.85rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 600 }}>
                  This product is currently out of stock. Please contact us for custom alternatives.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <a href="tel:9921972936" className="btn btn-outline" style={{ width: '100%' }}>
                  <Phone size={18} />
                  <span>Call 9921972936</span>
                </a>

                <Link to="/bookings" className="btn btn-primary" style={{ width: '100%' }}>
                  <CalendarCheck size={18} />
                  <span>Custom Quote</span>
                </Link>
              </div>
            </div>

            {/* Value Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--color-cream-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                <Sparkles size={18} color="var(--color-gold)" />
                <span>100% Fresh Daily Blooms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                <Truck size={18} color="var(--color-gold)" />
                <span>Delivery in Nashik</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                <ShieldCheck size={18} color="var(--color-gold)" />
                <span>Authentic Local Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
