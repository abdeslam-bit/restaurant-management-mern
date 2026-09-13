import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, updateQty, removeItem, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}
      <aside className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} aria-label="Shopping cart">
        <div className="cart-drawer__header">
          <div>
            <h3 className="cart-drawer__title">Your Order</h3>
            <p className="cart-drawer__count">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {items.length > 0 && (
              <button className="cart-drawer__clear" onClick={clearCart} title="Clear cart">
                <Trash2 size={14} />
                Clear
              </button>
            )}
            <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} strokeWidth={1.2} className="cart-empty__icon" />
              <h4>Your cart is empty</h4>
              <p>Add some delicious items from our menu to get started.</p>
              <button className="btn btn-primary btn-sm" onClick={onClose}>
                Browse Menu
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item._id} className="cart-item">
                  <div className="cart-item__image">
                    {item.image ? (
                      <img src={getImageUrl(item.image)} alt={item.name} />
                    ) : (
                      <div className="cart-item__image-placeholder">🍽</div>
                    )}
                  </div>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__price">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="cart-item__controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item._id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item._id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span className="cart-subtotal__amount">${totalAmount.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary w-full btn-lg" onClick={handleCheckout} id="checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
