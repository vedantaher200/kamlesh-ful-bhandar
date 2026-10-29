import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { GalleryImage } from '../types';
import LightboxModal, { LightboxImageItem } from '../components/LightboxModal';
import CarDecorationEnquiryButton from '../components/CarDecorationEnquiryButton';
import { GALLERY_CATEGORIES, isCustomerGalleryImage, resolveGalleryCategory } from '../utils/galleryCategories';

export default function Gallery() {
  const [dbImages, setDbImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.getGallery().then((res) => { if (active && res.success) setDbImages(res.images.filter(isCustomerGalleryImage)); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Gallery could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const items = useMemo<LightboxImageItem[]>(() => dbImages.map((image) => {
    const key = resolveGalleryCategory(image)!;
    const categoryLabel = GALLERY_CATEGORIES.find((category) => category.key === key)!.label;
    const fixed = image.priceMode === 'FIXED' && typeof image.price === 'number' && Number.isFinite(image.price);
    return { id: image.id, title: image.title, image: image.image, categoryLabel, subCategory: categoryLabel, altText: image.title, description: image.description, price: fixed ? image.price : null, priceText: fixed ? `₹${image.price!.toLocaleString('en-IN')}` : 'Price on Request' };
  }), [dbImages]);
  const filteredItems = useMemo(() => selectedCategory === 'All' ? items : items.filter((item) => item.subCategory === selectedCategory), [items, selectedCategory]);
  const openAt = (idx: number) => setActiveIndex(idx);

  return <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}><div className="container">
    <div className="section-header"><span className="section-tag">Shop Gallery</span><h1 className="section-title">Flower Shop Gallery</h1><p className="section-description">Browse our car decorations, flower garlands, wedding varmalas, and custom orders.</p></div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
      {[{ key: 'All', label: 'All Services' }, ...GALLERY_CATEGORIES.map(({ key, label }) => ({ key: label, label }))].map((cat) => <button key={cat.key} type="button" className={`filter-btn ${selectedCategory === cat.key ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.key)} style={{ padding: '.5rem 1.15rem', borderRadius: 25, fontSize: '.86rem', fontWeight: selectedCategory === cat.key ? 700 : 500, cursor: 'pointer', border: selectedCategory === cat.key ? '1px solid var(--color-primary-dark)' : '1px solid #e2e8f0', background: selectedCategory === cat.key ? 'var(--color-primary-dark)' : '#fff', color: selectedCategory === cat.key ? '#fff' : '#334155' }}>{cat.label}</button>)}
    </div>
    {loading ? <p style={{ textAlign: 'center', padding: '3rem' }}>Loading gallery…</p> : error ? <p role="alert" style={{ textAlign: 'center', padding: '3rem', color: '#b91c1c' }}>{error}</p> : filteredItems.length === 0 ? <p style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>No published shop photos in this category yet.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
      {filteredItems.map((item, index) => <article key={item.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column' }}>
        <button type="button" aria-label={`View ${item.title}`} onClick={() => openAt(index)} style={{ position: 'relative', height: 240, padding: 0, border: 0, cursor: 'pointer', background: '#f1f5f9' }}><img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><span style={{ position: 'absolute', left: 12, bottom: 12, background: 'rgba(255,255,255,.95)', color: 'var(--color-primary-dark)', padding: '.2rem .55rem', borderRadius: 12, fontSize: '.72rem', fontWeight: 700 }}>{item.categoryLabel}</span></button>
        <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}><h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-primary-dark)', margin: '0 0 .35rem' }}>{item.title}</h3>{item.description && <p style={{ color: '#64748b', fontSize: '.86rem', lineHeight: 1.5, margin: '0 0 .75rem' }}>{item.description}</p>}
          <div style={{ marginTop: 'auto', paddingTop: '.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}><span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{item.priceText}</span><CarDecorationEnquiryButton item={{ id: item.id, title: item.title, image: item.image, description: item.description, price: item.price }} serviceLabel={item.categoryLabel || 'Flower shop'} compact style={{ padding: '.45rem .8rem', fontSize: '.8rem' }} /></div>
        </div>
      </article>)}
    </div>}
  </div><LightboxModal items={filteredItems} currentIndex={activeIndex ?? 0} isOpen={activeIndex !== null} onClose={() => setActiveIndex(null)} onIndexChange={setActiveIndex} /></div>;
}
