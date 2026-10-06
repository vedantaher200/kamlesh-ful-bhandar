import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Phone,
  MessageCircle,
  CalendarCheck,
  MapPin,
  ArrowRight,
  Truck,
  Star,
  Check,
  Send,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api, createWhatsAppUrl, formatPrice } from '../services/api';
import { Product, Service, Offer, Review } from '../types/index';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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
        const [prodRes, servRes, offRes, revRes] = await Promise.all([
          api.getProducts({ featured: true }),
          api.getServices({ featured: true }),
          api.getActiveOffers(),
          api.getApprovedReviews()
        ]);

        if (prodRes.success) setFeaturedProducts(prodRes.products.slice(0, 8));
        if (servRes.success) setServices(servRes.services.slice(0, 6));
        if (offRes.success) setOffers(offRes.offers);
        if (revRes.success) setReviews(revRes.reviews);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      // Open WhatsApp
      const msg = `Hello Kamlesh Ful Bhandar, I would like to enquire about flower decoration in Nashik.\n\n👤 Name: ${formData.name}\n📱 Mobile: ${formData.phone}\n🎉 Event: ${formData.eventType}\n📅 Date: ${formData.eventDate || 'Flexible'}\n🌸 Service: ${formData.service}\n💬 Message: ${formData.message || 'Please share quote.'}`;
      window.open(createWhatsAppUrl(msg), '_blank');
    } catch (err: any) {
      setFormError(err.message || 'Submission failed.');
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-background" />
        <div className="hero-ambient-glow" />

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Nashik's Trusted Floral Decorator</span>
            </div>

            <h1 className="hero-headline">
              Flowers That Turn Moments Into <span>Memories.</span>
            </h1>

            <p className="hero-subtitle">
              Beautiful flowers, wedding decorations and event floral arrangements crafted with care in Nashik.
            </p>

            <div className="hero-cta-group">
              <Link to="/bookings" className="btn btn-primary">
                <CalendarCheck size={18} />
                <span>Book Decoration</span>
              </Link>

              <a
                href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about flower decoration in Nashik.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Us</span>
              </a>

              <a href="tel:9921972936" className="btn btn-outline-white">
                <Phone size={18} />
                <span>Call Now</span>
              </a>
            </div>

            <div className="hero-trust-statement">
              <Sparkles size={16} />
              <span>Wedding • Events • Flowers • Decoration</span>
            </div>
          </div>

          <div className="hero-image-card">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                alt="Kamlesh Ful Bhandar Wedding Decor Nashik"
              />
            </div>

            <div className="hero-float-badge">
              <div className="hero-float-icon">
                <MapPin size={22} />
              </div>
              <div className="hero-float-text">
                <h4>Pawan Nagar, Nashik</h4>
                <p>Ganpati Mandir Jawal • Nashik Local Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE OFFERS BANNER (IF ANY ACTIVE) */}
      {offers.length > 0 && (
        <section style={{ background: 'var(--color-primary)', color: '#ffffff', padding: '1rem 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', textAlign: 'center' }}>
            <Tag size={20} color="var(--color-gold)" />
            <span style={{ fontWeight: 600 }}>
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

      {/* 2. FEATURED SERVICES */}
      <section className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Signature Offerings</span>
            <h2 className="section-title">Specialized Floral Services</h2>
            <p className="section-description">
              From auspicious traditional rituals to grand wedding celebrations, explore our handcrafted floral arrangements in Nashik.
            </p>
          </div>

          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {services.map((service) => (
              <div key={service.id} className="product-card">
                <div className="product-image-wrap" style={{ height: '240px' }}>
                  <img src={service.image} alt={service.title} />
                  {service.highlight && (
                    <span className="product-badge-cat">{service.highlight}</span>
                  )}
                </div>

                <div className="product-body">
                  <h3 className="product-name">{service.title}</h3>
                  <p className="product-desc">{service.description}</p>

                  <div className="product-actions" style={{ marginTop: 'auto' }}>
                    <a
                      href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I am interested in your "${service.title}" service in Nashik. Please share details.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ flex: 1 }}
                    >
                      <MessageCircle size={15} />
                      <span>Enquire</span>
                    </a>
                    <Link to="/bookings" className="btn btn-outline btn-sm">
                      <span>Quote</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/services" className="btn btn-forest">
              <span>View All Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC PRODUCTS (FROM POSTGRESQL API) */}
      <section className="section-padding" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Live Product Catalog</span>
            <h2 className="section-title">Fresh Flowers & Arrangements</h2>
            <p className="section-description">
              Available daily in Pawan Nagar, Nashik. Updated in real time by our shop team.
            </p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading fresh blooms...</p>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="product-card">
                  <div className="product-image-wrap">
                    <img src={prod.image} alt={prod.name} />
                    {prod.category && (
                      <span className="product-badge-cat">{prod.category.name}</span>
                    )}
                    <span
                      className={`product-badge-stock ${
                        prod.availability === 'AVAILABLE' ? 'badge-available' : 'badge-out-of-stock'
                      }`}
                    >
                      {prod.availability === 'AVAILABLE' ? 'Available' : 'Currently Unavailable'}
                    </span>
                  </div>

                  <div className="product-body">
                    <h3 className="product-name">{prod.name}</h3>
                    <p className="product-desc">{prod.description}</p>
                    <div className="product-price">
                      {formatPrice(prod.price, prod.isContactForPrice)}
                    </div>

                    <div className="product-actions">
                      <a
                        href={createWhatsAppUrl(
                          prod.whatsappMessage ||
                            `Hello Kamlesh Ful Bhandar, I am interested in: ${prod.name} (${formatPrice(prod.price, prod.isContactForPrice)}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ flex: 1 }}
                      >
                        <MessageCircle size={15} />
                        <span>WhatsApp</span>
                      </a>
                      <Link to={`/products/${prod.slug || prod.id}`} className="btn btn-outline btn-sm">
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/products" className="btn btn-primary">
              <span>Explore Full Product Catalogue</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Dedicated Craftsmanship</span>
            <h2 className="section-title">Why Choose Kamlesh Ful Bhandar</h2>
            <p className="section-description">
              Rooted in Pawan Nagar, Nashik, providing authentic, fragrant floral setups for every auspicious life event.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cream-border)' }}>
              <div style={{ width: 50, height: 50, background: 'rgba(203, 162, 57, 0.15)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                Beautiful Floral Designs
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
                Artfully arranged fresh blooms that enhance the visual beauty of any venue, hall, or home setup in Nashik.
              </p>
            </div>

            <div style={{ padding: '2rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cream-border)' }}>
              <div style={{ width: 50, height: 50, background: 'rgba(203, 162, 57, 0.15)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                Wedding & Event Expertise
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
                Experienced decorators handling intimate rituals, mandaps, car decor, and grand banquet stages.
              </p>
            </div>

            <div style={{ padding: '2rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cream-border)' }}>
              <div style={{ width: 50, height: 50, background: 'rgba(203, 162, 57, 0.15)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                Nashik Local Service
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
                Conveniently located near Ganpati Mandir in Pawan Nagar, providing on-time local delivery and setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOME DELIVERY BANNER */}
      <section style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, #174e3a 100%)', color: '#ffffff', padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '650px' }}>
              <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, fontSize: '0.85rem' }}>
                Doorstep Service
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', margin: '0.5rem 0 1rem', lineHeight: 1.2 }}>
                Flowers Delivered With Care
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Fresh bouquets, daily puja flowers, and customized garlands delivered across Nashik where applicable. Order directly on WhatsApp to confirm timing.
              </p>
              <a
                href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to place an order for flower home delivery in Nashik.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            <div style={{ textAlign: 'center', border: '2px dashed rgba(203, 162, 57, 0.5)', padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.04)' }}>
              <Truck size={48} color="var(--color-gold)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Local Nashik Delivery</div>
              <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>Fresh & Prompt</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. QUICK ENQUIRY FORM */}
      <section id="quick-enquiry" className="section-padding" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ background: '#ffffff', padding: '3.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-cream-border)', boxShadow: 'var(--shadow-lg)', maxWidth: '900px', margin: '0 auto' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
              <span className="section-tag">Direct Quotation</span>
              <h2 className="section-title">Request Floral Decor Estimate</h2>
              <p className="section-description">
                Share your event details. We record your inquiry in our system and open WhatsApp for an instant discussion.
              </p>
            </div>

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={54} color="#25D366" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                  Enquiry Registered!
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  Your enquiry is saved in our system and WhatsApp has been initiated.
                </p>
                <button onClick={() => setFormSubmitted(false)} className="btn btn-outline">
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit}>
                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Patil"
                      style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', background: 'var(--color-cream)' }}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Mobile"
                      style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', background: 'var(--color-cream)' }}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      Event Type
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', background: 'var(--color-cream)' }}
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Haldi">Haldi Rasam</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Reception">Reception</option>
                      <option value="Car Decor">Car Decoration</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Traditional/Puja">Puja / Traditional</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      Event Date
                    </label>
                    <input
                      type="date"
                      style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', background: 'var(--color-cream)' }}
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                      Requirements / Venue Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Color preferences, hall size, flower types..."
                      style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-cream-border)', background: 'var(--color-cream)', resize: 'vertical' }}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
                      <Send size={18} />
                      <span>Submit & Open WhatsApp Enquiry</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS (MODERATED & APPROVED FROM API) */}
      {reviews.length > 0 && (
        <section className="section-padding" style={{ background: '#ffffff' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Customer Love</span>
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="section-description">
                Honest feedback from families and event planners across Nashik.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ background: 'var(--color-cream)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cream-border)' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: 'var(--color-gold)' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={18} fill="var(--color-gold)" />
                    ))}
                  </div>
                  <p style={{ fontStyle: 'italic', color: 'var(--color-text-main)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    "{rev.comment}"
                  </p>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>
                    {rev.customerName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CONTACT & GOOGLE MAPS */}
      <section className="section-padding" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Nashik Store</span>
            <h2 className="section-title">Visit Kamlesh Ful Bhandar</h2>
            <p className="section-description">
              Conveniently located near Ganpati Mandir in Pawan Nagar, Nashik.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ background: 'var(--color-primary-dark)', color: '#ffffff', padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                Kamlesh Ful Bhandar
              </h3>
              <p style={{ color: 'var(--color-gold)', marginBottom: '2rem' }}>
                Flower Shop • Wedding & Event Decoration
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Phone size={22} color="var(--color-gold)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>PHONE NUMBERS</div>
                    <a href="tel:9921972936" style={{ fontWeight: 600, fontSize: '1.1rem', display: 'block' }}>+91 99219 72936</a>
                    <a href="tel:8208672409" style={{ fontWeight: 600, fontSize: '1.1rem', display: 'block' }}>+91 82086 72409</a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <MapPin size={22} color="var(--color-gold)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>LOCATION</div>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                      Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Clock size={22} color="var(--color-gold)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>WORKING HOURS</div>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Monday – Sunday: 6:00 AM – 10:00 PM</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="tel:9921972936" className="btn btn-primary">
                  <Phone size={16} />
                  <span>Call Now</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Ganpati+Mandir+Pawan+Nagar+Nashik+Maharashtra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-white"
                >
                  <MapPin size={16} />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '380px', border: '2px solid var(--color-cream-border)', boxShadow: 'var(--shadow-md)' }}>
              <iframe
                title="Kamlesh Ful Bhandar Nashik Location Map"
                src="https://maps.google.com/maps?q=Ganpati+Mandir+Pawan+Nagar+Nashik+Maharashtra&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
