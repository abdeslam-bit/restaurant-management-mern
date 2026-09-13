import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { UserPlus, Shield, Trash2, Pencil, Mail, User, Lock, Key, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import './UsersPage.css';

const ROLE_BADGES = {
  superadmin: { label: 'Main Admin', class: 'badge-completed' },
  admin: { label: 'Admin', class: 'badge-preparing' },
  staff: { label: 'Staff', class: 'badge-received' },
};

const initialForm = { name: '', email: '', password: '', role: 'staff' };

export default function UsersPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const isSuperAdmin = admin?.role === 'superadmin';

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required.');
      return;
    }
    if (!editingUser && !form.password) {
      toast.error('Password is required for new accounts.');
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const res = await updateUser(editingUser._id, form);
        setUsers((prev) => prev.map((u) => u._id === editingUser._id ? res.data.data : u));
        toast.success(`Account for "${res.data.data.name}" updated!`);
      } else {
        const res = await createUser(form);
        setUsers((prev) => [res.data.data, ...prev]);
        toast.success(`Account for "${res.data.data.name}" created!`);
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (userId === admin?.id) {
      toast.error('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the account for "${userName}"?`)) return;

    setDeletingId(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success(`Account for "${userName}" removed.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="admin-page fade-in">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Only the Main Admin has privileges to manage admin and staff accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Admin & Staff Accounts</h1>
          <p className="admin-page-subtitle">Manage administrative privileges and staff access.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchUsers} id="refresh-users-btn">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate} id="add-user-btn">
            <UserPlus size={16} /> Add Account
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading user accounts..." />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>No user accounts found</h3>
        </div>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role & Privilege</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const badge = ROLE_BADGES[u.role] || ROLE_BADGES.staff;
                const isSelf = u._id === admin?.id;
                return (
                  <tr key={u._id} className={isSelf ? 'user-row--self' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="user-name">{u.name}</span>
                          {isSelf && <span className="user-self-tag">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="user-email"><Mail size={12} /> {u.email}</span>
                    </td>
                    <td>
                      <span className={`badge ${badge.class}`}>
                        <Shield size={12} style={{ marginRight: 4 }} />
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <span className="user-date">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(u)}
                          title="Edit Account"
                          id={`edit-user-${u._id}`}
                        >
                          <Pencil size={14} /> Edit
                        </button>

                        {!isSelf ? (
                          <button
                            className="btn btn-delete-order btn-sm"
                            onClick={() => handleDelete(u._id, u.name)}
                            disabled={deletingId === u._id}
                            id={`delete-user-${u._id}`}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Account Form Modal (Create / Edit) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__header-title">
                {editingUser ? <Pencil size={20} style={{ color: 'var(--color-terracotta)' }} /> : <UserPlus size={20} style={{ color: 'var(--color-terracotta)' }} />}
                <h3>{editingUser ? 'Edit Account' : 'Create Account'}</h3>
              </div>
              <button className="admin-modal__close" onClick={() => setShowModal(false)} id="close-user-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal__body">
              <div className="form-group">
                <label className="form-label" htmlFor="user-name">Full Name *</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    id="user-name"
                    className="form-input input-with-icon"
                    placeholder="e.g. Sarah Jenkins"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-email">Email Address *</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="user-email"
                    type="email"
                    className="form-input input-with-icon"
                    placeholder="sarah@restaurant.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-password">
                  Password {editingUser ? '(Leave blank to keep unchanged)' : '*'}
                </label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input input-with-icon input-with-icon-right"
                    placeholder={editingUser ? 'Enter new password or leave empty' : 'Min 6 characters'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingUser}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    id="toggle-user-password"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-role">
                  <Key size={14} style={{ marginRight: 4 }} /> Account Role & Privileges *
                </label>
                <select
                  id="user-role"
                  className="form-select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={editingUser && editingUser._id === admin?.id}
                >
                  <option value="staff">Staff (Orders, Menu & Reservations)</option>
                  <option value="admin">Admin (Orders, Menu & Reservations)</option>
                  <option value="superadmin">Main Admin (Full Access + User Management)</option>
                </select>
                {editingUser && editingUser._id === admin?.id && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                    You cannot alter your own active Main Admin role.
                  </span>
                )}
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-user-btn">
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
