import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../api/orders';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle, Clock, ChefHat, Truck, PartyPopper, XCircle } from 'lucide-react';
import './OrderTrackingPage.css';

const STATUS_STEPS = ['Received', 'Preparing', 'Ready', 'Completed'];
const DELIVERY_STEPS = ['Received', 'Preparing', 'Out for Delivery', 'Completed'];

const STEP_META = {
  Received: { icon: <CheckCircle size={22} />, label: 'Order Received', desc: 'We have your order and are getting started.' },
  Preparing: { icon: <ChefHat size={22} />, label: 'Preparing', desc: 'Our chefs are crafting your meal with care.' },
  Ready: { icon: <Clock size={22} />, label: 'Ready for Pickup', desc: 'Your order is ready to be served.' },
  'Out for Delivery': { icon: <Truck size={22} />, label: 'Out for Delivery', desc: 'Your order is on its way to you!' },
  Completed: { icon: <PartyPopper size={22} />, label: 'Completed', desc: 'Enjoy your meal! Thank you for dining with us.' },
  Cancelled: { icon: <XCircle size={22} />, label: 'Cancelled', desc: 'This order has been cancelled.' },
};

function getStatusIndex(steps, status) {
  return steps.indexOf(status);
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data.data);
      setLastUpdated(new Date());
    } catch {
      setError('Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="page-content"><LoadingSpinner message="Loading your order..." /></div>;

  if (error) {
    return (
      <div className="page-content tracking-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2>Order Not Found</h2>
            <p>{error}</p>
            <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const isDelivery = order.orderType === 'Delivery';
  const steps = isDelivery ? DELIVERY_STEPS : STATUS_STEPS;
  const currentIdx = isCancelled ? -1 : getStatusIndex(steps, order.status);

  return (
    <div className="page-content tracking-page">
      <div className="container">
        {/* Header */}
        <div className="tracking-header">
          <div className="tracking-order-num">
            <span className="tracking-label">Order ID</span>
            <span className="tracking-order-id">#{order.orderNumber}</span>
          </div>
          <div>
            <span className={`badge badge-${order.status.toLowerCase().replace(/\s/g, '-')}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        {!isCancelled ? (
          <div className="tracking-card">
            <h2 className="tracking-card__title">Order Progress</h2>
            <div className="tracking-steps">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const meta = STEP_META[step];
                return (
                  <div key={step} className={`tracking-step ${isCompleted ? 'tracking-step--done' : ''} ${isCurrent ? 'tracking-step--active' : ''}`}>
                    <div className="tracking-step__connector">
                      <div className="tracking-step__icon">
                        {isCompleted ? <CheckCircle size={20} /> : meta.icon}
                      </div>
                      {idx < steps.length - 1 && <div className="tracking-step__line" />}
                    </div>
                    <div className="tracking-step__content">
                      <p className="tracking-step__label">{meta.label}</p>
                      {isCurrent && <p className="tracking-step__desc">{meta.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {lastUpdated && (
              <p className="tracking-refresh-note">
                <Clock size={12} /> Last updated {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 5s
              </p>
            )}
          </div>
        ) : (
          <div className="tracking-card tracking-card--cancelled">
            <XCircle size={32} />
            <h3>Order Cancelled</h3>
            <p>This order has been cancelled. Please contact us if you have questions.</p>
          </div>
        )}

        {/* Order Details */}
        <div className="tracking-details-grid">
          <div className="tracking-card">
            <h3 className="tracking-card__title">Customer Details</h3>
            <div className="tracking-info">
              <div className="tracking-info-row"><span>Name</span><span>{order.customer.name}</span></div>
              <div className="tracking-info-row"><span>Phone</span><span>{order.customer.phone}</span></div>
              {order.customer.address && <div className="tracking-info-row"><span>Address</span><span>{order.customer.address}</span></div>}
              {order.customer.tableNumber && <div className="tracking-info-row"><span>Table</span><span>{order.customer.tableNumber}</span></div>}
              {order.customer.specialInstructions && <div className="tracking-info-row"><span>Notes</span><span>{order.customer.specialInstructions}</span></div>}
              <div className="tracking-info-row"><span>Payment</span><span>{order.paymentType}</span></div>
            </div>
          </div>

          <div className="tracking-card">
            <h3 className="tracking-card__title">Items Ordered</h3>
            <ul className="tracking-items">
              {order.items.map((item, i) => (
                <li key={i} className="tracking-item">
                  <div className="tracking-item__img">
                    {item.image ? <img src={item.image} alt={item.name} /> : <span>🍽</span>}
                  </div>
                  <span className="tracking-item__name">{item.name}</span>
                  <span className="tracking-item__qty">×{item.quantity}</span>
                  <span className="tracking-item__price">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="tracking-total">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="tracking-footer">
          <Link to="/menu" className="btn btn-secondary">Order More</Link>
          <Link to="/" className="btn btn-ghost">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
