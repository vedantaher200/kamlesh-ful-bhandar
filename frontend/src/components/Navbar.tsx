import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flower, Phone, MessageCircle, Menu, X, Shield } from 'lucide-react';
import { createWhatsAppUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Book Event', href: '/bookings' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <>
      <header className={`navbar ${isHome ? (scrolled ? 'scrolled' : 'transparent') : 'solid'}`}>
        <div className="container nav-container">
          <Link to="/" className="nav-brand" aria-label="Kamlesh Ful Bhandar Home">
            <div className="brand-icon">
              <Flower size={24} />
            </div>
            <div className="brand-title-wrap">
              <span className="brand-title">Kamlesh Ful Bhandar</span>
              <span className="brand-tagline">Nashik • Flower & Decor</span>
            </div>
          </Link>

          <nav aria-label="Main Navigation">
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            <a
              href="tel:9921972936"
              className="btn btn-outline-white btn-sm btn-desktop"
              title="Call Kamlesh Ful Bhandar"
            >
              <Phone size={15} />
              <span>Call</span>
            </a>

            <a
              href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about flower and decoration services in Nashik.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm btn-desktop"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <Link
              to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
              className="btn btn-outline-white btn-sm"
              title="Admin Portal"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <Shield size={15} />
              <span style={{ fontSize: '0.8rem' }}>{isAuthenticated ? 'Admin' : 'Login'}</span>
            </Link>

            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="nav-brand">
            <div className="brand-icon" style={{ width: 36, height: 36 }}>
              <Flower size={20} />
            </div>
            <span className="brand-title" style={{ fontSize: '1.25rem' }}>Kamlesh Ful Bhandar</span>
          </div>
          <button
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <ul className="mobile-nav-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.href} onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--color-gold)' }}
            >
              {isAuthenticated ? "Admin Dashboard" : "Admin Login"}
            </Link>
          </li>
        </ul>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about flower decoration in Nashik.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp</span>
          </a>
          <a href="tel:9921972936" className="btn btn-outline-white">
            <Phone size={18} />
            <span>Call 9921972936</span>
          </a>
        </div>
      </div>
    </>
  );
}
