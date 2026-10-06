import {
  Product,
  Category,
  Service,
  GalleryImage,
  Booking,
  Enquiry,
  Review,
  Offer,
  DashboardStats
} from '../types/index';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('kamlesh_admin_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Base request helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const headers = { ...getHeaders(isFormData), ...(options.headers as any) };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),

  // Products
  getProducts: (params?: { category?: string; search?: string; availability?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.availability) query.append('availability', params.availability);
    if (params?.featured) query.append('featured', 'true');
    return request<{ success: boolean; count: number; products: Product[] }>(`/products?${query.toString()}`);
  },
  getProduct: (idOrSlug: string) =>
    request<{ success: boolean; product: Product }>(`/products/${idOrSlug}`),
  createProduct: (data: Partial<Product>) =>
    request<{ success: boolean; product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<{ success: boolean; product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE'
    }),

  // Categories
  getCategories: () =>
    request<{ success: boolean; count: number; categories: Category[] }>('/categories'),
  createCategory: (data: { name: string; description?: string }) =>
    request<{ success: boolean; category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCategory: (id: string, data: { name: string; description?: string }) =>
    request<{ success: boolean; category: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    }),

  // Services
  getServices: (params?: { category?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.featured) query.append('featured', 'true');
    return request<{ success: boolean; count: number; services: Service[] }>(`/services?${query.toString()}`);
  },
  createService: (data: Partial<Service>) =>
    request<{ success: boolean; service: Service }>('/services', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateService: (id: string, data: Partial<Service>) =>
    request<{ success: boolean; service: Service }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteService: (id: string) =>
    request<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE'
    }),

  // Gallery
  getGallery: (category?: string, includeUnpublished = false) => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (includeUnpublished) query.append('includeUnpublished', 'true');
    return request<{ success: boolean; count: number; images: GalleryImage[] }>(`/gallery?${query.toString()}`);
  },
  createGalleryImage: (data: Partial<GalleryImage>) =>
    request<{ success: boolean; galleryImage: GalleryImage }>('/gallery', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateGalleryImage: (id: string, data: Partial<GalleryImage>) =>
    request<{ success: boolean; galleryImage: GalleryImage }>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteGalleryImage: (id: string) =>
    request<{ success: boolean; message: string }>(`/gallery/${id}`, {
      method: 'DELETE'
    }),

  // Enquiries
  createEnquiry: (data: Partial<Enquiry>) =>
    request<{ success: boolean; message: string; enquiry: Enquiry }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getEnquiries: (status?: string) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    return request<{ success: boolean; count: number; enquiries: Enquiry[] }>(`/enquiries?${query.toString()}`);
  },
  updateEnquiryStatus: (id: string, status: string) =>
    request<{ success: boolean; enquiry: Enquiry }>(`/enquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  deleteEnquiry: (id: string) =>
    request<{ success: boolean; message: string }>(`/enquiries/${id}`, {
      method: 'DELETE'
    }),

  // Bookings & Calendar
  getCalendarDates: () =>
    request<{ success: boolean; dates: Array<{ date: string; eventType: string; status: string; isDateBlocked: boolean }> }>(
      '/bookings/calendar-dates'
    ),
  createBooking: (data: Partial<Booking>) =>
    request<{ success: boolean; message: string; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getBookings: (status?: string) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    return request<{ success: boolean; count: number; bookings: Booking[] }>(`/bookings?${query.toString()}`);
  },
  blockDate: (date: string, reason?: string) =>
    request<{ success: boolean; message: string }>('/bookings/block-date', {
      method: 'POST',
      body: JSON.stringify({ date, reason })
    }),
  updateBookingStatus: (id: string, status: string, isDateBlocked?: boolean) =>
    request<{ success: boolean; booking: Booking }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, isDateBlocked })
    }),
  deleteBooking: (id: string) =>
    request<{ success: boolean; message: string }>(`/bookings/${id}`, {
      method: 'DELETE'
    }),

  // Reviews
  getApprovedReviews: () =>
    request<{ success: boolean; count: number; reviews: Review[] }>('/reviews/approved'),
  getAllReviews: () =>
    request<{ success: boolean; count: number; reviews: Review[] }>('/reviews/all'),
  submitReview: (data: { customerName: string; rating: number; comment: string }) =>
    request<{ success: boolean; message: string; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateReviewStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') =>
    request<{ success: boolean; review: Review }>(`/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  deleteReview: (id: string) =>
    request<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE'
    }),

  // Offers
  getActiveOffers: () =>
    request<{ success: boolean; count: number; offers: Offer[] }>('/offers/active'),
  getAllOffers: () =>
    request<{ success: boolean; count: number; offers: Offer[] }>('/offers'),
  createOffer: (data: Partial<Offer>) =>
    request<{ success: boolean; offer: Offer }>('/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateOffer: (id: string, data: Partial<Offer>) =>
    request<{ success: boolean; offer: Offer }>(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteOffer: (id: string) =>
    request<{ success: boolean; message: string }>(`/offers/${id}`, {
      method: 'DELETE'
    }),

  // Settings & Dashboard Stats
  getSettings: () =>
    request<{ success: boolean; settings: Record<string, string> }>('/settings/public'),
  updateSettings: (settings: Record<string, string>) =>
    request<{ success: boolean; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings })
    }),
  getDashboardStats: () =>
    request<{ success: boolean; stats: DashboardStats }>('/settings/dashboard-stats'),

  // Upload Image
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ success: boolean; url: string; publicId: string; source: string }>('/upload/image', {
      method: 'POST',
      body: formData
    });
  }
};

/**
 * WhatsApp Helper
 */
export const createWhatsAppUrl = (message: string, number = '919921972936') => {
  const cleanNumber = number.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
};

export const formatPrice = (price: number | null | undefined, isContactForPrice?: boolean) => {
  if (isContactForPrice || price === null || price === undefined) {
    return 'Contact for Price';
  }
  return `₹${price.toLocaleString('en-IN')}`;
};
