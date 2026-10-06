import React, { useState } from 'react';
import { Check, Sparkles, Heart, Award, Star, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function About() {
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) {
      setReviewError('Please provide your name and feedback.');
      return;
    }

    try {
      await api.submitReview({
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSubmitted(true);
      setReviewError('');
    } catch (err: any) {
      setReviewError(err.message || 'Submission failed.');
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About Our Business</span>
          <h1 className="section-title">Celebrating Every Occasion With Flowers</h1>
          <p className="section-description">
            Kamlesh Ful Bhandar provides flowers and floral decoration services for weddings, celebrations, events, and special occasions in Nashik.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--color-cream-border)', boxShadow: 'var(--shadow-lg)' }}>
            <img
              src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80"
              alt="Kamlesh Ful Bhandar Florals"
              style={{ width: '100%', height: '460px', objectFit: 'cover' }}
            />
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              Rooted In Tradition, Crafted With Freshness
            </h2>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Located near Ganpati Mandir in Pawan Nagar, <strong>Kamlesh Ful Bhandar</strong> serves families, couples, and event organizers across Nashik and nearby regions. We source fresh blooms every morning, ensuring that garlands retain their fragrance and wedding decor remains vibrant throughout your ceremonies.
            </p>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              We specialize in custom stage backdrops, traditional varmalas, car decoration, and hand bouquets with personalized customer attention.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} /></div>
                <span>Quality Flowers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={16} /></div>
                <span>Creative Designs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={16} /></div>
                <span>Customer Satisfaction</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(203, 162, 57, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={16} /></div>
                <span>Reliable Nashik Team</span>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEW SUBMISSION FORM */}
        <div style={{ background: '#ffffff', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-cream-border)', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">Client Feedback</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary-dark)', margin: '0.5rem 0' }}>
              Leave a Review For Us
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
              Have you worked with us in Nashik? Share your experience with our team.
            </p>
          </div>

          {reviewSubmitted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <CheckCircle2 size={48} color="#25D366" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.4rem' }}>
                Thank You For Your Review!
              </h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Your review has been submitted to our moderation panel and will appear once approved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              {reviewError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {reviewError}
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shraddha K."
                  className="form-control"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>Rating *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      style={{ padding: '0.4rem', color: num <= reviewRating ? 'var(--color-gold)' : '#cbd5e1' }}
                    >
                      <Star size={24} fill={num <= reviewRating ? 'var(--color-gold)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>Your Review / Experience *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us about the flower decoration, delivery promptness, and freshness..."
                  className="form-control"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} />
                <span>Submit Review</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
