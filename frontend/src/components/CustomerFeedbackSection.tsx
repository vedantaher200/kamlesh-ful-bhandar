import React, { useState } from 'react';
import { Review } from '../types/index';
import { createWhatsAppUrl, api } from '../services/api';
import { MessageSquare, MessageCircle, Star, Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface CustomerFeedbackSectionProps {
  approvedReviews?: Review[];
  onReviewSubmitted?: () => void;
}

export default function CustomerFeedbackSection({
  approvedReviews = [],
  onReviewSubmitted
}: CustomerFeedbackSectionProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [serviceUsed, setServiceUsed] = useState('Wedding Decoration');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setErrorMsg('Please enter your name and comments.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.createReview({
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
        serviceUsed
      });
      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        setShowReviewModal(false);
        setSubmitted(false);
        setName('');
        setComment('');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappFeedbackUrl = createWhatsAppUrl(
    `Hello Kamlesh Ful Bhandar, I would like to share my feedback / review regarding your flower decoration service.`
  );

  return (
    <section className="section-padding" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            <MessageSquare size={14} />
            Customer Feedback
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)',
              color: 'var(--color-primary-dark)',
              margin: '0 0 0.5rem'
            }}
          >
            WHAT OUR CUSTOMERS SAY
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Real customer impressions from families and event hosts across Nashik who trusted us with their floral celebrations.
          </p>
        </div>

        {/* If actual database reviews exist, display them cleanly */}
        {approvedReviews && approvedReviews.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}
          >
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--color-gold, #f59e0b)" color="var(--color-gold, #f59e0b)" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  "{rev.comment}"
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>{rev.customerName}</strong>
                    {rev.serviceUsed && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rev.serviceUsed}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Elegant Review Invitation Box */}
        <div
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            border: '1px dashed #cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <Sparkles size={26} />
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              color: 'var(--color-primary-dark)',
              margin: '0 0 0.4rem'
            }}
          >
            Have you enjoyed our service?
          </h3>

          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Share your experience with us. Your feedback helps us continue crafting fresh, memorable floral decor for Nashik families.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <MessageSquare size={16} />
              <span>Write a Review</span>
            </button>

            <a
              href={whatsappFeedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <MessageCircle size={16} />
              <span>Send Feedback on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Interactive Review Modal */}
        {showReviewModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowReviewModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', color: '#065f46', margin: '0 0 0.5rem' }}>
                    Thank You for Your Feedback!
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Your review has been received and will be displayed after quick verification.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.3rem',
                      color: 'var(--color-primary-dark)',
                      margin: '0 0 0.5rem'
                    }}
                  >
                    Share Your Experience
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                    Tell us about your flower decoration, varmala, or bouquet service.
                  </p>

                  {errorMsg && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Service Used
                    </label>
                    <select
                      value={serviceUsed}
                      onChange={(e) => setServiceUsed(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="Car Decoration">Car Decoration</option>
                      <option value="Haar & Varmala">Haar & Varmala</option>
                      <option value="Wedding & Engagement">Wedding & Engagement Decoration</option>
                      <option value="Bouquets & Gifts">Bouquets & Gifts</option>
                      <option value="Entrance Flower Decoration">Entrance Flower Decoration</option>
                      <option value="Fresh Daily Flowers">Fresh Daily Flowers</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Rating
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Star
                            size={24}
                            fill={star <= rating ? 'var(--color-gold, #f59e0b)' : 'transparent'}
                            color={star <= rating ? 'var(--color-gold, #f59e0b)' : '#cbd5e1'}
                          />
                        </button>
                      ))}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginLeft: '0.5rem' }}>
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Your Review / Comments *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your genuine experience with our flower service..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                    >
                      <Send size={15} />
                      <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
