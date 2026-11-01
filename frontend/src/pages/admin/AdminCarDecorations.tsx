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
  ExternalLink,
  RotateCcw,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { CarDecorationPost } from '../../types/index';
import SafeCarImage from '../../components/SafeCarImage';


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
  const [originalImage, setOriginalImage] = useState<string>('');
  const [originalPublicId, setOriginalPublicId] = useState<string | null>(null);
  const [imageAction, setImageAction] = useState<'KEEP' | 'REPLACE' | 'REMOVE'>('KEEP');

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
    setTimeout(() => setNotification(null), 4000);
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
    setOriginalImage('');
    setOriginalPublicId(null);
    setImageAction('REPLACE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: CarDecorationPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setDescription(post.description || '');
    setPrice(post.price !== null && post.price !== undefined ? String(post.price) : '');
    setStatus(post.status);
    setImageUrl(post.image || '');
    setImageFile(null);
    setImagePreview(post.image || '');
    setOriginalImage(post.image || '');
    setOriginalPublicId(post.imagePublicId || null);
    setImageAction('KEEP');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageAction('REPLACE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotice('error', 'Please enter a title for the car decoration post.');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUrl.trim();
      let finalPublicId: string | undefined = undefined;

      if (editingPostId) {
        // --- 1. EDIT EXISTING POST (GUARANTEES SAME RECORD ID, NEVER DUPLICATES) ---
        if (imageAction === 'REMOVE') {
          finalImageUrl = '';
          finalPublicId = undefined;
        } else if (imageAction === 'REPLACE') {
          if (imageFile) {
            try {
              const uploadRes = await api.uploadImage(imageFile);
              if (uploadRes.success) {
                finalImageUrl = uploadRes.url;
                finalPublicId = uploadRes.publicId;
              } else {
                throw new Error(uploadRes.message || 'Image upload failed.');
              }
            } catch (uploadErr: any) {
              setSaving(false);
              showNotice(
                'error',
                `Image upload failed: ${uploadErr.message || 'Storage unavailable'}. Your existing post and photograph remain unchanged. You can also paste an image URL instead.`
              );
              return;
            }
          } else if (imageUrl.trim()) {
            finalImageUrl = imageUrl.trim();
            finalPublicId = undefined;
          } else {
            finalImageUrl = '';
            finalPublicId = undefined;
          }
        } else {
          // KEEP existing photograph
          finalImageUrl = originalImage;
          finalPublicId = originalPublicId || undefined;
        }

        const numPrice = price ? parseFloat(price) : null;
        const priceText = numPrice ? `₹${numPrice.toLocaleString('en-IN')}` : 'Price on Request';

        // Direct HTTP PUT to existing record ID
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
          showNotice('success', 'Changes saved successfully.');
          setIsModalOpen(false);
          await fetchPosts();
        } else {
          throw new Error(updateRes.message || 'Failed to update post.');
        }
      } else {
        // --- 2. CREATE BRAND NEW POST ---
        if (!imageFile && !imageUrl.trim()) {
          showNotice('error', 'Please upload an image or provide an image URL for the new post.');
          setSaving(false);
          return;
        }

        if (imageFile) {
          try {
            const uploadRes = await api.uploadImage(imageFile);
            if (uploadRes.success) {
              finalImageUrl = uploadRes.url;
              finalPublicId = uploadRes.publicId;
            } else {
              throw new Error(uploadRes.message || 'Image upload failed.');
            }
          } catch (uploadErr: any) {
            setSaving(false);
            showNotice(
              'error',
              `Image upload failed: ${uploadErr.message || 'Storage unavailable'}. Set Cloudinary variables in Vercel or paste a direct image URL.`
            );
            return;
          }
        }

        const numPrice = price ? parseFloat(price) : null;
        const priceText = numPrice ? `₹${numPrice.toLocaleString('en-IN')}` : 'Price on Request';

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
          showNotice('success', 'Car decoration post published successfully.');
          setIsModalOpen(false);
          await fetchPosts();
        } else {
          throw new Error(createRes.message || 'Failed to create post.');
        }
      }
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
                <SafeCarImage
                  src={post.image}
                  alt={post.title}
                  height="190px"
                  showZoomBadge={false}
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
              {/* ID Preservation Badge when editing */}
              {editingPostId && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    fontSize: '0.8rem',
                    color: '#166534'
                  }}
                >
                  <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Editing Database Record:</strong> <code style={{ fontSize: '0.75rem', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{editingPostId}</code>
                    <div style={{ fontSize: '0.73rem', color: '#15803d', marginTop: '0.15rem' }}>
                      Updates existing record in-place. Database ID and post count are preserved.
                    </div>
                  </div>
                </div>
              )}

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
                    <option value="PUBLISHED">Published (Visible to customers)</option>
                    <option value="UNPUBLISHED">Unpublished (Hidden from customers)</option>
                  </select>
                </div>
              </div>

              {/* Photograph Management Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Car Decoration Photograph
                </label>

                {editingPostId ? (
                  /* EDIT MODE IMAGE CONTROLS */
                  <div>
                    {imageAction === 'KEEP' && (
                      <div
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          background: '#f8fafc',
                          marginBottom: '0.6rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Current Photograph
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#047857', background: '#d1fae5', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                            Retained on Save
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                          <div style={{ width: '85px', height: '65px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {originalImage ? (
                              <img
                                src={originalImage}
                                alt={title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as any).src =
                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="85" height="65"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10">No Image</text></svg>';
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', padding: '0.2rem' }}>
                                Neutral Placeholder
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setImageAction('REPLACE');
                                  setImageUrl('');
                                  setImageFile(null);
                                  setImagePreview('');
                                }}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid #0284c7',
                                  background: '#f0f9ff',
                                  color: '#0284c7',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <Upload size={13} />
                                <span>Replace Photograph</span>
                              </button>

                              {originalImage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImageAction('REMOVE');
                                    setImageUrl('');
                                    setImageFile(null);
                                    setImagePreview('');
                                  }}
                                  style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid #fecaca',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                  }}
                                >
                                  <Trash2 size={13} />
                                  <span>Remove Current Image</span>
                                </button>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {originalImage
                                ? 'Click Replace to upload a new photograph or paste an image URL.'
                                : 'No photo currently set. The public website displays a clean neutral placeholder.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {imageAction === 'REMOVE' && (
                      <div
                        style={{
                          border: '1px dashed #f87171',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          background: '#fff5f5',
                          marginBottom: '0.6rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <AlertCircle size={15} />
                            Photograph Marked for Removal
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageAction('KEEP');
                              setImageUrl(originalImage);
                              setImagePreview(originalImage);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284c7',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <RotateCcw size={12} />
                            Undo / Keep Previous Image
                          </button>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#7f1d1d', margin: 0 }}>
                          Upon saving, this post will have no photo. The customer website will automatically display an elegant neutral placeholder.
                        </p>
                      </div>
                    )}

                    {imageAction === 'REPLACE' && (
                      <div
                        style={{
                          border: '1px solid #bae6fd',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          background: '#f0f9ff',
                          marginBottom: '0.6rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Upload size={14} />
                            Select Replacement Image
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageAction('KEEP');
                              setImageUrl(originalImage);
                              setImageFile(null);
                              setImagePreview(originalImage);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <RotateCcw size={12} />
                            Revert to Original
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Upload size={14} />
                            <span>Upload Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>

                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>or paste direct image URL below</span>
                        </div>

                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          placeholder="https://... direct image URL"
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            marginBottom: '0.5rem'
                          }}
                        />

                        {imagePreview && (
                          <div
                            style={{
                              position: 'relative',
                              height: '130px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #93c5fd',
                              background: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: '6px',
                                left: '6px',
                                background: 'rgba(2, 132, 199, 0.92)',
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px'
                              }}
                            >
                              {imageFile ? 'New File Selected (Preview)' : 'URL Preview'}
                            </span>
                            <img
                              src={imagePreview}
                              alt="Replacement Preview"
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* CREATE NEW POST IMAGE CONTROLS */
                  <div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label
                        style={{
                          padding: '0.5rem 0.95rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#334155',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Upload size={15} />
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
                      placeholder="https://... direct image URL"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem'
                      }}
                    />

                    {imagePreview && (
                      <div
                        style={{
                          position: 'relative',
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
