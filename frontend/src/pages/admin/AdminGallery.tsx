import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Eye, EyeOff, X, Pencil, Copy, Upload, RotateCcw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { GalleryImage } from '../../types/index';
import { GALLERY_CATEGORIES } from '../../utils/galleryCategories';

type Draft = {
  title: string;
  category: string;
  categoryName: string;
  description: string;
  image: string;
  imagePublicId: string;
  priceMode: 'FIXED' | 'ENQUIRY_ONLY';
  price: string;
};

const blankDraft = (): Draft => ({
  title: '',
  category: GALLERY_CATEGORIES[0].key,
  categoryName: GALLERY_CATEGORIES[0].label,
  description: '',
  image: '',
  imagePublicId: '',
  priceMode: 'ENQUIRY_ONLY',
  price: ''
});

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft());
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.getGallery(undefined, true);
      if (res.success) setImages(res.images);
    } catch (err: any) {
      setError(err?.message || 'Could not load gallery items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGallery();
  }, []);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const startCreate = () => {
    setEditing(null);
    setDraft(blankDraft());
    setFile(null);
    setFilePreview('');
    setError('');
    setMessage('');
    setIsModalOpen(true);
  };

  const startEdit = (img: GalleryImage) => {
    setEditing(img);
    setFile(null);
    setFilePreview('');
    setError('');
    setMessage('');
    setDraft({
      title: img.title,
      category: img.category,
      categoryName: img.categoryName || img.category,
      description: img.description || '',
      image: img.image,
      imagePublicId: img.imagePublicId || '',
      priceMode: img.priceMode === 'FIXED' && typeof img.price === 'number' ? 'FIXED' : 'ENQUIRY_ONLY',
      price: typeof img.price === 'number' ? String(img.price) : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
      setIsModalOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
      setFilePreview(URL.createObjectURL(selected));
    }
  };

  const handleClearSelectedFile = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview('');
  };

  const handleDuplicate = async (img: GalleryImage) => {
    setError('');
    try {
      setLoading(true);
      const res = await api.duplicateGalleryImage(img.id);
      if (res.success) {
        showNotification(`Gallery item duplicated: "${res.galleryImage.title}"`);
        await fetchGallery();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to duplicate gallery item.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!draft.title.trim()) {
      setError('Enter a photo title.');
      return;
    }

    if (
      draft.priceMode === 'FIXED' &&
      (!draft.price.trim() || !Number.isFinite(Number(draft.price)) || Number(draft.price) < 0)
    ) {
      setError('Enter a valid non-negative fixed price.');
      return;
    }

    // Require an image for new posts if neither file nor existing url exists
    if (!editing && !file && !draft.image) {
      setError('Please select an image file to upload.');
      return;
    }

    setSaving(true);
    try {
      let finalImage = draft.image;
      let finalPublicId = draft.imagePublicId;

      // Upload newly selected file to Vercel Blob
      if (file) {
        const uploadRes = await api.uploadImage(file);
        if (uploadRes && uploadRes.url) {
          finalImage = uploadRes.url;
          finalPublicId = uploadRes.publicId;
        } else {
          throw new Error('Image upload did not return a valid URL.');
        }
      }

      if (!finalImage) {
        throw new Error('Choose an image before saving.');
      }

      const payload = {
        title: draft.title.trim(),
        category: draft.category,
        categoryName: draft.categoryName.trim(),
        description: draft.description.trim(),
        image: finalImage,
        imagePublicId: finalPublicId || null,
        priceMode: draft.priceMode,
        price: draft.priceMode === 'FIXED' ? Number(draft.price) : null
      };

      if (editing) {
        // Guaranteed update to existing record ID (never creates duplicate)
        await api.updateGalleryImage(editing.id, payload);
        showNotification('Gallery item updated successfully.');
      } else {
        await api.createGalleryImage({ ...payload, isPublished: true });
        showNotification('Gallery item added successfully.');
      }

      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
      setIsModalOpen(false);
      await fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Could not save gallery item.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (img: GalleryImage) => {
    setError('');
    try {
      await api.updateGalleryImage(img.id, { isPublished: !img.isPublished });
      showNotification(img.isPublished ? 'Gallery item unpublished.' : 'Gallery item published.');
      await fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to update item.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this gallery item? This action removes the database record.')) return;
    setError('');
    try {
      await api.deleteGalleryImage(id);
      showNotification('Gallery item deleted.');
      await fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete item.');
    }
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Gallery Portfolio Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Manage original shop photos across the four flower shop services.
          </p>
        </div>
        <button onClick={startCreate} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Gallery Item</span>
        </button>
      </div>

      {message && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {error && !isModalOpen && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading photos...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: 180, position: 'relative', backgroundColor: '#f1f5f9' }}>
                <img
                  src={img.image}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as any).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="180"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12">Image Not Available</text></svg>';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,.75)',
                    color: '#fff',
                    fontSize: '.7rem',
                    padding: '.2rem .5rem',
                    borderRadius: 20
                  }}
                >
                  {img.categoryName}
                </span>

                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: '.68rem',
                    fontWeight: 700,
                    padding: '.15rem .45rem',
                    borderRadius: 12,
                    background: img.isPublished ? '#dcfce7' : '#f1f5f9',
                    color: img.isPublished ? '#15803d' : '#64748b',
                    border: img.isPublished ? '1px solid #86efac' : '1px solid #cbd5e1'
                  }}
                >
                  {img.isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}
                </span>
              </div>

              <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 .3rem', color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                  {img.title}
                </h4>
                <p style={{ fontSize: '.84rem', color: '#64748b', margin: '0 0 .65rem' }}>
                  {img.priceMode === 'FIXED' && typeof img.price === 'number'
                    ? `₹${img.price.toLocaleString('en-IN')}`
                    : 'Price on Request'}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(img)}
                    style={{
                      fontSize: '.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.3rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: img.isPublished ? '#16a34a' : '#64748b'
                    }}
                  >
                    {img.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                    {img.isPublished ? 'Visible' : 'Hidden'}
                  </button>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      aria-label={`Duplicate ${img.title}`}
                      onClick={() => handleDuplicate(img)}
                      style={{
                        background: '#fff7ed',
                        border: '1px solid #ffedd5',
                        borderRadius: '6px',
                        padding: '0.35rem 0.5rem',
                        color: '#c2410c',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Duplicate post as new record"
                    >
                      <Copy size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Edit ${img.title}`}
                      onClick={() => startEdit(img)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.35rem 0.5rem',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Edit this post"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${img.title}`}
                      onClick={() => void handleDelete(img.id)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: '6px',
                        padding: '0.35rem 0.5rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Delete this post"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{editing ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>
                <small style={{ color: '#64748b' }}>
                  {editing
                    ? `Updating existing record (${editing.id})`
                    : 'Upload photo directly to Vercel Blob store.'}
                </small>
              </div>
              <button type="button" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {error && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.65rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {editing && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.55rem 0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#166534' }}>
                  <CheckCircle2 size={15} color="#16a34a" />
                  <span>Editing existing database record. ID and order are preserved.</span>
                </div>
              )}

              <label className="form-label">Photo title *</label>
              <input
                required
                maxLength={160}
                className="form-control"
                placeholder="e.g. Royal Stage Floral Decor"
                value={draft.title}
                onChange={(e) => setField('title', e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                <div>
                  <label className="form-label">Service category *</label>
                  <select
                    className="form-control"
                    value={draft.category}
                    onChange={(e) => {
                      const chosen = GALLERY_CATEGORIES.find((item) => item.key === e.target.value)!;
                      setField('category', chosen.key);
                      setField('categoryName', chosen.label);
                    }}
                  >
                    {GALLERY_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Display label</label>
                  <input
                    className="form-control"
                    value={draft.categoryName}
                    onChange={(e) => setField('categoryName', e.target.value)}
                  />
                </div>
              </div>

              <label className="form-label">Description</label>
              <textarea
                rows={2}
                className="form-control"
                placeholder="Describe floral styling, flower types, or occasion..."
                value={draft.description}
                onChange={(e) => setField('description', e.target.value)}
              />

              {/* IMAGE SELECTION & PREVIEW SECTION */}
              <div
                style={{
                  margin: '1rem 0',
                  padding: '1rem',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                    {editing ? 'Photo Replacement (Vercel Blob)' : 'Select Photo from Device *'}
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <RotateCcw size={12} />
                      <span>{editing ? 'Revert to Current' : 'Clear Selection'}</span>
                    </button>
                  )}
                </div>

                {/* Preview Box */}
                {(filePreview || (editing && draft.image)) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                      <img
                        src={filePreview || draft.image}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.78rem', flex: 1 }}>
                      {file ? (
                        <>
                          <div style={{ fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Upload size={13} />
                            <span>New file selected ({file.name})</span>
                          </div>
                          <span style={{ color: '#64748b' }}>
                            Size: {(file.size / 1024).toFixed(0)} KB • Ready for Vercel Blob upload
                          </span>
                        </>
                      ) : (
                        <>
                          <div style={{ fontWeight: 600, color: '#334155' }}>Current Photograph</div>
                          <span style={{ color: '#64748b' }}>Retained on save unless a new file is chosen</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  style={{ display: 'block', width: '100%', fontSize: '0.85rem', cursor: 'pointer' }}
                />
                <small style={{ display: 'block', color: '#64748b', marginTop: '.4rem', fontSize: '0.75rem' }}>
                  Supports JPG, PNG, WEBP, and GIF from device gallery or computer file picker.
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Pricing display</label>
                  <select
                    className="form-control"
                    value={draft.priceMode}
                    onChange={(e) => setField('priceMode', e.target.value as Draft['priceMode'])}
                  >
                    <option value="ENQUIRY_ONLY">Enquiry only</option>
                    <option value="FIXED">Fixed price</option>
                  </select>
                </div>
                {draft.priceMode === 'FIXED' && (
                  <div>
                    <label className="form-label">Actual price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="form-control"
                      placeholder="e.g. 3500"
                      value={draft.price}
                      onChange={(e) => setField('price', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Uploading & Saving…' : editing ? 'Save Changes' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
