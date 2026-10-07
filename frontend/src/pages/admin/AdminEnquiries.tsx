import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Phone, MessageCircle, Trash2, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { Enquiry } from '../../types/index';

export default function AdminEnquiries() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.getEnquiries(statusFilter === 'ALL' ? undefined : statusFilter);
      if (res.success) setEnquiries(res.enquiries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateEnquiryStatus(id, newStatus);
      fetchEnquiries();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this enquiry?')) {
      try {
        await api.deleteEnquiry(id);
        fetchEnquiries();
      } catch (err: any) {
        alert(err.message || 'Failed to delete.');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Customer Enquiries</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Inquiries received from customer website quotation & booking forms
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontWeight: 600 }}
          >
            <option value="ALL">All Enquiries</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading enquiries from database...</p>
      ) : enquiries.length === 0 ? (
        <div style={{ background: '#ffffff', padding: '3rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No enquiries found in this category.
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Event Type & Date</th>
                <th>Service</th>
                <th>Message / Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id}>
                  <td style={{ fontWeight: 600 }}>{enq.customerName}</td>
                  <td>
                    <a href={`tel:${enq.customerPhone}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      {enq.customerPhone}
                    </a>
                  </td>
                  <td>
                    <div>{enq.eventType || 'Event'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{enq.eventDate || 'Flexible Date'}</div>
                  </td>
                  <td>{enq.service || '—'}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{enq.message || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{enq.eventLocation}</div>
                  </td>
                  <td>
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <a
                        href={`https://wa.me/91${enq.customerPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(enq.customerName)},%20this%20is%20Kamlesh%20Ful%20Bhandar%20in%20Nashik.%20Thank%20you%20for%20your%20enquiry.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                      <a
                        href={`tel:${enq.customerPhone}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                        title="Call Customer"
                      >
                        <Phone size={14} />
                      </a>
                      <button onClick={() => handleDelete(enq.id)} style={{ color: '#ef4444', padding: '0.35rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
