import React, { useEffect, useMemo, useState } from 'react';
import { Maximize2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { GalleryImage } from '../types';
import LightboxModal, { LightboxImageItem } from './LightboxModal';
import { GALLERY_CATEGORIES, isCustomerGalleryImage, resolveGalleryCategory } from '../utils/galleryCategories';

export default function RealCustomerGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  useEffect(() => { let active = true; api.getGallery().then((res) => { if (active && res.success) setImages(res.images.filter(isCustomerGalleryImage)); }).catch(() => undefined); return () => { active = false; }; }, []);
  const items = useMemo<LightboxImageItem[]>(() => images.map((image) => {
    const category = GALLERY_CATEGORIES.find((item) => item.key === resolveGalleryCategory(image))!;
    const fixed = image.priceMode === 'FIXED' && typeof image.price === 'number' && Number.isFinite(image.price);
    return { id: image.id, title: image.title, image: image.image, categoryLabel: category.label, subCategory: category.label, description: image.description, price: fixed ? image.price : null, priceText: fixed ? `₹${image.price!.toLocaleString('en-IN')}` : 'Price on Request' };
  }), [images]);
  const visible = activeTab === 'All' ? items : items.filter((item) => item.categoryLabel === activeTab);
  return <section id="our-work-gallery" className="section-padding" style={{ background: '#fff' }}><div className="container">
    <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 2.5rem' }}><div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: '#fef3c7', color: '#92400e', padding: '.35rem .85rem', borderRadius: 20, fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.75rem' }}><Sparkles size={14} />Shop Gallery</div><h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--color-primary-dark)', margin: '0 0 .5rem' }}>OUR WORK</h2><p style={{ color: 'var(--color-text-muted)', fontSize: '.95rem', margin: 0, lineHeight: 1.6 }}>Original photos of our flower shop services.</p></div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', marginBottom: '2rem' }}>{[{ key: 'All', label: 'All' }, ...GALLERY_CATEGORIES.map(({ key, label }) => ({ key: label, label }))].map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`filter-btn ${activeTab === tab.key ? 'active' : ''}`}>{tab.label}</button>)}</div>
    {visible.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Shop photos will appear here when published.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>{visible.map((item, index) => <button key={item.id} type="button" onClick={() => setLightboxIndex(index)} style={{ position: 'relative', border: 0, padding: 0, borderRadius: 14, overflow: 'hidden', aspectRatio: '4 / 3', cursor: 'pointer', background: '#f1f5f9', textAlign: 'left' }}><img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><span style={{ position: 'absolute', inset: 'auto 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', padding: '.8rem', color: '#fff', background: 'linear-gradient(transparent,rgba(0,0,0,.7))' }}><span>{item.title}</span><Maximize2 size={16} /></span></button>)}</div>}
  </div><LightboxModal items={visible} currentIndex={lightboxIndex ?? 0} isOpen={lightboxIndex !== null} onClose={() => setLightboxIndex(null)} onIndexChange={setLightboxIndex} /></section>;
}
