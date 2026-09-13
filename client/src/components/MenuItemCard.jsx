import { Plus, Clock, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUrl';
import './MenuItemCard.css';

const TAG_LABELS = {
  Vegan: 'Vegan',
  Vegetarian: 'Vegetarian',
  'Gluten-Free': 'Gluten-Free',
  Spicy: '🌶 Spicy',
  'Dairy-Free': 'Dairy-Free',
  'Nut-Free': 'Nut-Free',
  Popular: '⭐ Popular',
  New: '✨ New',
  'Chef Special': '👨‍🍳 Chef Special',
};

const TAG_CLASS = {
  Vegan: 'tag-vegan',
  Vegetarian: 'tag-vegetarian',
  'Gluten-Free': 'tag-gluten-free',
  Spicy: 'tag-spicy',
  'Dairy-Free': 'tag-dairy-free',
  'Nut-Free': 'tag-nut-free',
  Popular: 'tag-popular',
  New: 'tag-new',
  'Chef Special': 'tag-chef',
};

export default function MenuItemCard({ item, onClick }) {
  const { addItem } = useCart();
  const toast = useToast();

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    addItem({ _id: item._id, name: item.name, price: item.price, image: item.image });
    toast.success(`${item.name} added to cart!`);
  };

  const priorityTags = item.tags?.filter((t) => ['Popular', 'New', 'Chef Special'].includes(t)).slice(0, 1);
  const dietaryTags = item.tags?.filter((t) => !['Popular', 'New', 'Chef Special'].includes(t)).slice(0, 2);

  return (
    <article
      className={`menu-card ${!item.isAvailable ? 'menu-card--unavailable' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${item.name}, $${item.price}`}
    >
      {/* Image */}
      <div className="menu-card__image-wrapper">
        {item.image ? (
          <img src={getImageUrl(item.image)} alt={item.name} className="menu-card__image" loading="lazy" />
        ) : (
          <div className="menu-card__image-fallback">🍽</div>
        )}
        {!item.isAvailable && (
          <div className="menu-card__unavailable-overlay">
            <span>Currently Unavailable</span>
          </div>
        )}
        {priorityTags?.length > 0 && (
          <div className="menu-card__priority-tag">
            <span className={`tag ${TAG_CLASS[priorityTags[0]]}`}>{TAG_LABELS[priorityTags[0]]}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="menu-card__body">
        <div className="menu-card__meta">
          {item.preparationTime && (
            <span className="menu-card__time">
              <Clock size={12} />
              {item.preparationTime} min
            </span>
          )}
          {dietaryTags?.map((tag) => (
            <span key={tag} className={`tag ${TAG_CLASS[tag]}`}>
              {TAG_LABELS[tag]}
            </span>
          ))}
        </div>

        <h3 className="menu-card__name">{item.name}</h3>
        <p className="menu-card__desc">{item.description}</p>

        <div className="menu-card__footer">
          <span className="menu-card__price">${item.price.toFixed(2)}</span>
          <button
            className="menu-card__add-btn"
            onClick={handleAdd}
            disabled={!item.isAvailable}
            aria-label={`Add ${item.name} to cart`}
            id={`add-to-cart-${item._id}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
