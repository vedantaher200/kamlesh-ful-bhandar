import React, { useState, useEffect } from 'react';
import { X, MessageCircle, MapPin, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';
import { api, createWhatsAppUrl, formatPrice } from '../services/api';
import { Product, Location } from '../types/index';

interface WhatsAppBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  defaultEventType?: string;
}

export default function WhatsAppBookingModal({
  isOpen,
  onClose,
  product,
  defaultEventType = 'Wedding'
}: WhatsAppBookingModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [selectedTaluka, setSelectedTaluka] = useState<string>('Niphad');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [isOtherLocation, setIsOtherLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState(defaultEventType);
  const [requirement, setRequirement] = useState('');

  const [loadingLocations, setLoadingLocations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.getActiveLocations();
        if (res.success) {
          setLocations(res.locations);
          setTalukas(res.talukas);
          if (res.talukas.length > 0 && !selectedTaluka) {
            setSelectedTaluka(res.talukas[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
    setSubmitted(false);
    setErrorMsg('');
  }, [isOpen]);

  // Filter villages by current selected taluka
  const currentVillages = locations.filter((loc) => loc.taluka === selectedTaluka);

  useEffect(() => {
    if (currentVillages.length > 0 && !isOtherLocation) {
      setSelectedVillage(currentVillages[0].village);
    }
  }, [selectedTaluka, locations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const finalVillage = isOtherLocation ? customLocation.trim() : selectedVillage;
    if (!finalVillage) {
      setErrorMsg('Please select or specify your location.');
      return;
    }

    setSubmitting(true);

    try {
      const fullLocationString = isOtherLocation
        ? `${customLocation.trim()} (Other, Nashik)`
        : `${selectedVillage}, ${selectedTaluka}, Nashik`;

      // Record enquiry in backend database
      await api.createEnquiry({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        eventType: eventType || (product ? 'Product Enquiry' : 'General Flower Enquiry'),
        eventDate: eventDate || undefined,
        district: 'Nashik',
        taluka: isOtherLocation ? 'Other' : selectedTaluka,
        village: finalVillage,
        eventLocation: fullLocationString,
        productId: product?.id,
        productName: product?.name,
        service: product?.name || eventType,
        message: requirement ? requirement.trim() : undefined
      });

      // Format clean WhatsApp Booking message
      let message = `Hello Kamlesh Ful Bhandar,\n\nI want to book/enquire about:\n`;
      if (product) {
        message += `\n🌸 Product:\n${product.name}`;
        message += `\n💰 Price:\n${formatPrice(product.price, product.isContactForPrice, product.priceType)}`;
        if (product.length) message += `\n📏 Length: ${product.length}`;
        if (product.flowerType) message += `\n🌿 Flower Type: ${product.flowerType}`;
      } else {
        message += `\n🎉 Service / Event:\n${eventType}`;
      }

      message += `\n\n👤 Customer Name:\n${customerName.trim()}`;
      message += `\n📱 Mobile:\n${cleanPhone}`;
      message += `\n📍 Location:\n${fullLocationString}`;

      if (eventDate) {
        message += `\n📅 Event Date:\n${eventDate}`;
      }
      if (requirement.trim()) {
        message += `\n📝 Requirement:\n${requirement.trim()}`;
      }

      // Open WhatsApp
      const waUrl = createWhatsAppUrl(message);
      window.open(waUrl, '_blank');

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. You can still message us directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="modal-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MessageCircle size={14} /> Quick WhatsApp Booking
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: '0.2rem 0 0' }}>
              {product ? product.name : 'Book Floral Service'}
            </h3>
            {product && (
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                {formatPrice(product.price, product.isContactForPrice, product.priceType)}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={54} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
              Opening WhatsApp...
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Your order inquiry has been saved. WhatsApp will open with your pre-filled details for instant confirmation!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            {/* NAME & PHONE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.825rem', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Your Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    className="form-control"
                    style={{ paddingLeft: '2.2rem', fontSize: '0.9rem' }}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.825rem', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Mobile Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile"
                    className="form-control"
                    style={{ paddingLeft: '2.2rem', fontSize: '0.9rem' }}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            {/* LOCATION SELECTOR */}
            <div style={{ background: 'var(--color-cream)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-cream-border)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> Location in Nashik District *
                </span>
                <button
                  type="button"
                  onClick={() => setIsOtherLocation(!isOtherLocation)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {isOtherLocation ? 'Choose from list' : 'Other location?'}
                </button>
              </div>

              {isOtherLocation ? (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your Village / Area / City (e.g. Panchavati, Nashik)"
                    className="form-control"
                    style={{ fontSize: '0.85rem' }}
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                    Type your specific village, colony or landmark in Nashik
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                      Select Taluka
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.85rem', padding: '0.55rem' }}
                      value={selectedTaluka}
                      onChange={(e) => setSelectedTaluka(e.target.value)}
                    >
                      {talukas.map((t) => (
                        <option key={t} value={t}>
                          {t} Taluka
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                      Select Village / Area
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.85rem', padding: '0.55rem' }}
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                    >
                      {currentVillages.map((loc) => (
                        <option key={loc.id} value={loc.village}>
                          {loc.village} {loc.area ? `(${loc.area})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* EVENT DATE & REQUIREMENT (OPTIONAL) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.825rem', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Event Date (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="form-control"
                    style={{ fontSize: '0.85rem' }}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.825rem', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Event Type
                </label>
                <select
                  className="form-control"
                  style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Haldi">Haldi Ceremony</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Car Decor">Car Decoration</option>
                  <option value="Haar / Varmala">Haar / Varmala</option>
                  <option value="Birthday / Bouquet">Birthday Bouquet</option>
                  <option value="Puja / Traditional">Puja / Mandir Seva</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.825rem', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                Requirement / Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Specific color preference, timing or custom requests..."
                className="form-control"
                style={{ fontSize: '0.85rem', resize: 'none' }}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
            </div>

            {/* BUTTONS */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-whatsapp"
                style={{ flex: 2, padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem' }}
              >
                <MessageCircle size={18} />
                <span>{submitting ? 'Connecting...' : 'Continue to WhatsApp'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
