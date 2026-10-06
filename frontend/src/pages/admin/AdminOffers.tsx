import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Tag, X } from 'lucide-react';
import { api } from '../../services/api';
import { Offer } from '../../types/index';

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllOffers();
      if (res.success) setOffers(res.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createOffer({ title, description, isActive });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to create offer.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (o: Offer) => {
    try {
      await api.updateOffer(o.id, { isActive: !o.isActive });
      fetchOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to update offer.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this promotional offer?')) {
      try {
        await api.deleteOffer(id);
        fetchOffers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete offer.');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Festive & Promotional Offers</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Display active seasonal announcements and special packages on the customer website
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Create New Offer</span>
        </button>
      </div>

      {loading ? (
        <p>Loading offers...</p>
      ) : offers.length === 0 ? (
        <div style={{ background: '#ffffff', padding: '3rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No promotional offers created yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {offers.map((o) => (
            <div key={o.id} style={{ background: '#ffffff', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>{o.title}</h3>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: o.isActive ? '#dcfce7' : '#fee2e2', color: o.isActive ? '#15803d' : '#b91c1c' }}>
                  {o.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{o.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button onClick={() => handleToggleActive(o)} className="btn btn-outline btn-sm">
                  {o.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(o.id)} style={{ color: '#ef4444' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Promotional Offer</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Offer Title *</label>
                <input type="text" required placeholder="e.g. Wedding Season Combo Booking" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Description *</label>
                <textarea rows={3} required placeholder="Book wedding mandap decor and receive complimentary groom car floral styling..." className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Display as Active Banner on Homepage
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
