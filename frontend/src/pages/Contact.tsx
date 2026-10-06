import React from 'react';
import { Phone, MessageCircle, MapPin, Navigation, Clock } from 'lucide-react';
import { createWhatsAppUrl } from '../services/api';

export default function Contact() {
  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Direct Contact</span>
          <h1 className="section-title">Visit or Contact Us in Nashik</h1>
          <p className="section-description">
            Reach out directly for immediate inquiries, bulk flower availability, or wedding venue floral consultations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Info Card */}
          <div style={{ background: 'var(--color-primary-dark)', color: '#ffffff', padding: '3.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              Kamlesh Ful Bhandar
            </h2>
            <p style={{ color: 'var(--color-gold)', marginBottom: '2.5rem', letterSpacing: '0.05em' }}>
              Flowers • Wedding & Event Decoration
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
                    PHONE NUMBERS
                  </h4>
                  <a href="tel:9921972936" style={{ fontSize: '1.15rem', fontWeight: 600, display: 'block' }}>+91 99219 72936</a>
                  <a href="tel:8208672409" style={{ fontSize: '1.15rem', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>+91 82086 72409</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
                    ADDRESS & LANDMARK
                  </h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra, India
                  </p>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Serving all of Nashik and surrounding celebration venues.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
                    BUSINESS HOURS
                  </h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Monday – Sunday: 6:00 AM – 10:00 PM</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="tel:9921972936" className="btn btn-primary">
                <Phone size={16} />
                <span>Call Now</span>
              </a>

              <a
                href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to get directions or enquire about flower availability.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Ganpati+Mandir+Pawan+Nagar+Nashik+Maharashtra"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-white"
              >
                <Navigation size={16} />
                <span>Google Maps</span>
              </a>
            </div>
          </div>

          {/* Map Embed */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-cream-border)', boxShadow: 'var(--shadow-md)', minHeight: '440px' }}>
            <iframe
              title="Kamlesh Ful Bhandar Nashik Location Map"
              src="https://maps.google.com/maps?q=Ganpati+Mandir+Pawan+Nagar+Nashik+Maharashtra&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '440px' }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
