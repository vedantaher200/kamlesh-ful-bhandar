import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Search,
  Camera,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { api, formatPrice } from '../../services/api';
import { Product, Category } from '../../types/index';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [priceType, setPriceType] = useState<'FIXED' | 'STARTING_FROM' | 'CONTACT_FOR_PRICE'>('FIXED');
  const [isContactForPrice, setIsContactForPrice] = useState(false);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [availability, setAvailability] = useState<'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN'>('AVAILABLE');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Specifications
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [flowerType, setFlowerType] = useState('');
  const [color, setColor] = useState('');
  const [suitableFor, setSuitableFor] = useState('');

  // Primary image
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // Additional images
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ availability: 'ALL', includeUnpublished: true }),
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
    setSubcategory('');
    setPrice('');
    setPriceType('FIXED');
    setIsContactForPrice(false);
    setDescription('');
    setShortDescription('');
    setAvailability('AVAILABLE');
    setIsPublished(true);
    setIsFeatured(false);
    setLength('');
    setWidth('');
    setFlowerType('');
    setColor('');
    setSuitableFor('');
    setImage('');
    setImageFile(null);
    setImagePreview('');
    setAdditionalFiles([]);
    setAdditionalPreviews([]);
    setExistingImages([]);
    setWhatsappMessage('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setSubcategory(prod.subcategory || '');
    setPrice(prod.price !== null && prod.price !== undefined ? String(prod.price) : '');
    setPriceType(prod.priceType || (prod.isContactForPrice ? 'CONTACT_FOR_PRICE' : 'FIXED'));
    setIsContactForPrice(prod.isContactForPrice || prod.priceType === 'CONTACT_FOR_PRICE');
    setDescription(prod.description);
    setShortDescription(prod.shortDescription || '');
    setAvailability(prod.availability);
    setIsPublished(prod.isPublished !== undefined ? prod.isPublished : true);
    setIsFeatured(prod.isFeatured);
    setLength(prod.length || '');
    setWidth(prod.width || '');
    setFlowerType(prod.flowerType || '');
    setColor(prod.color || '');
    setSuitableFor(prod.suitableFor || '');
    setImage(prod.image);
    setImageFile(null);
    setImagePreview(prod.image);

    const extra = (prod.images || []).map((img) => img.url).filter((u) => u !== prod.image);
    setExistingImages(extra);
    setAdditionalFiles([]);
    setAdditionalPreviews([]);

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

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeAdditionalFile = (idx: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== idx));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      let finalImageUrl = image;

      // Upload primary image if file selected
      if (imageFile) {
        const uploadRes = await api.uploadImage(imageFile);
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          throw new Error('Primary image upload failed.');
        }
      }

      if (!finalImageUrl) {
        throw new Error('Please upload a product photo or specify an image URL.');
      }

      // Upload additional files if any
      const uploadedAdditionalUrls: string[] = [...existingImages];
      for (const file of additionalFiles) {
        const uploadRes = await api.uploadImage(file);
        if (uploadRes.success && uploadRes.url) {
          uploadedAdditionalUrls.push(uploadRes.url);
        }
      }

      const allImagesList = [finalImageUrl, ...uploadedAdditionalUrls.filter((u) => u !== finalImageUrl)];

      const contactForPrice = isContactForPrice || priceType === 'CONTACT_FOR_PRICE';
      const parsedPrice = contactForPrice || price === '' ? null : parseFloat(price);

      const payload: any = {
        name: name.trim(),
        categoryId,
        subcategory: subcategory.trim() || undefined,
        price: parsedPrice,
        priceType,
        isContactForPrice: contactForPrice,
        description: description.trim(),
        shortDescription: shortDescription.trim() || undefined,
        availability,
        isPublished,
        isFeatured,
        length: length.trim() || undefined,
        width: width.trim() || undefined,
        flowerType: flowerType.trim() || undefined,
        color: color.trim() || undefined,
        suitableFor: suitableFor.trim() || undefined,
        image: finalImageUrl,
        images: allImagesList,
        whatsappMessage: whatsappMessage.trim() || undefined
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

  const handleTogglePublished = async (prod: Product) => {
    try {
      const nextStatus = prod.isPublished === false ? true : false;
      await api.updateProduct(prod.id, { isPublished: nextStatus });
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, isPublished: nextStatus } : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleToggleStock = async (prod: Product) => {
    try {
      const nextAvail = prod.availability === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
      await api.updateProduct(prod.id, { availability: nextAvail });
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, availability: nextAvail } : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle stock.');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${prodName}"?`)) {
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
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.flowerType && p.flowerType.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCat === 'ALL' || p.categoryId === selectedCat;

    let matchesStatus = true;
    if (statusFilter === 'AVAILABLE') matchesStatus = p.availability === 'AVAILABLE';
    if (statusFilter === 'OUT_OF_STOCK') matchesStatus = p.availability === 'OUT_OF_STOCK';
    if (statusFilter === 'PUBLISHED') matchesStatus = p.isPublished !== false;
    if (statusFilter === 'DRAFT') matchesStatus = p.isPublished === false;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div>
      {/* HEADER WITH PROMINENT ACTION BUTTON */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Real-Time Product Catalogue
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Upload real photos directly from mobile/tablet. Real-time updates reflect instantly on customer website.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
          <PlusCircle size={18} />
          <span>+ Add New Product</span>
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
            placeholder="Search products by name or flower type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft / Hidden</option>
        </select>
      </div>

      {/* PRODUCTS LIST */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading products from database...</p>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <h4>No products found matching filters</h4>
        </div>
      ) : (
        <div className="admin-table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '750px' }}>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const isAvail = prod.availability === 'AVAILABLE';
                const isPub = prod.isPublished !== false;
                return (
                  <tr key={prod.id}>
                    <td style={{ width: '70px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {prod.flowerType ? `🌿 ${prod.flowerType}` : ''}
                        {prod.length ? ` • 📏 ${prod.length}` : ''}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {prod.category?.name || 'Uncategorized'}
                      </span>
                      {prod.subcategory && (
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{prod.subcategory}</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                      {formatPrice(prod.price, prod.isContactForPrice, prod.priceType)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStock(prod)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: isAvail ? '#dcfce7' : '#fee2e2',
                          color: isAvail ? '#15803d' : '#b91c1c'
                        }}
                        title="Click to toggle stock availability"
                      >
                        {isAvail ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublished(prod)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: isPub ? '#e0f2fe' : '#f1f5f9',
                          color: isPub ? '#0284c7' : '#64748b'
                        }}
                        title="Click to toggle published / draft"
                      >
                        {isPub ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK ADD / EDIT MODAL (MOBILE-FRIENDLY) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
          >
            <div className="modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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
              {/* PRIMARY PHOTO UPLOAD (CAMERA & GALLERY READY) */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '2px dashed var(--color-cream-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-cream)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                  Main Product Photo * (Select from phone camera/gallery)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>OR URL:</span>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="form-control"
                    style={{ flex: 1, minWidth: '160px', fontSize: '0.85rem' }}
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
                      style={{ height: '100px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                )}
              </div>

              {/* ADDITIONAL PHOTOS (MULTI-IMAGE GALLERY) */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Additional Photos (Optional - for swipeable gallery)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAdditionalFilesChange}
                  style={{ fontSize: '0.85rem' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {existingImages.map((imgUrl, i) => (
                    <div key={`exist-${i}`} style={{ position: 'relative' }}>
                      <img src={imgUrl} alt="Existing" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {additionalPreviews.map((prevUrl, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative' }}>
                      <img src={prevUrl} alt="New" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '2px solid var(--color-primary)' }} />
                      <button
                        type="button"
                        onClick={() => removeAdditionalFile(i)}
                        style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BASIC DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Wedding Varmala"
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
                    Subcategory (e.g. Groom Haar, Varmala, Car Decor)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding Haar"
                    className="form-control"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Price Type
                  </label>
                  <select
                    className="form-control"
                    value={priceType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPriceType(val);
                      if (val === 'CONTACT_FOR_PRICE') {
                        setIsContactForPrice(true);
                        setPrice('');
                      } else {
                        setIsContactForPrice(false);
                      }
                    }}
                  >
                    <option value="FIXED">Fixed Price (₹)</option>
                    <option value="STARTING_FROM">Starting From (₹)</option>
                    <option value="CONTACT_FOR_PRICE">Contact for Price</option>
                  </select>
                </div>

                {priceType !== 'CONTACT_FOR_PRICE' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 8000"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Stock Availability
                  </label>
                  <select
                    className="form-control"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                  >
                    <option value="AVAILABLE">Available (In Stock)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="HIDDEN">Hidden from Customer</option>
                  </select>
                </div>
              </div>

              {/* SPECIFICATIONS SECTION */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>
                  Specifications (Optional)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                      Flower Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rose + Mogra"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={flowerType}
                      onChange={(e) => setFlowerType(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                      Length
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 90 cm"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                      Width / Diameter
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7 cm"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                      Color Combination
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Red + White"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                      Suitable For
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wedding / Varmala"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={suitableFor}
                      onChange={(e) => setSuitableFor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTIONS */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Full Description
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Fresh flower description, usage notes, quality details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Short Card Summary (Optional)
                </label>
                <input
                  type="text"
                  placeholder="One sentence summary for product card"
                  className="form-control"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              {/* TOGGLES: PUBLISHED & FEATURED */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  <span>Publish to Customer Website</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span>Feature on Homepage (⭐)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {saving ? 'Saving to Database...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
