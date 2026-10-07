import React, { useEffect, useState } from 'react';
import {
  Car,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { CarDecorationPost } from '../../types/index';

export default function AdminCarDecorations() {
  const [posts, setPosts] = useState<CarDecorationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [status, setStatus] = useState<'PUBLISHED' | 'UNPUBLISHED'>('PUBLISHED');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getAllCarDecorationsAdmin(filterStatus === 'ALL' ? undefined : filterStatus);
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err: any) {
      console.error('Error fetching car decorations:', err);
      showNotice('error', err.message || 'Failed to load car decorations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterStatus]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingPostId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setStatus('PUBLISHED');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: CarDecorationPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setDescription(post.description || '');
    setPrice(post.price !== null && post.price !== undefined ? String(post.price) : '');
    setStatus(post.status);
    setImageUrl(post.image);
    setImageFile(null);
    setImagePreview(post.image);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotice('error', 'Please enter a title for the car decoration post.');
      return;
    }

    if (!editingPostId && !imageFile && !imageUrl.trim()) {
      showNotice('error', 'Please upload an image or provide an image URL.');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      let finalPublicId: string | undefined = undefined;

      // If a new file was chosen, upload it first
      if (imageFile) {
        const uploadRes = await api.uploadImage(imageFile);
        if (uploadRes.success) {
          finalImageUrl = uploadRes.url;
          finalPublicId = uploadRes.publicId;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const numPrice = price ? parseFloat(price) : null;
      const priceText = numPrice ? `₹${numPrice.toLocaleString('en-IN')}` : 'Price on Request';

      if (editingPostId) {
        // UPDATE EXISTING POST (CRITICAL: SAME RECORD ID, NEVER CREATE DUPLICATE)
        const updateRes = await api.updateCarDecoration(editingPostId, {
          title: title.trim(),
          description: description.trim() || null,
          price: numPrice,
          priceText,
          image: finalImageUrl,
          imagePublicId: finalPublicId,
          status
        });

        if (updateRes.success) {
          showNotice('success', `Post "${title}" updated successfully.`);
        }
      } else {
        // CREATE NEW POST
        const createRes = await api.createCarDecoration({
          title: title.trim(),
          description: description.trim() || null,
          price: numPrice,
          priceText,
          image: finalImageUrl,
          imagePublicId: finalPublicId,
          status
        });

        if (createRes.success) {
          showNotice('success', `Car decoration post published successfully.`);
        }
      }

      setIsModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      showNotice('error', err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: CarDecorationPost) => {
    try {
      const res = await api.toggleCarDecorationStatus(post.id);
      if (res.success) {
        showNotice('success', `Post is now ${res.post.status.toLowerCase()}.`);
        fetchPosts();
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (post: CarDecorationPost) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${post.title}"?`)) {
      return;
    }

    try {
      const res = await api.deleteCarDecoration(post.id);
      if (res.success) {
        showNotice('success', 'Car decoration post deleted permanently.');
        fetchPosts();
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete post.');
    }
  };

  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const unpublishedCount = posts.filter((p) => p.status === 'UNPUBLISHED').length;

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Car size={26} color="var(--color-gold, #f59e0b)" />
            Car Decoration Posts
          </h1>
          <p className="admin-page-subtitle">
            Create, edit, publish and unpublish car decoration designs. Published posts appear immediately on the customer website.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Car Decoration Post</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: notification.type === 'success' ? '#065f46' : '#991b1b',
            border: notification.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      {/* Stats Bar & Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          background: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Total Posts</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              {posts.length}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase' }}>Published</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>
              {publishedCount}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>Unpublished</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b' }}>
              {unpublishedCount}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Filter:</span>
          {['ALL', 'PUBLISHED', 'UNPUBLISHED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: filterStatus === st ? 700 : 500,
                background: filterStatus === st ? 'var(--color-primary-dark)' : '#f1f5f9',
                color: filterStatus === st ? '#ffffff' : '#334155',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
          Loading car decoration posts...
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px dashed #cbd5e1'
          }}
        >
          <Car size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#334155', margin: '0 0 0.5rem' }}>
            No Car Decoration Posts Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
            Add your first car decoration post to publish it to the customer website.
          </p>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add Car Decoration Post</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Image Preview with Status Badge */}
              <div style={{ position: 'relative', height: '190px', backgroundColor: '#f1f5f9' }}>
                <img
                  src={post.image}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: post.status === 'PUBLISHED' ? '#ecfdf5' : '#f1f5f9',
                    color: post.status === 'PUBLISHED' ? '#047857' : '#64748b',
                    border: post.status === 'PUBLISHED' ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                  }}
                >
                  {post.status}
                </span>

                {post.price && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 19, 0.85)',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px'
                    }}
                  >
                    ₹{post.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    color: 'var(--color-primary-dark)',
                    margin: '0 0 0.35rem',
                    fontFamily: 'var(--font-serif)'
                  }}
                >
                  {post.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    margin: '0 0 1rem',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {post.description || 'No description provided.'}
                </p>

                {/* Actions */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(post)}
                    style={{
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: post.status === 'PUBLISHED' ? '#047857' : '#64748b',
                      cursor: 'pointer'
                    }}
                    title={post.status === 'PUBLISHED' ? 'Click to unpublish' : 'Click to publish'}
                  >
                    {post.status === 'PUBLISHED' ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(post)}
                      className="btn-icon"
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        cursor: 'pointer'
                      }}
                      title="Edit this post (same ID)"
                    >
                      <Edit2 size={15} color="#0284c7" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      className="btn-icon"
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        cursor: 'pointer'
                      }}
                      title="Delete post permanently"
                    >
                      <Trash2 size={15} color="#dc2626" />
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
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.75rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: 0, fontFamily: 'var(--font-serif)' }}>
                  {editingPostId ? 'Edit Car Decoration Post' : 'Add New Car Decoration Post'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                  {editingPostId
                    ? 'Updating existing database record (Same ID, no duplicate created).'
                    : 'Create and publish directly to the customer website.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Title * (e.g. BMW Flower Decoration, Thar Red Rose Decor)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. BMW Flower Decoration"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Description (e.g. Beautiful flower decoration for wedding car.)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe floral elements, suitable occasion, and decoration highlights..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              {/* Price & Status Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 5000"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Leave blank for Price on Request</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Publish Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="PUBLISHED">Published (Visible to users)</option>
                    <option value="UNPUBLISHED">Unpublished (Hidden from users)</option>
                  </select>
                </div>
              </div>

              {/* Image Upload / URL */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Exact Car Decoration Image *
                </label>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <label
                    style={{
                      padding: '0.55rem 0.95rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Upload size={16} />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>or paste URL below</span>
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://... or /uploads/..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    marginBottom: '0.65rem'
                  }}
                />

                {/* Preview Thumbnail */}
                {imagePreview && (
                  <div
                    style={{
                      height: '140px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Selected Preview"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}
                >
                  {saving
                    ? 'Saving...'
                    : editingPostId
                    ? 'Save Changes'
                    : status === 'PUBLISHED'
                    ? 'Publish to Website'
                    : 'Save as Unpublished'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
