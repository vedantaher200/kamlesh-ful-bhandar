import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, CalendarCheck } from 'lucide-react';
import { api, createWhatsAppUrl } from '../services/api';
import { Service } from '../types/index';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.getServices();
        if (res.success) setServices(res.services);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Grand Floral Setups</span>
          <h1 className="section-title">Decoration Services in Nashik</h1>
          <p className="section-description">
            Tailor-made floral setups for Indian weddings, religious ceremonies, stage backdrops, vehicle styling, and celebratory milestones.
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '4rem 0' }}>Loading services from database...</p>
        ) : (
          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
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
                      href={createWhatsAppUrl(`Hello Kamlesh Ful Bhandar, I would like to ask for a quotation for "${service.title}" in Nashik.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ flex: 1 }}
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp Quote</span>
                    </a>

                    <Link to="/bookings" className="btn btn-outline btn-sm">
                      <CalendarCheck size={14} />
                      <span>Book</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
