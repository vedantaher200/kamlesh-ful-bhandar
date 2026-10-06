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

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  isContactForPrice: boolean;
  availability: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
  isFeatured: boolean;
  image: string;
  imagePublicId?: string | null;
  whatsappMessage?: string | null;
  categoryId: string;
  category?: Category;
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
  serviceId?: string | null;
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
  service?: string | null;
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
  availableProducts: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  upcomingBookings: number;
  galleryImages: number;
  activeOffers: number;
}
