export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  publicId?: string | null;
  isPrimary?: boolean;
  productId: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number | null;
  priceType?: 'FIXED' | 'STARTING_FROM' | 'CONTACT_FOR_PRICE';
  isContactForPrice: boolean;
  availability: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
  isFeatured: boolean;
  isPublished?: boolean;
  image: string;
  imagePublicId?: string | null;
  images?: ProductImage[];
  subcategory?: string | null;
  flowerType?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  weight?: string | null;
  color?: string | null;
  suitableFor?: string | null;
  whatsappMessage?: string | null;
  categoryId: string;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  district: string;
  taluka: string;
  village: string;
  area?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  highlight?: string | null;
  image: string;
  category: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  image: string;
  imagePublicId?: string | null;
  description?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  district?: string | null;
  taluka?: string | null;
  village?: string | null;
  serviceId?: string | null;
  productId?: string | null;
  productName?: string | null;
  budget?: string | null;
  message?: string | null;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  isDateBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  eventType?: string | null;
  eventDate?: string | null;
  eventLocation?: string | null;
  district?: string | null;
  taluka?: string | null;
  village?: string | null;
  service?: string | null;
  productId?: string | null;
  productName?: string | null;
  budget?: string | null;
  message?: string | null;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalProducts: number;
  publishedProducts?: number;
  availableProducts: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  upcomingBookings: number;
  galleryImages: number;
  activeOffers: number;
  totalLocations?: number;
  carDecorations?: number;
  publishedCarDecorations?: number;
}

export interface CarDecorationPost {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  priceText?: string | null;
  image: string;
  imagePublicId?: string | null;
  status: 'PUBLISHED' | 'UNPUBLISHED';
  createdAt?: string;
  updatedAt?: string;
}

