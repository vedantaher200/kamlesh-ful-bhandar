import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Eye, EyeOff, X, Pencil } from 'lucide-react';
import { api } from '../../services/api';
import { GalleryImage } from '../../types/index';
import { GALLERY_CATEGORIES } from '../../utils/galleryCategories';

type Draft = { title: string; category: string; categoryName: string; description: string; image: string; imagePublicId: string; priceMode: 'FIXED' | 'ENQUIRY_ONLY'; price: string };
const blankDraft = (): Draft => ({ title: '', category: GALLERY_CATEGORIES[0].key, categoryName: GALLERY_CATEGORIES[0].label, description: '', image: '', imagePublicId: '', priceMode: 'ENQUIRY_ONLY', price: '' });

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft());
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchGallery = async () => {
    setLoading(true);
    try { const res = await api.getGallery(undefined, true); if (res.success) setImages(res.images); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load gallery items.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void fetchGallery(); }, []);

  const startCreate = () => { setEditing(null); setDraft(blankDraft()); setFile(null); setError(''); setMessage(''); setIsModalOpen(true); };
  const startEdit = (img: GalleryImage) => {
    setEditing(img); setFile(null); setError(''); setMessage('');
    setDraft({ title: img.title, category: img.category, categoryName: img.categoryName || img.category, description: img.description || '', image: img.image, imagePublicId: img.imagePublicId || '', priceMode: img.priceMode === 'FIXED' && typeof img.price === 'number' ? 'FIXED' : 'ENQUIRY_ONLY', price: typeof img.price === 'number' ? String(img.price) : '' });
    setIsModalOpen(true);
  };
  const closeModal = () => { if (!saving) setIsModalOpen(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage('');
    if (!draft.title.trim()) { setError('Enter a photo title.'); return; }
    if (draft.priceMode === 'FIXED' && (!draft.price.trim() || !Number.isFinite(Number(draft.price)) || Number(draft.price) < 0)) { setError('Enter a valid non-negative fixed price.'); return; }
    setSaving(true);
    try {
      let image = draft.image; let imagePublicId = draft.imagePublicId;
      if (file) { const uploaded = await api.uploadImage(file); image = uploaded.url; imagePublicId = uploaded.publicId; }
      if (!image) throw new Error('Choose an image before saving.');
      const payload = { title: draft.title.trim(), category: draft.category, categoryName: draft.categoryName.trim(), description: draft.description.trim(), image, imagePublicId, priceMode: draft.priceMode, price: draft.priceMode === 'FIXED' ? Number(draft.price) : null };
      if (editing) await api.updateGalleryImage(editing.id, payload);
      else await api.createGalleryImage({ ...payload, isPublished: true });
      setIsModalOpen(false); setMessage(editing ? 'Gallery item updated.' : 'Gallery item added.'); await fetchGallery();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save gallery item.'); }
    finally { setSaving(false); }
  };
  const handleTogglePublish = async (img: GalleryImage) => {
    setError(''); setMessage('');
    try { await api.updateGalleryImage(img.id, { isPublished: !img.isPublished }); setMessage(img.isPublished ? 'Gallery item unpublished.' : 'Gallery item published.'); await fetchGallery(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to update item.'); }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this gallery item? The uploaded image file will remain in image storage.')) return;
    setError(''); setMessage('');
    try { await api.deleteGalleryImage(id); setMessage('Gallery item deleted.'); await fetchGallery(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete item.'); }
  };
  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  return <div>
    <div className="admin-header"><div><h1>Gallery Portfolio Management</h1><p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Manage original shop photos across the four flower shop services.</p></div><button onClick={startCreate} className="btn btn-primary"><PlusCircle size={18} /><span>Add Gallery Item</span></button></div>
    {message && <p role="status" style={{ color: '#15803d' }}>{message}</p>}{error && !isModalOpen && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    {loading ? <p>Loading photos...</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
      {images.map((img) => <div key={img.id} style={{ background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 180, position: 'relative' }}><img src={img.image} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: '.7rem', padding: '.2rem .5rem', borderRadius: 20 }}>{img.categoryName}</span></div>
        <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}><h4 style={{ margin: '0 0 .3rem', color: 'var(--color-primary-dark)' }}>{img.title}</h4><p style={{ fontSize: '.84rem', color: '#64748b', margin: '0 0 .65rem' }}>{img.priceMode === 'FIXED' && typeof img.price === 'number' ? `₹${img.price.toLocaleString('en-IN')}` : 'Price on Request'}</p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '.65rem', alignItems: 'center' }}><button onClick={() => handleTogglePublish(img)} style={{ fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: '.3rem', color: img.isPublished ? '#16a34a' : '#64748b' }}>{img.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}{img.isPublished ? 'Published' : 'Unpublished'}</button><button aria-label={`Edit ${img.title}`} onClick={() => startEdit(img)} style={{ marginLeft: 'auto', color: '#475569' }}><Pencil size={16} /></button><button aria-label={`Delete ${img.title}`} onClick={() => void handleDelete(img.id)} style={{ color: '#ef4444' }}><Trash2 size={16} /></button></div>
        </div>
      </div>)}
    </div>}
    {isModalOpen && <div className="modal-overlay" onClick={closeModal}><div className="modal-content" onClick={(e) => e.stopPropagation()}><div className="modal-header"><h3>{editing ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3><button type="button" onClick={closeModal}><X size={20} /></button></div>
      <form onSubmit={handleSave}>
        {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
        <label className="form-label">Photo title *</label><input required maxLength={160} className="form-control" value={draft.title} onChange={(e) => setField('title', e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}><div><label className="form-label">Service category *</label><select className="form-control" value={draft.category} onChange={(e) => { const chosen = GALLERY_CATEGORIES.find((item) => item.key === e.target.value)!; setField('category', chosen.key); setField('categoryName', chosen.label); }}>{GALLERY_CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{cat.label}</option>)}</select></div><div><label className="form-label">Display label</label><input className="form-control" value={draft.categoryName} onChange={(e) => setField('categoryName', e.target.value)} /></div></div>
        <label className="form-label">Description</label><textarea rows={3} className="form-control" value={draft.description} onChange={(e) => setField('description', e.target.value)} />
        <div style={{ margin: '1rem 0', padding: '1rem', border: '1.5px dashed #cbd5e1', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}><label className="form-label">{editing ? 'Replace photo (optional)' : 'Original shop photo *'}</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /><small style={{ display: 'block', color: '#64748b', marginTop: '.4rem' }}>Uploading stores this photo in the configured image storage.</small>{editing && <div style={{ marginTop: '.5rem' }}>Current photo: <a href={draft.image} target="_blank" rel="noreferrer">open</a></div>}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}><div><label className="form-label">Pricing display</label><select className="form-control" value={draft.priceMode} onChange={(e) => setField('priceMode', e.target.value as Draft['priceMode'])}><option value="ENQUIRY_ONLY">Enquiry only</option><option value="FIXED">Fixed price</option></select></div>{draft.priceMode === 'FIXED' && <div><label className="form-label">Actual price (₹) *</label><input type="number" min="0" step="0.01" required className="form-control" value={draft.price} onChange={(e) => setField('price', e.target.value)} /></div>}</div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}><button type="button" onClick={closeModal} className="btn btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add to Gallery'}</button></div>
      </form>
    </div></div>}
  </div>;
}
