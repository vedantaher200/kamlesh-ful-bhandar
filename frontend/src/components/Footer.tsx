import React from 'react';
import { Link } from 'react-router-dom';
import { Flower, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { createWhatsAppUrl } from '../services/api';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div className="brand-icon" style={{ width: 36, height: 36 }}>
                <Flower size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Kamlesh Ful Bhandar</h3>
            </div>
            <p>Flowers • Decoration • Weddings • Events</p>
            <p className="footer-bio">
              Handcrafted floral styling, wedding stage decors, fresh garlands, and bouquets crafted with care for families across Nashik, Maharashtra.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/gallery">Gallery Portfolio</Link></li>
              <li><Link to="/bookings">Book An Event</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact & Map</Link></li>
              <li><Link to="/admin/login">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Our Specialties</h4>
            <ul className="footer-links">
              <li><Link to="/services">Wedding Flower Decor</Link></li>
              <li><Link to="/products?category=car-decoration">Car Flower Decoration</Link></li>
              <li><Link to="/products?category=haar-mala">Haar & Mala Garlands</Link></li>
              <li><Link to="/services">Mandap & Stage Setup</Link></li>
              <li><Link to="/products?category=bouquets">Fresh Bouquets</Link></li>
              <li><Link to="/services">Haldi & Engagement Decor</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Nashik</h4>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>Ganpati Mandir Jawal, Pawan Nagar, Nashik, Maharashtra</span>
            </div>

            <div className="footer-contact-item">
              <Phone size={18} />
              <div>
                <a href="tel:9921972936" style={{ display: 'block', color: 'inherit' }}>+91 99219 72936</a>
                <a href="tel:8208672409" style={{ display: 'block', color: 'inherit', marginTop: '2px' }}>+91 82086 72409</a>
              </div>
            </div>

            <div className="footer-contact-item">
              <Clock size={18} />
              <span>Monday – Sunday: 6:00 AM – 10:00 PM</span>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <a
                href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about flower services.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Kamlesh Ful Bhandar. All rights reserved.</p>
          <p>Pawan Nagar, Nashik, Maharashtra</p>
        </div>
      </div>
    </footer>
  );
}
