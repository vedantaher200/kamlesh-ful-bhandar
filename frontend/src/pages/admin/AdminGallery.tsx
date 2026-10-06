import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { GalleryImage } from '../../types/index';

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wedding');
  const [categoryName, setCategoryName] = useState('Wedding Decorations');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.getGallery(undefined, true);
      if (res.success) setImages(res.images);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalUrl = imageUrl;
      if (file) {
        const uploadRes = await api.uploadImage(file);
        if (uploadRes.success) finalUrl = uploadRes.url;
      }

      if (!finalUrl) {
        alert('Please choose an image file or provide an image URL.');
        setSaving(false);
        return;
      }

      await api.createGalleryImage({
        title,
        category,
        categoryName: categoryName || `${category} Decorations`,
        image: finalUrl,
        isPublished: true
      });

      setIsModalOpen(false);
      setTitle('');
      setImageUrl('');
      setFile(null);
      fetchGallery();
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (img: GalleryImage) => {
    try {
      await api.updateGalleryImage(img.id, { isPublished: !img.isPublished });
      fetchGallery();
    } catch (err: any) {
      alert(err.message || 'Failed to update image.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this gallery photo?')) {
      try {
        await api.deleteGalleryImage(id);
        fetchGallery();
      } catch (err: any) {
        alert(err.message || 'Failed to delete photo.');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Gallery Portfolio Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Upload real wedding and floral photos to showcase in the customer gallery
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Upload Real Photo</span>
        </button>
      </div>

      {loading ? (
        <p>Loading photos...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {images.map((img) => (
            <div key={img.id} style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', position: 'relative' }}>
                <img src={img.image} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  {img.category}
                </span>
              </div>
              <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>{img.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{img.categoryName}</p>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => handleTogglePublish(img)}
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: img.isPublished ? '#16a34a' : '#64748b' }}
                  >
                    {img.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{img.isPublished ? 'Published' : 'Hidden'}</span>
                  </button>
                  <button onClick={() => handleDelete(img.id)} style={{ color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Photo to Gallery</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Photo Title *</label>
                <input type="text" required placeholder="e.g. Royal Wedding Mandap with Red Roses" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Category *</label>
                  <select className="form-control" value={category} onChange={(e) => {
                    setCategory(e.target.value);
                    setCategoryName(`${e.target.value} Decorations`);
                  }}>
                    <option value="Wedding">Wedding</option>
                    <option value="Car">Car Decoration</option>
                    <option value="Flower">Flower Arrangements</option>
                    <option value="Bouquets">Bouquets</option>
                    <option value="Events">Events</option>
                    <option value="Traditional">Traditional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Display Category Label</label>
                  <input type="text" className="form-control" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1.5px dashed #cbd5e1', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  Upload Image File or Enter URL
                </label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} style={{ marginBottom: '0.5rem', display: 'block' }} />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Or enter Image URL:</span>
                <input type="text" placeholder="https://..." className="form-control" style={{ marginTop: '0.3rem' }} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Uploading...' : 'Save to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
