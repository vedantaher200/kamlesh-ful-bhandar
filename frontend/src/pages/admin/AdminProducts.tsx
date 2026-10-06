import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Search,
  Tag,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { api, formatPrice } from '../../services/api';
import { Product, Category } from '../../types/index';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<string>('');
  const [isContactForPrice, setIsContactForPrice] = useState(false);
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState<'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'>('AVAILABLE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ availability: 'ALL' }),
        api.getCategories()
      ]);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) {
        setCategories(catRes.categories);
        if (catRes.categories.length > 0 && !categoryId) {
          setCategoryId(catRes.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setPrice('');
    setIsContactForPrice(false);
    setDescription('');
    setAvailability('AVAILABLE');
    setIsFeatured(false);
    setImage('');
    setImageFile(null);
    setImagePreview('');
    setWhatsappMessage('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setPrice(prod.price !== null && prod.price !== undefined ? String(prod.price) : '');
    setIsContactForPrice(prod.isContactForPrice);
    setDescription(prod.description);
    setAvailability(prod.availability);
    setIsFeatured(prod.isFeatured);
    setImage(prod.image);
    setImageFile(null);
    setImagePreview(prod.image);
    setWhatsappMessage(prod.whatsappMessage || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      let finalImageUrl = image;

      // If user selected a new file, upload to backend first!
      if (imageFile) {
        const uploadRes = await api.uploadImage(imageFile);
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      if (!finalImageUrl) {
        throw new Error('Please upload a product image or provide an image URL.');
      }

      const payload: Partial<Product> = {
        name,
        categoryId,
        price: isContactForPrice || price === '' ? null : parseFloat(price),
        isContactForPrice,
        description,
        availability,
        isFeatured,
        image: finalImageUrl,
        whatsappMessage: whatsappMessage || undefined
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        setSuccessMsg(`Product "${name}" updated successfully!`);
      } else {
        await api.createProduct(payload);
        setSuccessMsg(`Product "${name}" added to PostgreSQL database!`);
      }

      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}"?`)) {
      try {
        await api.deleteProduct(id);
        setSuccessMsg(`Product "${prodName}" deleted.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Product Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Add, update prices, upload photos, or change stock availability in real-time
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '220px', background: '#ffffff' }}>
          <Search size={18} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', background: '#ffffff', fontWeight: 600 }}
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* PRODUCTS TABLE */}
      {loading ? (
        <p>Loading products from PostgreSQL...</p>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{prod.slug}</div>
                  </td>
                  <td>{prod.category?.name || 'Uncategorized'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {formatPrice(prod.price, prod.isContactForPrice)}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background:
                          prod.availability === 'AVAILABLE'
                            ? '#dcfce7'
                            : prod.availability === 'OUT_OF_STOCK'
                            ? '#fee2e2'
                            : '#f1f5f9',
                        color:
                          prod.availability === 'AVAILABLE'
                            ? '#15803d'
                            : prod.availability === 'OUT_OF_STOCK'
                            ? '#b91c1c'
                            : '#64748b'
                      }}
                    >
                      {prod.availability}
                    </span>
                  </td>
                  <td>{prod.isFeatured ? '⭐ Yes' : 'No'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Delete Product"
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Wedding Haar"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Category *
                  </label>
                  <select
                    className="form-control"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8000"
                    disabled={isContactForPrice}
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.75rem' }}>
                  <input
                    type="checkbox"
                    id="contactForPrice"
                    checked={isContactForPrice}
                    onChange={(e) => setIsContactForPrice(e.target.checked)}
                  />
                  <label htmlFor="contactForPrice" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Mark "Contact for Price"
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Availability
                  </label>
                  <select
                    className="form-control"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="HIDDEN">Hidden from Customer</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.75rem' }}>
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <label htmlFor="isFeatured" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Feature on Homepage (⭐)
                  </label>
                </div>
              </div>

              {/* REAL PRODUCT IMAGE UPLOAD */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '1.5px dashed var(--color-cream-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-cream)' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Real Product Image (Upload File or Enter Image URL)
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>OR Enter URL:</span>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="form-control"
                    style={{ flex: 1, minWidth: '180px' }}
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                </div>
                {imagePreview && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ height: '90px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Fresh flower description, usage for wedding or puja..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Custom WhatsApp Inquire Message (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to use standard template"
                  className="form-control"
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving to Database...' : editingProduct ? 'Save Changes' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
