/**
 * Legacy homepage sections still import this type. Customer-facing photo
 * galleries now load only admin-managed original images from the API.
 */
export interface PortfolioItem {
  id: string;
  title: string;
  category: 'car-decoration' | 'haar-varmala' | 'wedding-engagement' | 'bouquets' | 'birthday-gifts' | 'fresh-flowers' | 'entrance-decoration' | 'customer-work';
  categoryLabel: string;
  subCategory: string;
  style?: string;
  suitableFor?: string;
  occasion?: string;
  floralStyle?: string;
  priceText?: string;
  image: string;
  altText: string;
  description?: string;
  whatsappMessage?: string;
}

// Intentionally empty: never substitute stock or invented photos when no
// original shop photos have been uploaded.
export const PORTFOLIO_ITEMS: PortfolioItem[] = [];
