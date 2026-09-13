import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, BookOpen, Calendar, LogOut, UtensilsCrossed, ChevronRight, Sun, Moon, X, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './AdminSidebar.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  { to: '/admin/menu', label: 'Menu Management', icon: <BookOpen size={18} /> },
  { to: '/admin/reservations', label: 'Reservations', icon: <Calendar size={18} /> },
];

export default function AdminSidebar({ isOpen, onClose, width = 260, onWidthChange }) {
  const { admin, logoutAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 900) {
      onClose?.();
    }
  }, [location.pathname]);

  // Handle Resizing (VS Code style)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.min(Math.max(e.clientX, 180), 450);
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, onWidthChange]);

  const handleDoubleClick = () => {
    onWidthChange?.(260); // Reset to default 260px
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const isDesktop = window.innerWidth >= 900;

  return (
    <aside
      className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''} ${isResizing ? 'admin-sidebar--resizing' : ''}`}
      style={isDesktop ? { width: `${width}px` } : undefined}
    >
      {/* Logo */}
      <div className="admin-sidebar__logo">
        <div className="admin-sidebar__logo-icon">
          <UtensilsCrossed size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <span className="admin-sidebar__logo-name">Maison</span>
          <span className="admin-sidebar__logo-tag">Admin Portal</span>
        </div>
        {onClose && (
          <button className="admin-sidebar__close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        <p className="admin-sidebar__nav-label">Management</p>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}
                id={`admin-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="admin-nav-link__icon">{item.icon}</span>
                <span className="admin-nav-link__label">{item.label}</span>
                <ChevronRight size={14} className="admin-nav-link__arrow" />
              </NavLink>
            </li>
          ))}
          {admin?.role === 'superadmin' && (
            <li key="/admin/users">
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}
                id="admin-nav-users"
              >
                <span className="admin-nav-link__icon"><Users size={18} /></span>
                <span className="admin-nav-link__label">Admin Accounts</span>
                <ChevronRight size={14} className="admin-nav-link__arrow" />
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user-name">{admin?.name || 'Admin'}</span>
            <span className="admin-sidebar__user-role">{admin?.role || 'admin'}</span>
          </div>
        </div>
        <button className="admin-sidebar__logout" onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} id="admin-theme-toggle">
          {isDark ? <Sun size={16} color="#d4a853" /> : <Moon size={16} />}
        </button>
        <button className="admin-sidebar__logout" onClick={handleLogout} id="admin-logout-btn" aria-label="Logout" title="Logout">
          <LogOut size={16} />
        </button>
      </div>

      {/* Resizer Handle (VS Code style) */}
      <div
        className={`admin-sidebar-resizer ${isResizing ? 'admin-sidebar-resizer--active' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="Drag to resize sidebar (Double-click to reset width)"
        id="admin-sidebar-resizer"
      />
    </aside>
  );
}
