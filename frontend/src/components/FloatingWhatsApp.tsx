import React from 'react';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from '../services/api';

export default function FloatingWhatsApp() {
  return (
    <a
      href={createWhatsAppUrl('Hello Kamlesh Ful Bhandar, I would like to enquire about flower and decoration services in Nashik.')}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp-btn"
      aria-label="Direct WhatsApp Chat"
      title="Chat with Kamlesh Ful Bhandar on WhatsApp"
    >
      <MessageCircle size={30} />
    </a>
  );
}
