import { X, Plus, Clock, ChefHat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUrl';
import './MenuItemModal.css';

const TAG_CLASS = {
  Vegan: 'tag-vegan', Vegetarian: 'tag-vegetarian', 'Gluten-Free': 'tag-gluten-free',
  Spicy: 'tag-spicy', 'Dairy-Free': 'tag-dairy-free', 'Nut-Free': 'tag-nut-free',
  Popular: 'tag-popular', New: 'tag-new', 'Chef Special': 'tag-chef',
};

export default function MenuItemModal({ item, onClose }) {
  const { addItem, items } = useCart();
  const toast = useToast();
  const cartItem = items.find((i) => i._id === item._id);

  const handleAdd = () => {
    addItem({ _id: item._id, name: item.name, price: item.price, image: item.image });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.name}>
      <div className="modal-content item-modal" onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        <div className="item-modal__image-wrap">
          {item.image ? (
            <img src={getImageUrl(item.image)} alt={item.name} className="item-modal__image" />
          ) : (
            <div className="item-modal__image-fallback">🍽</div>
          )}
          <button className="item-modal__close" onClick={onClose} aria-label="Close modal" id="item-modal-close">
            <X size={18} />
          </button>
          {!item.isAvailable && (
            <div className="item-modal__unavail">Currently Unavailable</div>
          )}
        </div>

        {/* Content */}
        <div className="item-modal__body">
          <div className="item-modal__header">
            <div>
              <h2 className="item-modal__name">{item.name}</h2>
              <div className="item-modal__sub">
                <span className="item-modal__category">{item.category}</span>
                {item.preparationTime && (
                  <span className="item-modal__time">
                    <Clock size={13} /> {item.preparationTime} min
                  </span>
                )}
              </div>
            </div>
            <span className="item-modal__price">${item.price.toFixed(2)}</span>
          </div>

          <p className="item-modal__desc">{item.description}</p>

          {item.tags?.length > 0 && (
            <div className="item-modal__tags">
              {item.tags.map((tag) => (
                <span key={tag} className={`tag ${TAG_CLASS[tag] || ''}`}>{tag}</span>
              ))}
            </div>
          )}

          <div className="item-modal__footer">
            {cartItem && (
              <span className="item-modal__in-cart">
                <ChefHat size={14} /> {cartItem.quantity} in cart
              </span>
            )}
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleAdd}
              disabled={!item.isAvailable}
              id={`modal-add-${item._id}`}
            >
              <Plus size={18} />
              {cartItem ? 'Add Another' : 'Add to Order'} — ${item.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
