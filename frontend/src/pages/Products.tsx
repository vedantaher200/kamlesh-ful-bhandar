import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MessageCircle, ArrowRight, ArrowUpDown, Sparkles, ImageOff } from 'lucide-react';
import { api, formatPrice } from '../services/api';
import { Product, Category } from '../types/index';
import WhatsAppBookingModal from '../components/WhatsAppBookingModal';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Booking Modal
  const [selectedProductForBooking, setSelectedProductForBooking] = useState<Product | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

  const loadProducts = async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: 18,
        sort: sortBy
      };
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (availabilityFilter !== 'ALL') params.availability = availabilityFilter;

      const res = await api.getProducts(params);
      if (res.success) {
        if (append) {
          setProducts((prev) => [...prev, ...res.products]);
        } else {
          setProducts(res.products);
        }
        setTotalProducts(res.total || res.count);
        setHasMore((res.page || 1) < (res.totalPages || 1));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const delayDebounce = setTimeout(() => {
      loadProducts(1, false);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [activeCategory, searchTerm, availabilityFilter, sortBy]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, true);
  };

  const handleCategoryClick = (slug: string) => {
    if (slug === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const openBookModal = (prod: Product) => {
    setSelectedProductForBooking(prod);
    setIsBookingModalOpen(true);
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)', minHeight: '85vh', background: 'var(--color-cream-light, #faf8f5)' }}>
      <div className="container">
        {/* CATALOGUE HEADER */}
        <div className="section-header" style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <span className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> Kamlesh Ful Bhandar • Real Product Catalogue
          </span>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', margin: '0.4rem 0' }}>
            Flowers, Garlands & Car Decors
          </h1>
          <p className="section-description" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
            Handcrafted fresh blooms, wedding varmalas, car styling, and bouquets directly from our shop in Pawan Nagar, Nashik.
          </p>
        </div>

        {/* SEARCH, SORT & AVAILABILITY BAR */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            border: '1px solid var(--color-cream-border)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div className="search-input-wrap" style={{ flex: 2, minWidth: '220px' }}>
              <Search size={18} color="var(--color-primary)" />
              <input
                type="text"
                placeholder="Search products by name, flowers (e.g. rose, mogra, haar, car)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Availability Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} color="var(--color-text-muted)" />
              <select
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-cream-border)',
                  background: 'var(--color-cream)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-dark)'
                }}
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="ALL">All Items</option>
                <option value="AVAILABLE">Available Now</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowUpDown size={15} color="var(--color-text-muted)" />
              <select
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-cream-border)',
                  background: 'var(--color-cream)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-dark)'
                }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured First</option>
                <option value="latest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* CATEGORY PILLS BAR (Meesho-style quick pill navigation) */}
          <div
            className="category-pills-bar"
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none'
            }}
          >
            <button
              className={`cat-pill-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('All')}
              style={{ whiteSpace: 'nowrap' }}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill-btn ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.slug)}
                style={{ whiteSpace: 'nowrap' }}
              >
                {cat.name} {cat._count ? `(${cat._count.products})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Showing {products.length} {totalProducts > products.length ? `of ${totalProducts}` : ''} items
            {activeCategory !== 'All' ? ` in "${categories.find((c) => c.slug === activeCategory)?.name || activeCategory}"` : ''}
          </span>
          {activeCategory === 'haar-mala' && (
            <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
              🌸 Dedicated Haar & Mala Collection
            </span>
          )}
        </div>

        {/* PRODUCTS GRID (2 columns on mobile, 3-4 on desktop) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 600 }}>Loading fresh flowers from shop database...</div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-cream-border)', margin: '2rem 0' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
              No Products Found
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              We could not find items matching your search or selected category filter.
            </p>
            <button onClick={() => { setSearchTerm(''); handleCategoryClick('All'); setAvailabilityFilter('ALL'); }} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '3rem'
              }}
            >
              {products.map((prod) => {
                const isAvailable = prod.availability === 'AVAILABLE';
                return (
                  <div
                    key={prod.id}
                    className="product-card"
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-cream-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Image wrap with aspect ratio */}
                    <Link
                      to={`/products/${prod.slug || prod.id}`}
                      style={{ position: 'relative', display: 'block', height: '220px', background: '#f1f5f9', overflow: 'hidden' }}
                    >
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <ImageOff size={32} />
                          <span style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>Photo Upload Pending</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {prod.category && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            background: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(4px)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--color-primary-dark)'
                          }}
                        >
                          {prod.category.name}
                        </span>
                      )}

                      {/* Stock Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: isAvailable ? 'rgba(22, 163, 74, 0.9)' : 'rgba(220, 38, 38, 0.9)',
                          color: '#ffffff'
                        }}
                      >
                        {isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </Link>

                    {/* Body */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Link to={`/products/${prod.slug || prod.id}`} style={{ textDecoration: 'none' }}>
                        <h3
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.15rem',
                            color: 'var(--color-primary-dark)',
                            margin: '0 0 0.35rem',
                            lineHeight: 1.3
                          }}
                        >
                          {prod.name}
                        </h3>
                      </Link>

                      {/* Specifications Preview (if available) */}
                      {(prod.length || prod.flowerType || prod.color) && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {prod.length && <span style={{ background: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>📏 {prod.length}</span>}
                          {prod.flowerType && <span style={{ background: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>🌿 {prod.flowerType.split('+')[0]}</span>}
                        </div>
                      )}

                      <p
                        style={{
                          fontSize: '0.825rem',
                          color: 'var(--color-text-muted)',
                          margin: '0 0 0.75rem',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {prod.shortDescription || prod.description}
                      </p>

                      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <div
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            color: 'var(--color-primary-dark)',
                            marginBottom: '0.75rem'
                          }}
                        >
                          {formatPrice(prod.price, prod.isContactForPrice, prod.priceType)}
                        </div>

                        {/* Card Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            onClick={() => openBookModal(prod)}
                            className="btn btn-whatsapp btn-sm"
                            style={{ padding: '0.55rem 0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </button>

                          <Link
                            to={`/products/${prod.slug || prod.id}`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.55rem 0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}
                          >
                            <span>Details</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <button
                  onClick={handleLoadMore}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 2.5rem', fontWeight: 600 }}
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* WHATSAPP BOOKING MODAL */}
      <WhatsAppBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        product={selectedProductForBooking}
      />
    </div>
  );
}
