import { useState } from 'react';
import { Calendar, Clock, Users, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { createReservation } from '../../api/reservations';
import { useToast } from '../../context/ToastContext';
import './ReservationPage.css';

const TIMES = ['12:00', '12:30', '13:00', '13:30', '14:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

const initialForm = { name: '', phone: '', email: '', date: '', time: '', guestsCount: 2, notes: '' };

export default function ReservationPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const toast = useToast();

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.date) errs.date = 'Date is required';
    if (!form.time) errs.time = 'Time is required';
    if (!form.guestsCount || form.guestsCount < 1) errs.guestsCount = 'At least 1 guest';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'guestsCount' ? parseInt(value) || 1 : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await createReservation(form);
      setSuccess(res.data.data);
      toast.success('Reservation submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="page-content reservation-page">
        <div className="container">
          <div className="reservation-success fade-in">
            <div className="reservation-success__icon">
              <CheckCircle size={48} />
            </div>
            <h2>Reservation Request Received!</h2>
            <p>Thank you, <strong>{success.name}</strong>. We'll confirm your booking shortly at <strong>{success.email}</strong>.</p>
            <div className="reservation-success__details">
              <div className="res-detail"><Calendar size={16} /><span>{new Date(success.date).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span></div>
              <div className="res-detail"><Clock size={16} /><span>{success.time}</span></div>
              <div className="res-detail"><Users size={16} /><span>{success.guestsCount} {success.guestsCount === 1 ? 'guest' : 'guests'}</span></div>
            </div>
            <div className="reservation-success__badge">
              <span className="badge badge-pending">⏳ Pending Confirmation</span>
            </div>
            <button className="btn btn-primary" onClick={() => setSuccess(null)} id="new-reservation-btn">
              Make Another Reservation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content reservation-page">
      <div className="container">
        <div className="reservation-layout">
          {/* Info Panel */}
          <div className="reservation-info">
            <span className="section-eyebrow">Table Reservations</span>
            <h1>Reserve Your Table</h1>
            <p className="reservation-info__desc">
              Plan your perfect dining experience at Maison Cuisine. Book ahead to guarantee your preferred time and seating.
            </p>
            <div className="reservation-info__details">
              <div className="res-info-item">
                <Clock size={20} />
                <div>
                  <strong>Opening Hours</strong>
                  <p>Monday – Sunday: 12:00 – 23:00</p>
                </div>
              </div>
              <div className="res-info-item">
                <Users size={20} />
                <div>
                  <strong>Party Size</strong>
                  <p>Up to 20 guests per booking</p>
                </div>
              </div>
              <div className="res-info-item">
                <CheckCircle size={20} />
                <div>
                  <strong>Confirmation</strong>
                  <p>We'll confirm your booking within 2 hours</p>
                </div>
              </div>
            </div>

            <div className="reservation-quote">
              <blockquote>"To invite someone to dinner is to take responsibility for their happiness for the entire evening."</blockquote>
              <cite>— Brillat-Savarin</cite>
            </div>
          </div>

          {/* Form */}
          <div className="reservation-form-wrap">
            <form onSubmit={handleSubmit} id="reservation-form" className="reservation-form-card">
              <h2 className="reservation-form-card__title">Booking Details</h2>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="res-name"><User size={14} /> Full Name *</label>
                  <input id="res-name" name="name" className={`form-input ${errors.name ? 'form-input--error' : ''}`} placeholder="Your name" value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="res-phone"><Phone size={14} /> Phone *</label>
                  <input id="res-phone" name="phone" className={`form-input ${errors.phone ? 'form-input--error' : ''}`} placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-email"><Mail size={14} /> Email Address *</label>
                <input id="res-email" name="email" type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} placeholder="you@example.com" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="res-date"><Calendar size={14} /> Date *</label>
                  <input id="res-date" name="date" type="date" min={today} className={`form-input ${errors.date ? 'form-input--error' : ''}`} value={form.date} onChange={handleChange} />
                  {errors.date && <span className="form-error">{errors.date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="res-time"><Clock size={14} /> Time *</label>
                  <select id="res-time" name="time" className={`form-select ${errors.time ? 'form-input--error' : ''}`} value={form.time} onChange={handleChange}>
                    <option value="">Select time</option>
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.time && <span className="form-error">{errors.time}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="res-guests"><Users size={14} /> Guests *</label>
                  <input id="res-guests" name="guestsCount" type="number" min={1} max={20} className={`form-input ${errors.guestsCount ? 'form-input--error' : ''}`} value={form.guestsCount} onChange={handleChange} />
                  {errors.guestsCount && <span className="form-error">{errors.guestsCount}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-notes"><FileText size={14} /> Special Requests</label>
                <textarea id="res-notes" name="notes" className="form-textarea" placeholder="Dietary requirements, seating preferences, celebrations..." value={form.notes} onChange={handleChange} rows={3} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting} id="submit-reservation-btn">
                {submitting ? 'Submitting...' : 'Request Reservation'}
              </button>

              <p className="reservation-form-note">No account required. We'll reach out to confirm your booking.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
