import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';
import { createWhatsAppUrl } from '../services/api';

export default function StickyMobileBar() {
  return (
    <aside className="sticky-mobile-bar" aria-label="Quick Actions">
      <a
        href="tel:9921972936"
        className="mobile-action-btn mobile-action-call"
        aria-label="Call business"
      >
        <Phone size={18} />
        <span>Call</span>
      </a>

      <a
        href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about your services in Nashik.')}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-action-btn mobile-action-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={18} />
        <span>WhatsApp</span>
      </a>

      <Link
        to="/bookings"
        className="mobile-action-btn mobile-action-quote"
        aria-label="Book or Quote"
      >
        <CalendarCheck size={18} />
        <span>Book/Quote</span>
      </Link>
    </aside>
  );
}
