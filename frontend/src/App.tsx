import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StickyMobileBar from './components/StickyMobileBar';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Bookings from './pages/Bookings';
import About from './pages/About';
import Contact from './pages/Contact';
import CarDecorationPage from './pages/CarDecorationPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCarDecorations from './pages/admin/AdminCarDecorations';
import AdminLocations from './pages/admin/AdminLocations';
import AdminServices from './pages/admin/AdminServices';
import AdminGallery from './pages/admin/AdminGallery';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminOffers from './pages/admin/AdminOffers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-root">
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:idOrSlug" element={<ProductDetail />} />
          <Route path="/car-decoration" element={<CarDecorationPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="car-decorations" element={<AdminCarDecorations />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <StickyMobileBar />
          <FloatingWhatsApp />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
