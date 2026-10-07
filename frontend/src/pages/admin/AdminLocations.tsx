import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2, Search, MapPin, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../services/api';
import { Location } from '../../types/index';

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Form State
  const [district, setDistrict] = useState('Nashik');
  const [taluka, setTaluka] = useState('Niphad');
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.getAllLocationsAdmin();
      if (res.success) {
        setLocations(res.locations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setDistrict('Nashik');
    setTaluka('Niphad');
    setVillage('');
    setArea('');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setDistrict(loc.district);
    setTaluka(loc.taluka);
    setVillage(loc.village);
    setArea(loc.area || '');
    setIsActive(loc.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload: Partial<Location> = {
        district: district.trim(),
        taluka: taluka.trim(),
        village: village.trim(),
        area: area ? area.trim() : null,
        isActive
      };

      if (editingLocation) {
        await api.updateLocation(editingLocation.id, payload);
        setSuccessMsg(`Location "${village}" updated.`);
      } else {
        await api.createLocation(payload);
        setSuccessMsg(`Location "${village}" added to Nashik database.`);
      }

      setIsModalOpen(false);
      fetchLocations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (loc: Location) => {
    try {
      await api.toggleLocationStatus(loc.id);
      setLocations((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, isActive: !l.isActive } : l))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (loc: Location) => {
    if (window.confirm(`Delete location "${loc.village}" from ${loc.taluka}?`)) {
      try {
        await api.deleteLocation(loc.id);
        setSuccessMsg(`Location "${loc.village}" removed.`);
        fetchLocations();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: any) {
        alert(err.message || 'Failed to delete location.');
      }
    }
  };

  const talukas = Array.from(new Set(locations.map((l) => l.taluka))).sort();

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.village.toLowerCase().includes(search.toLowerCase()) ||
      (loc.area && loc.area.toLowerCase().includes(search.toLowerCase())) ||
      loc.taluka.toLowerCase().includes(search.toLowerCase());

    const matchesTaluka = selectedTaluka === 'ALL' || loc.taluka === selectedTaluka;
    return matchesSearch && matchesTaluka;
  });

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Location Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Manage villages and service areas across Nashik district for customer WhatsApp ordering
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
          <PlusCircle size={18} />
          <span>+ Add New Location</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 2, minWidth: '220px', background: '#ffffff' }}>
          <Search size={17} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search village, area or taluka..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}
          value={selectedTaluka}
          onChange={(e) => setSelectedTaluka(e.target.value)}
        >
          <option value="ALL">All Talukas</option>
          {talukas.map((t) => (
            <option key={t} value={t}>{t} Taluka</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading locations...</p>
      ) : filteredLocations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <h4>No locations found</h4>
        </div>
      ) : (
        <div className="admin-table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>District</th>
                <th>Taluka</th>
                <th>Village / City</th>
                <th>Area / Landmark</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((loc) => (
                <tr key={loc.id}>
                  <td><strong>{loc.district}</strong></td>
                  <td>{loc.taluka}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {loc.village}
                    </span>
                  </td>
                  <td>{loc.area || '—'}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(loc)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: 'none',
                        background: loc.isActive ? '#dcfce7' : '#fee2e2',
                        color: loc.isActive ? '#15803d' : '#b91c1c'
                      }}
                      title="Click to toggle active status"
                    >
                      {loc.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openEditModal(loc)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Edit Location"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(loc)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Delete Location"
                      >
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

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '2rem' }}
          >
            <div className="modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  District
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Taluka *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Niphad, Nashik, Dindori, Sinnar..."
                  className="form-control"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Village / City / Town *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Janwad, Vadai, Bhutyane, Pimpalgaon..."
                  className="form-control"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Area / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Market Yard, Ganpati Mandir Jawal..."
                  className="form-control"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active in customer selector dropdown</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {saving ? 'Saving...' : editingLocation ? 'Save Changes' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
