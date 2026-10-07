import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle,
  PlusCircle,
  MapPin,
  ArrowRight,
  Car,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats, Enquiry } from '../../types/index';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statRes, enqRes] = await Promise.all([
          api.getDashboardStats(),
          api.getEnquiries()
        ]);
        if (statRes.success) setStats(statRes.stats);
        if (enqRes.success) setRecentEnquiries(enqRes.enquiries.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Real-time business status for Kamlesh Ful Bhandar, Nashik
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/car-decorations" className="btn btn-outline btn-sm">
            <Car size={16} />
            <span>Manage Car Decor</span>
          </Link>
          <Link to="/admin/products" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Loading stats from database...</p>
      ) : (
        <>
          {/* KPI STAT CARDS — ALL CLICKABLE & FUNCTIONAL */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* 1. Total Products -> Products Page */}
            <Link
              to="/admin/products"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            >
              <div className="kpi-icon-wrap"><Package size={26} /></div>
              <div className="kpi-text">
                <h4>Total Products</h4>
                <div className="kpi-value">{stats?.totalProducts || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                  {stats?.availableProducts || 0} In Stock • Click to view →
                </span>
              </div>
            </Link>

            {/* 2. Car Decorations -> Car Decorations Admin Page */}
            <Link
              to="/admin/car-decorations"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: '1px solid #fed7aa' }}
            >
              <div className="kpi-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Car size={26} />
              </div>
              <div className="kpi-text">
                <h4>Car Decorations</h4>
                <div className="kpi-value">{stats?.carDecorations || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
                  {stats?.publishedCarDecorations || 0} Published Online →
                </span>
              </div>
            </Link>

            {/* 3. Published Online Products -> Products Page */}
            <Link
              to="/admin/products"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            >
              <div className="kpi-icon-wrap" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a' }}><CheckCircle size={26} /></div>
              <div className="kpi-text">
                <h4>Published Products</h4>
                <div className="kpi-value">{stats?.publishedProducts || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Visible on Catalogue →</span>
              </div>
            </Link>

            {/* 4. Pending Orders / Bookings -> Bookings Page with Pending Filter */}
            <Link
              to="/admin/bookings?status=PENDING"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: '1px solid #fed7aa' }}
            >
              <div className="kpi-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}><Clock size={26} /></div>
              <div className="kpi-text">
                <h4>Pending Orders</h4>
                <div className="kpi-value">{stats?.pendingEnquiries || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>Action Required • View Pending →</span>
              </div>
            </Link>

            {/* 5. Total Orders / Bookings -> All Bookings */}
            <Link
              to="/admin/bookings"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            >
              <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}><Calendar size={26} /></div>
              <div className="kpi-text">
                <h4>Total Orders</h4>
                <div className="kpi-value">{stats?.upcomingBookings || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>All Event Bookings →</span>
              </div>
            </Link>

            {/* 6. Customers / Enquiries -> Enquiries Page */}
            <Link
              to="/admin/enquiries"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            >
              <div className="kpi-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}><MessageSquare size={26} /></div>
              <div className="kpi-text">
                <h4>Customers</h4>
                <div className="kpi-value">{stats?.totalEnquiries || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 600 }}>
                  Customer Records & Leads →
                </span>
              </div>
            </Link>

            {/* 6. Nashik Locations -> Locations Page */}
            <Link
              to="/admin/locations"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            >
              <div className="kpi-icon-wrap" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#ea580c' }}><MapPin size={26} /></div>
              <div className="kpi-text">
                <h4>Nashik Locations</h4>
                <div className="kpi-value">{stats?.totalLocations || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#ea580c' }}>Active Delivery Areas →</span>
              </div>
            </Link>

            {/* 7. Gallery Images -> Gallery Page */}
            <Link
              to="/admin/gallery"
              className="kpi-card"
              style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            >
              <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea' }}><ImageIcon size={26} /></div>
              <div className="kpi-text">
                <h4>Gallery Portfolio</h4>
                <div className="kpi-value">{stats?.galleryImages || 0}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Manage Photos →</span>
              </div>
            </Link>
          </div>

          {/* QUICK SHORTCUT ACTIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            <Link to="/admin/car-decorations" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>🚗 Car Decoration Posts</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/admin/products" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>📦 Manage Products</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/admin/bookings" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>📅 Calendar & Bookings</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/admin/enquiries" style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>💬 Customer Enquiries</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* RECENT ENQUIRIES TABLE */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                Recent Customer Enquiries
              </h3>
              <Link to="/admin/enquiries" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                View All Enquiries →
              </Link>
            </div>

            {recentEnquiries.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No enquiries received yet.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>Event Type</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td style={{ fontWeight: 600 }}>{enq.customerName}</td>
                      <td>
                        <a href={`tel:${enq.customerPhone}`} style={{ color: 'var(--color-primary)' }}>
                          {enq.customerPhone}
                        </a>
                      </td>
                      <td>{enq.eventType || 'Event'}</td>
                      <td>{enq.service || 'Floral Setup'}</td>
                      <td>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: enq.status === 'NEW' ? '#fef3c7' : '#dcfce7', color: enq.status === 'NEW' ? '#b45309' : '#15803d' }}>
                          {enq.status}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/91${enq.customerPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(enq.customerName)},%20thank%20you%20for%20contacting%20Kamlesh%20Ful%20Bhandar%20regarding%20your%20${encodeURIComponent(enq.eventType || 'event')}%20decoration.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Reply on WA
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
