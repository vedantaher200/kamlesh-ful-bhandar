import { GalleryImage } from '../types';

export const GALLERY_CATEGORIES = [
  { key: 'CAR_DECORATION', label: 'Car Decoration' },
  { key: 'CAR_BUS_GARLANDS', label: 'Car & Bus Flower Garlands' },
  { key: 'WEDDING_VARMALA', label: 'Wedding & Varmala' },
  { key: 'GARLANDS_CUSTOM', label: 'Flower Garlands & Custom Orders' }
] as const;

export type GalleryCategoryKey = (typeof GALLERY_CATEGORIES)[number]['key'];

const normalize = (value: string) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ');

export function resolveGalleryCategory(image: Partial<GalleryImage>): GalleryCategoryKey {
  // Direct key or label match
  const cat = (image.category || '').trim();
  const catName = (image.categoryName || '').trim();

  for (const item of GALLERY_CATEGORIES) {
    if (cat === item.key || cat === item.label || catName === item.label) {
      return item.key;
    }
  }

  const raw = normalize(`${cat} ${catName} ${image.title || ''} ${image.description || ''}`);
  if (raw.includes('car bus') || raw.includes('bus garland') || raw.includes('bus flower') || raw.includes('truck') || raw.includes('bus')) {
    return 'CAR_BUS_GARLANDS';
  }
  if (raw.includes('car') || raw.includes('vehicle') || raw.includes('bonnet')) {
    return 'CAR_DECORATION';
  }
  if (
    raw.includes('wedding') ||
    raw.includes('varmala') ||
    raw.includes('mandap') ||
    raw.includes('stage') ||
    raw.includes('engagement') ||
    raw.includes('haar') ||
    raw.includes('bridal') ||
    raw.includes('groom')
  ) {
    return 'WEDDING_VARMALA';
  }
  // All other garlands, traditional malas, festival flowers, custom orders
  return 'GARLANDS_CUSTOM';
}

export function isCustomerGalleryImage(image: GalleryImage): boolean {
  return Boolean(image && image.image && typeof image.image === 'string' && image.image.trim().length > 0);
}
