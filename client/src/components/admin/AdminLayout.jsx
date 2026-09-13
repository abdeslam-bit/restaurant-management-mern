import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, UtensilsCrossed, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './AdminLayout.css';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/menu': 'Menu Management',
  '/admin/reservations': 'Reservations',
  '/admin/users': 'Admin Accounts',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 900);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_width');
    return saved ? Math.min(Math.max(parseInt(saved, 10), 180), 450) : 260;
  });

  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Admin Portal';

  const handleWidthChange = (newWidth) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('admin_sidebar_width', newWidth);
  };

  const isDesktop = window.innerWidth >= 900;

  return (
    <div className={`admin-layout ${sidebarOpen ? 'admin-layout--sidebar-open' : 'admin-layout--sidebar-closed'}`}>
      {/* Top Header Bar */}
      <header
        className="admin-header-bar"
        style={isDesktop && sidebarOpen ? { paddingLeft: `calc(${sidebarWidth}px + var(--space-6))` } : undefined}
      >
        {!sidebarOpen && (
          <button
            className="admin-header-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            id="admin-sidebar-toggle-btn"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="admin-header-title">
          <UtensilsCrossed size={16} />
          <span>{title}</span>
        </div>
        <div className="admin-header-actions">
          <button className="admin-header-theme" onClick={toggleTheme} aria-label="Toggle theme" title={isDark ? "Light Mode" : "Dark Mode"}>
            {isDark ? <Sun size={18} color="#d4a853" /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile */}
      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={sidebarWidth}
        onWidthChange={handleWidthChange}
      />

      {/* Main Content */}
      <main
        className="admin-layout__main"
        style={isDesktop && sidebarOpen ? { marginLeft: `${sidebarWidth}px` } : undefined}
      >
        <Outlet />
      </main>
    </div>
  );
}
