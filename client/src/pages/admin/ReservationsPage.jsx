import { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus, deleteReservation } from '../../api/reservations';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, Users, Calendar, Clock, Phone, Mail, CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';
import './ReservationsPage.css';

const STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Completed'];

function getBadgeClass(status) {
  const map = { Pending: 'pending', Confirmed: 'confirmed', Rejected: 'rejected', Completed: 'completed' };
  return `badge-${map[status] || 'pending'}`;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  const fetchReservations = async () => {
    try {
      const res = await getReservations(filterStatus ? { status: filterStatus } : {});
      setReservations(res.data.data);
    } catch { toast.error('Failed to load reservations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, [filterStatus]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await updateReservationStatus(id, status);
      setReservations((prev) => prev.map((r) => r._id === id ? res.data.data : r));
      toast.success(`Reservation ${status.toLowerCase()}.`);
    } catch { toast.error('Failed to update reservation.'); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete reservation for "${name}"?`)) return;
    try {
      await deleteReservation(id);
      setReservations((prev) => prev.filter((r) => r._id !== id));
      toast.success('Reservation deleted.');
    } catch { toast.error('Failed to delete reservation.'); }
  };

  const pending = reservations.filter((r) => r.status === 'Pending').length;

  return (
    <div className="reservations-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Reservations</h1>
          <p className="admin-page-subtitle">
            Manage table bookings. {pending > 0 && <span className="pending-alert">{pending} pending confirmation</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} id="res-filter">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={fetchReservations} id="refresh-reservations-btn">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading reservations..." />
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No reservations found</h3>
          <p>{filterStatus ? `No ${filterStatus} reservations.` : 'Reservations will appear here once guests book.'}</p>
        </div>
      ) : (
        <div className="res-cards-grid">
          {reservations.map((res) => (
            <div key={res._id} className={`res-card res-card--${res.status.toLowerCase()}`}>
              <div className="res-card__header">
                <div>
                  <h4 className="res-card__name">{res.name}</h4>
                  <span className={`badge ${getBadgeClass(res.status)}`}>{res.status}</span>
                </div>
                <div className="res-card__guests">
                  <Users size={14} />
                  <span>{res.guestsCount} {res.guestsCount === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>

              <div className="res-card__details">
                <div className="res-detail-row">
                  <Calendar size={13} />
                  <span>{new Date(res.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="res-detail-row">
                  <Clock size={13} />
                  <span>{res.time}</span>
                </div>
                <div className="res-detail-row">
                  <Phone size={13} />
                  <span>{res.phone}</span>
                </div>
                <div className="res-detail-row">
                  <Mail size={13} />
                  <span>{res.email}</span>
                </div>
                {res.notes && (
                  <div className="res-card__notes">
                    <p>"{res.notes}"</p>
                  </div>
                )}
              </div>

              <div className="res-card__footer">
                {res.status === 'Pending' && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatus(res._id, 'Confirmed')}
                      disabled={updating === res._id}
                      id={`confirm-${res._id}`}
                    >
                      <CheckCircle size={14} /> Confirm
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', background: 'var(--color-error-bg)' }}
                      onClick={() => handleStatus(res._id, 'Rejected')}
                      disabled={updating === res._id}
                      id={`reject-${res._id}`}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                {res.status === 'Confirmed' && (
                  <button
                    className="btn btn-gold btn-sm"
                    onClick={() => handleStatus(res._id, 'Completed')}
                    disabled={updating === res._id}
                    id={`complete-${res._id}`}
                  >
                    <Star size={14} /> Mark Completed
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 'auto', color: 'var(--color-error)' }}
                  onClick={() => handleDelete(res._id, res.name)}
                  id={`delete-res-${res._id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
