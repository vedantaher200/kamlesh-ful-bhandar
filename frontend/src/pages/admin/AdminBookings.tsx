import React, { useEffect, useState } from 'react';
import { Calendar, Ban, Trash2, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Booking } from '../../types/index';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Block date form
  const [blockDateVal, setBlockDateVal] = useState('');
  const [blockReason, setBlockReason] = useState('Fully Booked');
  const [blocking, setBlocking] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings();
      if (res.success) setBookings(res.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateBookingStatus(id, newStatus);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateVal) return;
    setBlocking(true);
    try {
      await api.blockDate(blockDateVal, blockReason);
      setBlockDateVal('');
      fetchBookings();
      alert('Date blocked on calendar successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to block date.');
    } finally {
      setBlocking(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this booking record?')) {
      try {
        await api.deleteBooking(id);
        fetchBookings();
      } catch (err: any) {
        alert(err.message || 'Failed to delete.');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Bookings & Calendar Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Track upcoming weddings, manage dates, and block dates to prevent conflict
          </p>
        </div>
      </div>

      {/* BLOCK DATE FORM */}
      <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Ban size={22} color="#dc2626" />
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>Block a Date on Calendar</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Prevent customers from reserving an already booked date</span>
          </div>
        </div>

        <form onSubmit={handleBlockDate} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            required
            className="form-control"
            style={{ width: 'auto' }}
            value={blockDateVal}
            onChange={(e) => setBlockDateVal(e.target.value)}
          />
          <input
            type="text"
            placeholder="Reason (e.g. Major Wedding Lawn booked)"
            className="form-control"
            style={{ width: '240px' }}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
          <button type="submit" disabled={blocking} className="btn btn-danger btn-sm">
            {blocking ? 'Blocking...' : 'Block Date'}
          </button>
        </form>
      </div>

      {/* BOOKINGS TABLE */}
      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Date</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Event & Venue</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ background: b.isDateBlocked ? '#fff8f8' : 'transparent' }}>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {new Date(b.eventDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {b.isDateBlocked && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#dc2626' }}>
                        [Blocked Date]
                      </span>
                    )}
                  </td>
                  <td>{b.customerName}</td>
                  <td>
                    <a href={`tel:${b.customerPhone}`} style={{ color: 'var(--color-primary)' }}>
                      {b.customerPhone}
                    </a>
                  </td>
                  <td>
                    <div>{b.eventType}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{b.eventLocation}</div>
                  </td>
                  <td>{b.budget || '—'}</td>
                  <td>
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
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
                    <button onClick={() => handleDelete(b.id)} style={{ color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
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
