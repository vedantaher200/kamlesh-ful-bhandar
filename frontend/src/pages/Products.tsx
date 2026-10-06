import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { api, createWhatsAppUrl, formatPrice } from '../services/api';
import { Product, Category } from '../types/index';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (activeCategory !== 'All') params.category = activeCategory;
        if (searchTerm) params.search = searchTerm;
        if (availabilityFilter !== 'ALL') params.availability = availabilityFilter;

        const res = await api.getProducts(params);
        if (res.success) setProducts(res.products);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [activeCategory, searchTerm, availabilityFilter]);

  const handleCategoryClick = (slug: string) => {
    if (slug === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '80vh' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">Fresh Floral Catalogue</span>
          <h1 className="section-title">Flowers, Garlands & Car Decors</h1>
          <p className="section-description">
            Explore our complete selection of fresh blooms, wedding varmalas, car styling, and celebration bouquets in Nashik.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="filter-search-container">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input-wrap" style={{ flex: 1, minWidth: '240px' }}>
              <Search size={18} color="var(--color-primary)" />
              <input
                type="text"
                placeholder="Search products by name or floral type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Filter size={16} color="var(--color-text-muted)" />
              <select
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-cream-border)',
                  background: 'var(--color-cream)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-dark)'
                }}
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="ALL">All Items</option>
                <option value="AVAILABLE">Available Only</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* CATEGORY PILLS */}
          <div className="category-pills-bar">
            <button
              className={`cat-pill-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('All')}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill-btn ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.name} {cat._count ? `(${cat._count.products})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Loading products from database...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: '#ffffff', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
              No Products Found
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Try adjusting your search query or selected category filter.
            </p>
            <button onClick={() => { setSearchTerm(''); handleCategoryClick('All'); }} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="products-grid" style={{ marginBottom: '5rem' }}>
            {products.map((prod) => (
              <div key={prod.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={prod.image} alt={prod.name} loading="lazy" />
                  {prod.category && <span className="product-badge-cat">{prod.category.name}</span>}
                  <span
                    className={`product-badge-stock ${
                      prod.availability === 'AVAILABLE' ? 'badge-available' : 'badge-out-of-stock'
                    }`}
                  >
                    {prod.availability === 'AVAILABLE' ? 'Available' : 'Currently Unavailable'}
                  </span>
                </div>

                <div className="product-body">
                  <h3 className="product-name">{prod.name}</h3>
                  <p className="product-desc">{prod.description}</p>
                  <div className="product-price">
                    {formatPrice(prod.price, prod.isContactForPrice)}
                  </div>

                  <div className="product-actions">
                    <a
                      href={createWhatsAppUrl(
                        prod.whatsappMessage ||
                          `Hello Kamlesh Ful Bhandar, I am interested in: ${prod.name} (${formatPrice(prod.price, prod.isContactForPrice)}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ flex: 1 }}
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp</span>
                    </a>
                    <Link to={`/products/${prod.slug || prod.id}`} className="btn btn-outline btn-sm">
                      <span>Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
