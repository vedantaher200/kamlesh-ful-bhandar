import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  ArrowRight,
  Truck,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Clock,
  Heart,
  ChevronRight,
  Calendar,
  Layers,
  Car,
  Gift,
  Home as HomeIcon,
  Smile
} from 'lucide-react';
import { api, createWhatsAppUrl, formatPrice } from '../services/api';
import { Product, Service, Offer, Review, CarDecorationPost } from '../types/index';
import WhatsAppBookingModal from '../components/WhatsAppBookingModal';
import LightboxModal, { LightboxImageItem } from '../components/LightboxModal';
import RealCustomerGallery from '../components/RealCustomerGallery';
import CustomerFeedbackSection from '../components/CustomerFeedbackSection';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../data/portfolioData';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [haarProducts, setHaarProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [carDecorations, setCarDecorations] = useState<CarDecorationPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Lightbox Modal for standalone showcases
  const [lightboxItems, setLightboxItems] = useState<LightboxImageItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Haar filter in haar section
  const [haarFilter, setHaarFilter] = useState<string>('all');

  // Bouquet filter in bouquet section
  const [bouquetFilter, setBouquetFilter] = useState<string>('all');

  // Quick form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: 'Wedding',
    eventDate: '',
    service: 'Wedding Flower Decoration',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, haarRes, servRes, offRes, revRes, carRes] = await Promise.all([
          api.getProducts({ featured: true, limit: 8 }),
          api.getProducts({ category: 'haar-mala', limit: 8 }),
          api.getServices({ featured: true, limit: 8 }),
          api.getActiveOffers(),
          api.getApprovedReviews(),
          api.getPublishedCarDecorations()
        ]);

        if (prodRes.success) setFeaturedProducts(prodRes.products);
        if (haarRes.success) setHaarProducts(haarRes.products);
        if (servRes.success) setServices(servRes.services);
        if (offRes.success) setOffers(offRes.offers);
        if (revRes.success) setReviews(revRes.reviews);
        if (carRes?.success) setCarDecorations(carRes.posts);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openBookModal = (prod: Product) => {
    setSelectedProduct(prod);
    setIsBookingModalOpen(true);
  };

  const openItemInLightbox = (item: PortfolioItem, list: PortfolioItem[]) => {
    const convertedList: LightboxImageItem[] = list.map((p) => ({
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
    const idx = list.findIndex((p) => p.id === item.id);
    setLightboxItems(convertedList);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setIsLightboxOpen(true);
  };



  // Haar items
  const haarPortfolio = useMemo(() => {
    const allHaar = PORTFOLIO_ITEMS.filter((i) => i.category === 'haar-varmala');
    if (haarFilter === 'all') return allHaar;
    return allHaar.filter((i) => i.subCategory?.toLowerCase().includes(haarFilter.toLowerCase()));
  }, [haarFilter]);

  // Bouquet items
  const bouquetPortfolio = useMemo(() => {
    const allBq = PORTFOLIO_ITEMS.filter((i) => i.category === 'bouquets' || i.category === 'birthday-gifts');
    if (bouquetFilter === 'all') return allBq;
    return allBq.filter(
      (i) =>
        i.subCategory?.toLowerCase().includes(bouquetFilter.toLowerCase()) ||
        i.title.toLowerCase().includes(bouquetFilter.toLowerCase())
    );
  }, [bouquetFilter]);

  // Entrance items
  const entranceItems = useMemo(
    () => PORTFOLIO_ITEMS.filter((i) => i.category === 'entrance-decoration'),
    []
  );

  // Wedding & engagement items
  const weddingItems = useMemo(
    () => PORTFOLIO_ITEMS.filter((i) => i.category === 'wedding-engagement' || i.category === 'haar-varmala'),
    []
  );

  // Fresh flower items
  const freshFlowerItems = useMemo(
    () => PORTFOLIO_ITEMS.filter((i) => i.category === 'fresh-flowers'),
    []
  );

  // Customer work items
  const customerWorkItems = useMemo(
    () => PORTFOLIO_ITEMS.filter((i) => i.category === 'customer-work'),
    []
  );

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setFormError('Please enter your name and 10-digit mobile number.');
      return;
    }

    try {
      await api.createEnquiry({
        customerName: formData.name,
        customerPhone: formData.phone,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        service: formData.service,
        message: formData.message
      });

      setFormSubmitted(true);
      setFormError('');

      const msg = `Hello Kamlesh Ful Bhandar, I would like to enquire about flower decoration in Nashik.\n\n👤 Name: ${formData.name}\n📱 Mobile: ${formData.phone}\n🎉 Event: ${formData.eventType}\n📅 Date: ${formData.eventDate || 'Flexible'}\n🌸 Service: ${formData.service}\n💬 Message: ${formData.message || 'Please share quote.'}`;
      window.open(createWhatsAppUrl(msg), '_blank');
    } catch (err: any) {
      setFormError(err.message || 'Submission failed.');
    }
  };

  return (
    <div>
      {/* =========================================================
          1. HERO SECTION
          "Fresh Flowers. Beautiful Decorations. Memorable Moments."
          ========================================================= */}
      <section className="hero">
        <div className="hero-background" />
        <div className="hero-ambient-glow" />

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Nashik's Trusted Floral Decorator • Pawan Nagar</span>
            </div>

            <h1 className="hero-headline">
              Fresh Flowers. Beautiful Decorations. <span>Memorable Moments.</span>
            </h1>

            <p className="hero-subtitle">
              From wedding car decorations and traditional Haar to bouquets, fresh flowers and beautiful entrance decorations — we create floral designs for every special occasion.
            </p>

            <div className="hero-cta-group">
              <a href="#our-work-gallery" className="btn btn-primary">
                <Sparkles size={18} />
                <span>Explore Our Work</span>
              </a>

              <a
                href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I saw your website and would like to enquire about flower decorations.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Us</span>
              </a>

              <a href="tel:9921972936" className="btn btn-outline-white">
                <Phone size={18} />
                <span>Call 9921972936</span>
              </a>
            </div>

            <div className="hero-trust-statement">
              <Sparkles size={16} />
              <span>Real Customer Portfolio • Nashik Daily Fresh Flowers • Transparent WhatsApp Quotes</span>
            </div>
          </div>

          <div className="hero-image-card">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                alt="Kamlesh Ful Bhandar Real Wedding Flower Decor Nashik"
              />
            </div>

            <div className="hero-float-badge">
              <div className="hero-float-icon">
                <MapPin size={22} />
              </div>
              <div className="hero-float-text">
                <h4>Pawan Nagar, Nashik</h4>
                <p>Ganpati Mandir Jawal • Phone: 9921972936</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE OFFERS BANNER (IF ANY) */}
      {offers.length > 0 && (
        <section style={{ background: 'var(--color-primary-dark, #0d3d29)', color: '#ffffff', padding: '0.85rem 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', textAlign: 'center' }}>
            <Tag size={18} color="var(--color-gold, #f59e0b)" />
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              Special Festive Offer: {offers[0].title} — {offers[0].description}
            </span>
            <a
              href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I saw the offer "${offers[0].title}" on your website and would like details.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              Claim on WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* =========================================================
          2. QUICK SERVICE CATEGORIES (7 Cards)
          🚗 Car Decoration, 🌸 Haar & Varmala, 💐 Bouquets, 🌹 Fresh Flowers,
          🚪 Entrance Decoration, 💍 Wedding & Engagement, 🎁 Special Occasion Gifts
          ========================================================= */}
      <section className="section-padding" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">Our Floral Specialties</h2>
            <p className="section-description">
              Tap any category below to jump directly to our real photo showcase and booking options.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem'
            }}
          >
            {[
              { label: 'Car Decoration', icon: '🚗', href: '#section-car-decor', badge: 'Wedding & Groom' },
              { label: 'Haar & Varmala', icon: '🌸', href: '#section-haar-varmala', badge: 'Handmade Malas' },
              { label: 'Bouquets', icon: '💐', href: '#section-bouquets', badge: 'Celebrations' },
              { label: 'Fresh Flowers', icon: '🌹', href: '#section-fresh-flowers', badge: 'Daily Harvest' },
              { label: 'Entrance Decoration', icon: '🚪', href: '#section-entrance-decor', badge: 'Door & Arches' },
              { label: 'Wedding & Engagement', icon: '💍', href: '#section-wedding-decor', badge: 'Stages & Mandap' },
              { label: 'Special Occasion Gifts', icon: '🎁', href: '#section-birthday-gifts', badge: 'Custom Gifts' }
            ].map((sc, idx) => (
              <a
                key={idx}
                href={sc.href}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{sc.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
                  {sc.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{sc.badge}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. WHY CHOOSE US
          ========================================================= */}
      <section className="section-padding" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Nashik's Trusted Florist</span>
            <h2 className="section-title">Why Families & Planners Choose Us</h2>
            <p className="section-description">
              Over a decade of trusted service at Pawan Nagar, Nashik — crafting memories with love and fresh petals.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              {
                icon: <Truck size={28} color="#059669" />,
                title: 'Daily Farm Fresh Blooms',
                desc: 'Direct morning arrivals of Dutch roses, mogra, zendu and exotic blooms from polyhouses.'
              },
              {
                icon: <ShieldCheck size={28} color="#059669" />,
                title: 'Handcrafted With Care',
                desc: 'Expert florists carefully weave every varmala, car garland, and stage frame to perfection.'
              },
              {
                icon: <Clock size={28} color="#059669" />,
                title: 'Punctual On-Site Execution',
                desc: 'On-time delivery and quick on-site car and entrance decoration throughout Nashik district.'
              },
              {
                icon: <MessageCircle size={28} color="#059669" />,
                title: 'Direct WhatsApp Pricing',
                desc: 'No confusing markups. Pick your favourite design, tap WhatsApp, and get transparent quotes.'
              }
            ].map((feat, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  padding: '1.75rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>{feat.icon}</div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
                  {feat.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          4. CAR DECORATION SECTION
          Unified Admin-Published Posts (Single Source of Truth)
          ========================================================= */}
      <section id="section-car-decor" className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">🚗 Car Decoration</span>
            <h2 className="section-title">CAR DECORATION</h2>
            <p
              style={{
                fontSize: '1.15rem',
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-gold, #d97706)',
                margin: '0.25rem 0 0.5rem'
              }}
            >
              Beautiful Floral Decorations for Every Celebration
            </p>
            <p className="section-description">
              Handcrafted fresh flower decoration for wedding cars, groom entries, and family celebrations — safe scratch-free fitting and long-lasting fresh blooms in Nashik.
            </p>
          </div>

          {/* Car Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}
          >
            {carDecorations.map((post) => {
              const displayPrice = post.priceText || (post.price ? `₹${post.price.toLocaleString('en-IN')}` : 'Price on Request');
              const whatsappMsg = `Hello Kamlesh Ful Bhandar, I saw this Car Decoration design ("${post.title}" - ${displayPrice}) on your website and would like to know price and availability.`;

              return (
                <div
                  key={post.id}
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
                    style={{ position: 'relative', height: '230px', cursor: 'pointer', backgroundColor: '#f1f5f9' }}
                    onClick={() => {
                      const convertedList: LightboxImageItem[] = carDecorations.map((p) => ({
                        id: p.id,
                        title: p.title,
                        image: p.image,
                        categoryLabel: 'Car Decoration',
                        subCategory: 'Car Decoration',
                        altText: p.title,
                        priceText: p.priceText || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'Price on Request'),
                        floralStyle: p.description || 'Fresh Flower Decoration'
                      }));
                      const idx = carDecorations.findIndex((p) => p.id === post.id);
                      setLightboxItems(convertedList);
                      setLightboxIndex(idx >= 0 ? idx : 0);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px'
                      }}
                    >
                      Tap to zoom
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Car Decoration
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-primary-dark)', margin: '0 0 0.5rem' }}>
                      {post.title}
                    </h3>

                    {post.description && (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.description}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                        {displayPrice}
                      </span>

                      <a
                        href={createWhatsAppUrl(whatsappMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '6px' }}
                      >
                        <MessageCircle size={14} />
                        <span>Enquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Car Decorations CTA */}
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/car-decoration"
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: '30px'
              }}
            >
              <span>🚗 View All Car Decorations</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. HAAR / VARMALA SECTION
          Subtitle: "Traditional Elegance with Fresh Flowers"
          Rose Varmala, Pink Rose, White Rose, Lotus, Traditional Haar, Designer, Custom
          ========================================================= */}
      <section id="section-haar-varmala" className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-tag">Sacred Garlands</span>
            <h2 className="section-title">HAAR & VARMALA COLLECTION</h2>
            <p
              style={{
                fontSize: '1.15rem',
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-gold, #d97706)',
                margin: '0.25rem 0 0.5rem'
              }}
            >
              Traditional Elegance with Fresh Flowers
            </p>
            <p className="section-description">
              Handcrafted bride & groom varmala pairs, traditional Maharashtrian haars, fresh lotus garlands, and custom wedding malas.
            </p>
          </div>

          {/* Filter Chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}
          >
            {[
              { id: 'all', label: 'All Haar Designs' },
              { id: 'rose', label: 'Rose Varmala' },
              { id: 'pink', label: 'Pink Rose Varmala' },
              { id: 'white', label: 'White Rose Varmala' },
              { id: 'lotus', label: 'Lotus Varmala' },
              { id: 'traditional', label: 'Traditional Haar' },
              { id: 'designer', label: 'Designer Varmala' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHaarFilter(f.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: haarFilter === f.id ? 700 : 500,
                  cursor: 'pointer',
                  border: haarFilter === f.id ? '1px solid var(--color-primary-dark)' : '1px solid #cbd5e1',
                  background: haarFilter === f.id ? 'var(--color-primary-dark)' : '#ffffff',
                  color: haarFilter === f.id ? '#ffffff' : '#334155'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {haarPortfolio.map((item) => {
              const whatsappMsg = `Hello Kamlesh Ful Bhandar, I saw this Varmala/Haar design ("${item.title}") on your website and would like to order/know price.`;

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
                    style={{ position: 'relative', height: '230px', cursor: 'pointer', backgroundColor: '#f1f5f9' }}
                    onClick={() => openItemInLightbox(item, haarPortfolio)}
                  >
                    <img
                      src={item.image}
                      alt={item.altText}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '14px'
                      }}
                    >
                      {item.subCategory}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-primary-dark)', margin: '0 0 0.4rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                      {item.floralStyle}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.92rem' }}>
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
                        <span>Order on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/products?category=haar-mala" className="btn btn-outline">
              <span>View All Haar & Mala Varieties in Catalogue</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. WEDDING & ENGAGEMENT DECORATION
          CTA: "Plan My Decoration"
          ========================================================= */}
      <section id="section-wedding-decor" className="section-padding" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Grand Celebrations</span>
            <h2 className="section-title">WEDDING & ENGAGEMENT DECORATION</h2>
            <p className="section-description">
              Complete floral styling for engagement ceremonies, traditional Maharashtrian mandaps, reception stages, varmala sets and grand venue entrances.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}
          >
            {weddingItems.slice(0, 4).map((item) => (
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
                  style={{ position: 'relative', height: '220px', cursor: 'pointer' }}
                  onClick={() => openItemInLightbox(item, weddingItems)}
                >
                  <img src={item.image} alt={item.altText} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 19, 0.85)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '16px'
                    }}
                  >
                    {item.subCategory}
                  </span>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-primary-dark)', margin: '0 0 0.4rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <a
                      href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I want to discuss "${item.title}" for my wedding/engagement in Nashik.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <MessageCircle size={15} />
                      <span>Plan My Decoration</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a
              href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to consult and plan wedding flower decoration in Nashik.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem' }}
            >
              <Sparkles size={18} />
              <span>Plan My Decoration on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          8. BOUQUETS & FLOWER GIFTS (Including Money Bouquet)
          Subcategories: Red Rose, Mixed, Birthday, Money Bouquet, Basket
          ========================================================= */}
      <section id="section-bouquets" className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-tag">Handcrafted Bunches</span>
            <h2 className="section-title">BOUQUETS & FLOWER GIFTS</h2>
            <p className="section-description">
              Fresh Dutch rose bouquets, exotic mixed arrangements, traditional floral baskets, and customized celebration Money Bouquets.
            </p>
          </div>

          {/* Subcategory Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}
          >
            {[
              { id: 'all', label: 'All Bouquets' },
              { id: 'money', label: 'Money Bouquet' },
              { id: 'red rose', label: 'Red Rose Bouquet' },
              { id: 'mixed', label: 'Mixed Flower Bouquet' },
              { id: 'birthday', label: 'Birthday Bouquet' },
              { id: 'basket', label: 'Flower Basket / Arrangement' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setBouquetFilter(f.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: bouquetFilter === f.id ? 700 : 500,
                  cursor: 'pointer',
                  border: bouquetFilter === f.id ? '1px solid var(--color-primary-dark)' : '1px solid #cbd5e1',
                  background: bouquetFilter === f.id ? 'var(--color-primary-dark)' : '#ffffff',
                  color: bouquetFilter === f.id ? '#ffffff' : '#334155'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {bouquetPortfolio.map((item) => {
              const whatsappMsg = `Hello Kamlesh Ful Bhandar, I would like to order/customize this bouquet design: "${item.title}".`;

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
                    style={{ position: 'relative', height: '230px', cursor: 'pointer' }}
                    onClick={() => openItemInLightbox(item, bouquetPortfolio)}
                  >
                    <img src={item.image} alt={item.altText} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: item.subCategory === 'Money Bouquet' ? '#f59e0b' : 'rgba(255, 255, 255, 0.95)',
                        color: item.subCategory === 'Money Bouquet' ? '#ffffff' : 'var(--color-primary-dark)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '14px'
                      }}
                    >
                      {item.subCategory}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-primary-dark)', margin: '0 0 0.4rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                      {item.description}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>
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
                        <span>Order This Design</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a
              href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to customize a fresh flower bouquet.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <span>Customize My Bouquet on WhatsApp</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          9. BIRTHDAY & SPECIAL OCCASION FLOWERS
          "Make It Special" -> "Customize Your Gift"
          ========================================================= */}
      <section id="section-birthday-gifts" className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              color: '#ffffff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem'
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <span style={{ color: 'var(--color-gold, #f59e0b)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Make It Special
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', margin: '0.5rem 0 0.75rem', color: '#ffffff' }}>
                BIRTHDAY & SPECIAL OCCASION FLOWERS
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                Happy Birthday bouquets, balloon-style flower gifts, chocolate and rose combos, and customized midnight surprise arrangements delivered across Nashik.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <a
                  href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to customize a special birthday flower gift.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <Gift size={18} />
                  <span>Customize Your Gift on WhatsApp</span>
                </a>
              </div>
            </div>

            <div style={{ width: '280px', height: '240px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80"
                alt="Birthday flower bouquet gift"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          10. FRESH FLOWERS SECTION
          Roses, Marigold, Chrysanthemum, Jasmine / Mogra, Mixed, Seasonal, Loose
          CTA: "Ask About Today's Flowers"
          ========================================================= */}
      <section id="section-fresh-flowers" className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Daily Market Produce</span>
            <h2 className="section-title">FRESH FLOWERS</h2>
            <p className="section-description">
              Clean visual catalogue of Nashik-grown loose flowers, puja malas, and fresh stems available daily at our Pawan Nagar shop.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            {freshFlowerItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img src={item.image} alt={item.altText} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-primary-dark)', margin: '0 0 0.35rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <a
                      href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I want to ask about today's availability of "${item.title}".`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
                    >
                      <MessageCircle size={14} />
                      <span>Ask About Today's Flowers</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a
              href={createWhatsAppUrl("Hello Kamlesh Ful Bhandar, what fresh flowers do you have available today for puja / decoration?")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle size={17} />
              <span>Ask About Today's Flowers on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          11. DOOR & ENTRANCE DECORATION
          Floral Door Frame, Home Entrance, Wedding Entrance, Premium Arch, Traditional
          CTA: "Book Entrance Decoration"
          ========================================================= */}
      <section id="section-entrance-decor" className="section-padding" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Welcoming Portals</span>
            <h2 className="section-title">DOOR & ENTRANCE FLOWER DECORATION</h2>
            <p className="section-description">
              Floral door frames, wedding gateway arches, and traditional marigold torans crafted for home Griha Pravesh and venue entries.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {entranceItems.map((item) => (
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
                  style={{ position: 'relative', height: '220px', cursor: 'pointer' }}
                  onClick={() => openItemInLightbox(item, entranceItems)}
                >
                  <img src={item.image} alt={item.altText} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 19, 0.85)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '14px'
                    }}
                  >
                    {item.subCategory}
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-primary-dark)', margin: '0 0 0.4rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <a
                      href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I would like to book entrance flower decoration ("${item.title}") in Nashik.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <MessageCircle size={15} />
                      <span>Book Entrance Decoration</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          12. OUR REAL CUSTOMER WORK
          "Some of our recent floral decoration work."
          Generic labels: Wedding Car Decoration, Wedding Floral Work, Entrance Decoration, etc.
          ========================================================= */}
      <section className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Recent Projects</span>
            <h2 className="section-title">OUR REAL CUSTOMER WORK</h2>
            <p className="section-description">
              Some of our recent floral decoration work completed on-site in Nashik.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {customerWorkItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  cursor: 'pointer'
                }}
                onClick={() => openItemInLightbox(item, customerWorkItems)}
              >
                <div style={{ height: '210px', overflow: 'hidden' }}>
                  <img src={item.image} alt={item.altText} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', margin: '0 0 0.25rem', fontFamily: 'var(--font-serif)' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          13. OUR WORK / REAL CUSTOMER GALLERY (Comprehensive Section)
          ========================================================= */}
      <RealCustomerGallery />

      {/* =========================================================
          14. WHAT OUR CUSTOMERS SAY
          (Strictly Zero Fake Reviews)
          ========================================================= */}
      <CustomerFeedbackSection
        approvedReviews={reviews}
        onReviewSubmitted={async () => {
          const revRes = await api.getApprovedReviews();
          if (revRes.success) setReviews(revRes.reviews);
        }}
      />

      {/* =========================================================
          15. FINAL WHATSAPP CONVERSION CTA BANNER
          ========================================================= */}
      <section style={{ background: 'var(--color-primary-dark, #0d3d29)', padding: '3.5rem 0', color: '#ffffff' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', margin: '0 0 0.75rem', color: '#ffffff' }}>
            Ready to Decorate Your Special Occasion?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
            Send us your preferred design or event date on WhatsApp. We provide instant consultation, flower selection, and on-time execution anywhere in Nashik.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <a
              href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to book flower decoration for an upcoming event.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 700 }}
            >
              <MessageCircle size={20} />
              <span>Connect on WhatsApp</span>
            </a>
            <a
              href="tel:9921972936"
              className="btn btn-outline-white"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 600 }}
            >
              <Phone size={18} />
              <span>Call 9921972936</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          16. CONTACT & NASHIK LOCATION SECTION
          ========================================================= */}
      <section className="section-padding" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <span className="section-tag">Visit Our Shop</span>
              <h2 className="section-title" style={{ textAlign: 'left', margin: '0.5rem 0 1rem' }}>
                Kamlesh Ful Bhandar, Nashik
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra, India. We are open daily for fresh flowers, puja malas, wedding consultations and vehicle decoration.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <MapPin size={20} color="#059669" />
                  <span style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                    <strong>Address:</strong> Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Phone size={20} color="#059669" />
                  <span style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                    <strong>Phone Numbers:</strong> 9921972936 / 8208672409
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Clock size={20} color="#059669" />
                  <span style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                    <strong>Hours:</strong> Open 7 Days • 6:00 AM – 10:00 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Enquiry Card */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: '0 0 0.5rem' }}>
                Quick Decoration Enquiry
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                Send your details to open direct WhatsApp booking.
              </p>

              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                  <h4 style={{ color: '#065f46', margin: '0 0 0.25rem' }}>Enquiry Sent!</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Opening WhatsApp with your request...</p>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit}>
                  {formError && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      {formError}
                    </div>
                  )}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="tel"
                      placeholder="Mobile Number (10 Digits) *"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    >
                      <option value="Car Decoration">Car Decoration</option>
                      <option value="Haar & Varmala">Haar & Varmala</option>
                      <option value="Wedding Flower Decoration">Wedding Decor</option>
                      <option value="Bouquets & Gifts">Bouquets</option>
                      <option value="Entrance Decoration">Entrance Decor</option>
                    </select>

                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-whatsapp" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                    <MessageCircle size={16} />
                    <span>Send & Chat on WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <WhatsAppBookingModal
        product={selectedProduct}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Standalone Lightbox */}
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
