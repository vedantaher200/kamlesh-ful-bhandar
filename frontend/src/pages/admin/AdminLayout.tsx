import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Flower,
  LayoutDashboard,
  Package,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  MessageSquare,
  Tag,
  Star,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Services', path: '/admin/services', icon: Sparkles },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Bookings & Dates', path: '/admin/bookings', icon: Calendar },
    { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Offers Banner', path: '/admin/offers', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Business Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="brand-icon" style={{ width: 36, height: 36 }}>
            <Flower size={20} />
          </div>
          <div className="brand-title-wrap">
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>Kamlesh Admin</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-gold)' }}>Nashik Platform</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link
            to="/"
            target="_blank"
            className="admin-nav-item"
            style={{ marginBottom: '0.5rem', color: 'var(--color-gold)' }}
          >
            <ExternalLink size={16} />
            <span>View Live Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: '100%', color: '#f87171' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
