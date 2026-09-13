import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const res = await login(form);
      loginAdmin(res.data.token, res.data.admin);
      toast.success(`Welcome back, ${res.data.admin.name}!`);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card fade-in-scale">
        {/* Header */}
        <div className="admin-login-card__header">
          <div className="admin-login-card__logo">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="admin-login-card__title">Admin Portal</h1>
          <p className="admin-login-card__subtitle">Sign in to manage your restaurant</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              <Lock size={14} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                className="form-input input-with-icon"
                placeholder="admin@restaurant.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input input-with-icon input-with-icon-right"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="admin-login-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Default Credentials Hint */}
        <div className="admin-login-hint">
          <p className="admin-login-hint__title">Default Credentials</p>
          <div className="admin-login-creds">
            <span><strong>Email:</strong> admin@restaurant.com</span>
            <span><strong>Password:</strong> Admin@123456</span>
          </div>
        </div>
      </div>
    </div>
  );
}
