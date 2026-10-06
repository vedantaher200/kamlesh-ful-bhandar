import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, MessageCircle, AlertTriangle, Send, PhoneCall } from 'lucide-react';
import { api, createWhatsAppUrl } from '../services/api';
import { Service } from '../types/index';

export default function Bookings() {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    eventType: 'Wedding',
    eventDate: '',
    eventLocation: 'Nashik',
    serviceId: '',
    budget: '',
    message: ''
  });

  const [isDateConflict, setIsDateConflict] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calRes, servRes] = await Promise.all([
          api.getCalendarDates(),
          api.getServices()
        ]);
        if (calRes.success) {
          setBlockedDates(calRes.dates.map((d) => d.date));
        }
        if (servRes.success) {
          setServices(servRes.services);
        }
      } catch (err) {
        console.error('Error fetching calendar dates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDateChange = (selectedDate: string) => {
    setFormData({ ...formData, eventDate: selectedDate });
    if (blockedDates.includes(selectedDate)) {
      setIsDateConflict(true);
    } else {
      setIsDateConflict(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.eventDate) {
      setErrorMsg('Please enter your Name, Mobile Number, and Event Date.');
      return;
    }

    if (isDateConflict) {
      setErrorMsg('The selected date is currently marked unavailable. Please call us directly or select another date.');
      return;
    }

    try {
      await api.createBooking(formData);
      setSubmitted(true);
      setErrorMsg('');

      // Build WhatsApp message
      const msg = `Hello Kamlesh Ful Bhandar, I would like to book flower decoration in Nashik:\n\n👤 Name: ${formData.customerName}\n📱 Mobile: ${formData.customerPhone}\n🎉 Event Type: ${formData.eventType}\n📅 Date: ${formData.eventDate}\n📍 Location: ${formData.eventLocation}\n💰 Budget: ${formData.budget || 'Flexible'}\n💬 Message: ${formData.message || 'Please confirm availability.'}`;
      window.open(createWhatsAppUrl(msg), '_blank');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit booking.');
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="section-header">
          <span className="section-tag">Direct Scheduling</span>
          <h1 className="section-title">Book Floral Decoration</h1>
          <p className="section-description">
            Reserve your wedding or event date with Kamlesh Ful Bhandar. Check availability and request a detailed quotation.
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3.5rem', border: '1px solid var(--color-cream-border)', boxShadow: 'var(--shadow-lg)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={64} color="#25D366" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                Booking Request Submitted!
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                Your request has been recorded in our PostgreSQL database and forwarded to WhatsApp. Our decoration team will review and contact you immediately.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a
                  href="tel:9921972936"
                  className="btn btn-outline"
                >
                  <PhoneCall size={18} />
                  <span>Call to Confirm</span>
                </a>
                <button onClick={() => setSubmitted(false)} className="btn btn-primary">
                  New Booking Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={20} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isDateConflict && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={20} />
                  <span>
                    Notice: This date has existing bookings or has been marked unavailable. You may still call us at <strong>9921972936</strong> to discuss special slots.
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Deshmukh"
                    className="form-control"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    className="form-control"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Event Type *
                  </label>
                  <select
                    className="form-control"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Haldi">Haldi Ceremony</option>
                    <option value="Engagement">Engagement / Ring Ceremony</option>
                    <option value="Reception">Reception</option>
                    <option value="Mandap & Stage">Mandap & Stage</option>
                    <option value="Car Decor">Car / Ghargadi Decoration</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Puja / Traditional">Traditional / Puja / Vastu</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.eventDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Event Venue / Location in Nashik
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pawan Nagar, Gangapur Road, etc."
                    className="form-control"
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Approximate Budget (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹10,000 – ₹25,000"
                    className="form-control"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                    Specific Floral Requirements or Notes
                  </label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Tell us about color themes, stage size, preferred flowers, etc."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
                    <Send size={18} />
                    <span>Submit & Confirm on WhatsApp</span>
                  </button>
                  <span style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Saved to database & sent directly to +91 9921972936
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
