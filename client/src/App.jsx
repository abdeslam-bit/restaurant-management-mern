import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Client Pages
import HomePage from './pages/client/HomePage';
import MenuPage from './pages/client/MenuPage';
import CheckoutPage from './pages/client/CheckoutPage';
import OrderTrackingPage from './pages/client/OrderTrackingPage';
import ReservationPage from './pages/client/ReservationPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import MenuManagePage from './pages/admin/MenuManagePage';
import ReservationsPage from './pages/admin/ReservationsPage';
import UsersPage from './pages/admin/UsersPage';

// Layout wrappers
function ClientLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Client Routes ─────────────────────── */}
      <Route
        path="/"
        element={<ClientLayout><HomePage /></ClientLayout>}
      />
      <Route
        path="/menu"
        element={<ClientLayout><MenuPage /></ClientLayout>}
      />
      <Route
        path="/checkout"
        element={<ClientLayout><CheckoutPage /></ClientLayout>}
      />
      <Route
        path="/order/:id"
        element={<ClientLayout><OrderTrackingPage /></ClientLayout>}
      />
      <Route
        path="/reservation"
        element={<ClientLayout><ReservationPage /></ClientLayout>}
      />

      {/* ── Admin Routes ──────────────────────── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<MenuManagePage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <ClientLayout>
            <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-state">
                <div className="empty-state-icon">🍽</div>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Go Home</a>
              </div>
            </div>
          </ClientLayout>
        }
      />
    </Routes>
  );
}
