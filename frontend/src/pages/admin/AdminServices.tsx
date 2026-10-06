import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import { Service } from '../../types/index';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [highlight, setHighlight] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Decoration');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.getServices();
      if (res.success) setServices(res.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAdd = () => {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setHighlight('');
    setImage('');
    setCategory('Decoration');
    setIsAvailable(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setTitle(s.title);
    setDescription(s.description);
    setHighlight(s.highlight || '');
    setImage(s.image);
    setCategory(s.category);
    setIsAvailable(s.isAvailable);
    setIsFeatured(s.isFeatured);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Partial<Service> = {
        title,
        description,
        highlight: highlight || undefined,
        image,
        category,
        isAvailable,
        isFeatured
      };

      if (editingService) {
        await api.updateService(editingService.id, data);
      } else {
        await api.createService(data);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, sTitle: string) => {
    if (window.confirm(`Delete service "${sTitle}"?`)) {
      try {
        await api.deleteService(id);
        fetchServices();
      } catch (err: any) {
        alert(err.message || 'Failed to delete service.');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Services Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Configure wedding, haldi, mandap, car decor, and celebration services
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Highlight</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    <img
                      src={s.image}
                      alt={s.title}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td>{s.category}</td>
                  <td>{s.highlight || '—'}</td>
                  <td>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: s.isAvailable ? '#dcfce7' : '#fee2e2', color: s.isAvailable ? '#15803d' : '#b91c1c' }}>
                      {s.isAvailable ? 'Available' : 'Disabled'}
                    </span>
                  </td>
                  <td>{s.isFeatured ? '⭐ Yes' : 'No'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(s)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.6rem' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.title)} className="btn btn-danger btn-sm" style={{ padding: '0.35rem 0.6rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingService ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Service Title *</label>
                  <input type="text" required className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Category</label>
                  <input type="text" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Highlight Badge</label>
                  <input type="text" placeholder="e.g. Grand Stages & Mandaps" className="form-control" value={highlight} onChange={(e) => setHighlight(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Image URL *</label>
                  <input type="text" required placeholder="https://..." className="form-control" value={image} onChange={(e) => setImage(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Description *</label>
                <textarea rows={3} required className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                  Available For Booking
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                  Feature on Homepage
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
