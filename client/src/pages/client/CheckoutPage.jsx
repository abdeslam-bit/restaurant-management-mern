import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../api/orders';
import { ShoppingBag, Truck, UtensilsCrossed, ChevronRight, Minus, Plus, X } from 'lucide-react';
import './CheckoutPage.css';

const ORDER_TYPES = [
  { value: 'Delivery', label: 'Delivery', icon: <Truck size={20} />, desc: 'Delivered to your address' },
  { value: 'Dine-in', label: 'Dine-in', icon: <UtensilsCrossed size={20} />, desc: 'Enjoy at the restaurant' },
];

const initialForm = {
  name: '', phone: '', address: '', tableNumber: '', specialInstructions: '',
};

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, updateQty, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('Delivery');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (orderType === 'Delivery' && !form.address.trim()) errs.address = 'Delivery address is required';
    if (orderType === 'Dine-in' && !form.tableNumber.trim()) errs.tableNumber = 'Table number is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const orderData = {
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: orderType === 'Delivery' ? form.address.trim() : '',
        tableNumber: orderType === 'Dine-in' ? form.tableNumber.trim() : '',
        specialInstructions: form.specialInstructions.trim(),
      },
      items: items.map((i) => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      totalAmount,
      paymentType: orderType === 'Delivery' ? 'Cash on Delivery' : 'Dine-in',
      orderType,
    };

    setSubmitting(true);
    try {
      const res = await createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-content checkout-empty">
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingBag strokeWidth={1} /></div>
          <h2>Your cart is empty</h2>
          <p>Add some dishes from the menu before checking out.</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content checkout-page">
      <div className="container">
        <div className="checkout-page__header">
          <h1>Complete Your Order</h1>
          <p>Review your items and provide your details below.</p>
        </div>

        <div className="checkout-layout">
          {/* Left: Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} id="checkout-form">
              {/* Order Type */}
              <div className="checkout-card">
                <h3 className="checkout-card__title">Order Type</h3>
                <div className="order-type-grid">
                  {ORDER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`order-type-btn ${orderType === t.value ? 'order-type-btn--active' : ''}`}
                      onClick={() => setOrderType(t.value)}
                      id={`order-type-${t.value.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <div className="order-type-btn__icon">{t.icon}</div>
                      <div>
                        <div className="order-type-btn__label">{t.label}</div>
                        <div className="order-type-btn__desc">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Details */}
              <div className="checkout-card">
                <h3 className="checkout-card__title">Your Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-name">Full Name *</label>
                    <input id="checkout-name" name="name" className={`form-input ${errors.name ? 'form-input--error' : ''}`} placeholder="John Smith" value={form.name} onChange={handleChange} />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-phone">Phone Number *</label>
                    <input id="checkout-phone" name="phone" className={`form-input ${errors.phone ? 'form-input--error' : ''}`} placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>

                {orderType === 'Delivery' && (
                  <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label" htmlFor="checkout-address">Delivery Address *</label>
                    <textarea id="checkout-address" name="address" className={`form-textarea ${errors.address ? 'form-input--error' : ''}`} placeholder="123 Main Street, City, Postcode" value={form.address} onChange={handleChange} rows={3} />
                    {errors.address && <span className="form-error">{errors.address}</span>}
                  </div>
                )}

                {orderType === 'Dine-in' && (
                  <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label" htmlFor="checkout-table">Table Number *</label>
                    <input id="checkout-table" name="tableNumber" className={`form-input ${errors.tableNumber ? 'form-input--error' : ''}`} placeholder="e.g. Table 7" value={form.tableNumber} onChange={handleChange} />
                    {errors.tableNumber && <span className="form-error">{errors.tableNumber}</span>}
                  </div>
                )}

                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                  <label className="form-label" htmlFor="checkout-instructions">Special Instructions</label>
                  <textarea id="checkout-instructions" name="specialInstructions" className="form-textarea" placeholder="Allergies, preferences, or any special requests..." value={form.specialInstructions} onChange={handleChange} rows={3} />
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-card">
              <h3 className="checkout-card__title">Order Summary</h3>
              <ul className="summary-items">
                {items.map((item) => (
                  <li key={item._id} className="summary-item">
                    <div className="summary-item__img">
                      {item.image ? <img src={item.image} alt={item.name} /> : <span>🍽</span>}
                    </div>
                    <div className="summary-item__info">
                      <p className="summary-item__name">{item.name}</p>
                      <p className="summary-item__unit">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="summary-item__controls">
                      <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}><Minus size={12} /></button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)}><Plus size={12} /></button>
                    </div>
                    <span className="summary-item__total">${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="cart-item__remove" onClick={() => removeItem(item._id)} aria-label="Remove item"><X size={14} /></button>
                  </li>
                ))}
              </ul>

              <div className="summary-totals">
                <div className="summary-row"><span>Subtotal</span><span>${totalAmount.toFixed(2)}</span></div>
                <div className="summary-row"><span>Delivery Fee</span><span>{orderType === 'Delivery' ? '$2.99' : 'Free'}</span></div>
                <div className="summary-row summary-row--total">
                  <span>Total</span>
                  <span>${(totalAmount + (orderType === 'Delivery' ? 2.99 : 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-payment-info">
                <span className="badge badge-received">
                  {orderType === 'Delivery' ? '💵 Cash on Delivery' : '🍽 Pay at the Table'}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-lg w-full"
                disabled={submitting}
                id="place-order-btn"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
                {!submitting && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
