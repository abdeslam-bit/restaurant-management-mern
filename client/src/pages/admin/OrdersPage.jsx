import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../../api/orders';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, Clock, MapPin, Phone, UtensilsCrossed, Truck, Trash2, LayoutGrid, List } from 'lucide-react';
import './OrdersPage.css';

const STATUSES = ['Received', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'];

function getBadgeClass(status) {
  const map = { Received: 'received', Preparing: 'preparing', Ready: 'ready', 'Out for Delivery': 'out', Completed: 'completed', Cancelled: 'cancelled' };
  return `badge-${map[status] || 'received'}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const res = await getOrders(filterStatus ? { status: filterStatus } : {});
      setOrders(res.data.data);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status changed to "${newStatus}"`);
    } catch {
      toast.error('Failed to update order status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Delete order #${orderNumber}? This action cannot be undone.`)) return;
    setUpdating(orderId);
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success(`Order #${orderNumber} deleted.`);
    } catch {
      toast.error('Failed to delete order.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="orders-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Order Management</h1>
          <p className="admin-page-subtitle">View, update status, or delete orders ({orders.length} total).</p>
        </div>
        <div className="orders-controls">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'cards' ? 'view-mode-btn--active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
              id="view-cards-btn"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'view-mode-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              id="view-table-btn"
            >
              <List size={16} />
            </button>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            id="orders-filter"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button className="btn btn-ghost btn-sm" onClick={fetchOrders} id="refresh-orders-btn">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No orders found</h3>
          <p>{filterStatus ? `No ${filterStatus} orders.` : 'Orders will appear here once placed.'}</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="orders-cards-grid">
          {orders.map((order) => (
            <div key={order._id} className={`admin-order-card admin-order-card--${order.status.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="admin-order-card__header">
                <div>
                  <span className="order-num">#{order.orderNumber}</span>
                  <span className="order-card-time">
                    <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span>
              </div>

              <div className="admin-order-card__customer">
                <p className="order-customer__name">{order.customer.name}</p>
                <p className="order-customer__phone"><Phone size={12} /> {order.customer.phone}</p>
                {order.customer.address && (
                  <p className="order-customer__addr"><MapPin size={12} /> {order.customer.address}</p>
                )}
                {order.customer.tableNumber && (
                  <p className="order-customer__addr"><UtensilsCrossed size={12} /> Table {order.customer.tableNumber}</p>
                )}
              </div>

              <div className="admin-order-card__items">
                {order.items.map((i, idx) => (
                  <div key={idx} className="admin-order-item">
                    <span>{i.name} ×{i.quantity}</span>
                    <span>${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="admin-order-total-row">
                  <span>Total ({order.paymentType})</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="admin-order-card__controls">
                <div className="status-control-group">
                  <label className="text-xs font-semibold text-muted">Change Status:</label>
                  <select
                    className="form-select form-select-sm"
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updating === order._id}
                    id={`card-status-${order._id}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-delete-order"
                  onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                  disabled={updating === order._id}
                  id={`delete-card-${order._id}`}
                  title="Delete Order"
                >
                  <Trash2 size={15} /> Delete Order
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
                <th>Change Status</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className={`order-row order-row--${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                  <td>
                    <span className="order-num">#{order.orderNumber}</span>
                  </td>
                  <td>
                    <div className="order-customer">
                      <span className="order-customer__name">{order.customer.name}</span>
                      <span className="order-customer__phone"><Phone size={11} /> {order.customer.phone}</span>
                      {order.customer.address && (
                        <span className="order-customer__addr"><MapPin size={11} /> {order.customer.address.substring(0, 30)}{order.customer.address.length > 30 ? '...' : ''}</span>
                      )}
                      {order.customer.tableNumber && (
                        <span className="order-customer__addr"><UtensilsCrossed size={11} /> Table {order.customer.tableNumber}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="order-type-tag">
                      {order.orderType === 'Delivery' ? <Truck size={12} /> : <UtensilsCrossed size={12} />}
                      {order.orderType}
                    </span>
                  </td>
                  <td>
                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map((i, idx) => (
                        <span key={idx} className="order-item-tag">{i.name} ×{i.quantity}</span>
                      ))}
                      {order.items.length > 2 && <span className="order-item-more">+{order.items.length - 2} more</span>}
                    </div>
                  </td>
                  <td>
                    <span className="order-total">${order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="order-time">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ fontSize: '0.8rem', padding: '4px 8px', fontWeight: 600, minWidth: '130px' }}
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      disabled={updating === order._id}
                      id={`table-status-${order._id}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-delete-order btn-sm"
                      onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                      disabled={updating === order._id}
                      id={`delete-table-${order._id}`}
                      title="Delete Order"
                    >
                      <Trash2 size={14} /> Delete
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
