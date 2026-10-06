import React, { useEffect, useState } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types/index';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getAllReviews();
      if (res.success) setReviews(res.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      await api.updateReviewStatus(id, status);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to update review status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this review permanently?')) {
      try {
        await api.deleteReview(id);
        fetchReviews();
      } catch (err: any) {
        alert(err.message || 'Failed to delete review.');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Customer Reviews Moderation</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Moderate real customer reviews before they appear publicly on the website
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div style={{ background: '#ffffff', padding: '3rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No customer reviews submitted yet.
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Rating</th>
                <th>Review Comment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.customerName}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.15rem', color: '#eab308' }}>
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#eab308" />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '350px' }}>
                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{r.comment}"</div>
                  </td>
                  <td>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: r.status === 'APPROVED' ? '#dcfce7' : r.status === 'REJECTED' ? '#fee2e2' : '#fef3c7', color: r.status === 'APPROVED' ? '#15803d' : r.status === 'REJECTED' ? '#b91c1c' : '#b45309' }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {r.status !== 'APPROVED' && (
                        <button onClick={() => handleStatusChange(r.id, 'APPROVED')} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.6rem' }} title="Approve">
                          <Check size={14} />
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button onClick={() => handleStatusChange(r.id, 'REJECTED')} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.6rem' }} title="Reject">
                          <X size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(r.id)} style={{ color: '#ef4444', padding: '0.35rem' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
