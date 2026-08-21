import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { Modal } from '../components/Modal';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, Plus, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

export const ResourceBooking = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [bookableAssets, setBookableAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [showBookModal, setShowBookModal] = useState(searchParams.get('action') === 'book');
  const [bookingForm, setBookingForm] = useState({
    assetId: '',
    purpose: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  // Overlap Conflict Banner State
  const [overlapError, setOverlapError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingList, assetList] = await Promise.all([
        fetchAPI('/bookings'),
        fetchAPI('/assets?isBookable=true')
      ]);

      setBookings(bookingList);
      setBookableAssets(assetList);
    } catch (err) {
      console.error('Resource Booking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit Booking (Triggers Server & Client Overlap Validation)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setOverlapError(null);
    try {
      await fetchAPI('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingForm)
      });
      setShowBookModal(false);
      setBookingForm({ assetId: '', purpose: '', startTime: '', endTime: '', notes: '' });
      loadData();
    } catch (err) {
      if (err.data && err.data.code === 'BOOKING_OVERLAP_CONFLICT') {
        setOverlapError(err.data);
      } else {
        alert(err.message);
      }
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    try {
      await fetchAPI(`/bookings/${bookingId}/cancel`, { method: 'PUT' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Shared Resource Time-Slot Booking</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Book shared conference rooms, EV shuttles, and lab gear with automated overlap validation.
          </p>
        </div>

        <button onClick={() => { setOverlapError(null); setShowBookModal(true); }} className="glow-btn-primary">
          <Plus size={16} /> New Resource Booking
        </button>
      </div>

      {/* Bookable Assets Grid Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {bookableAssets.map(asset => (
          <div key={asset._id} className="glass-panel glass-panel-interactive" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {asset.assetTag}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: '0.3rem' }}>{asset.name}</h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📍 {asset.location}</p>
              </div>
              <CalendarDays size={22} color="#8b5cf6" />
            </div>

            <button
              onClick={() => {
                setBookingForm({ ...bookingForm, assetId: asset._id });
                setOverlapError(null);
                setShowBookModal(true);
              }}
              className="glow-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', fontSize: '0.78rem' }}
            >
              Book Time Slot
            </button>
          </div>
        ))}
      </div>

      {/* Bookings Time Slot Calendar & List */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Scheduled Resource Bookings</h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource Tag</th>
                <th>Resource Name</th>
                <th>Booked By</th>
                <th>Purpose</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No upcoming resource bookings.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b._id}>
                    <td><strong style={{ color: '#38bdf8' }}>{b.asset?.assetTag}</strong></td>
                    <td style={{ fontWeight: 600 }}>{b.asset?.name}</td>
                    <td>{b.user?.name}</td>
                    <td style={{ color: '#cbd5e1' }}>{b.purpose}</td>
                    <td>{new Date(b.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{new Date(b.endTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span className={`status-pill ${b.status === 'Upcoming' ? 'status-Allocated' : b.status === 'Ongoing' ? 'status-Available' : 'status-Retired'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'Upcoming' && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Cancel Slot
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW BOOKING MODAL (with Overlap Validation Banner) */}
      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Reserve Resource Time Slot">
        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* OVERLAP CONFLICT BANNER */}
          {overlapError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '1rem',
              color: '#f87171'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <AlertTriangle size={18} /> TIME SLOT OVERLAP REJECTED BY SYSTEM
              </div>
              <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: '1.4' }}>
                {overlapError.message}
              </p>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select Shared Resource *</label>
            <select required className="input-field" value={bookingForm.assetId} onChange={e => setBookingForm({ ...bookingForm, assetId: e.target.value })}>
              <option value="">-- Choose Resource --</option>
              {bookableAssets.map(a => (
                <option key={a._id} value={a._id}>{a.assetTag} - {a.name} ({a.location})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Meeting / Usage Purpose *</label>
            <input required type="text" className="input-field" value={bookingForm.purpose} onChange={e => setBookingForm({ ...bookingForm, purpose: e.target.value })} placeholder="e.g. Q3 Sprint Planning Session" />
          </div>

          <div className="form-grid-2col">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Start Time *</label>
              <input required type="datetime-local" className="input-field" value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>End Time *</label>
              <input required type="datetime-local" className="input-field" value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="glow-btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            Confirm Reservation & Validate Overlaps
          </button>
        </form>
      </Modal>
    </div>
  );
};
