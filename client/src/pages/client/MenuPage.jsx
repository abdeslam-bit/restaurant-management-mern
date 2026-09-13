import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { getMenuItems } from '../../api/menu';
import MenuItemCard from '../../components/MenuItemCard';
import MenuItemModal from '../../components/MenuItemModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import './MenuPage.css';

const CATEGORIES = ['All', 'Appetizers', 'Mains', 'Drinks', 'Desserts'];
const DIET_FILTERS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Spicy', 'Dairy-Free'];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [dietFilters, setDietFilters] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMenuItems()
      .then((res) => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDiet = (tag) => {
    setDietFilters((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const filtered = items.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchDiet = dietFilters.length === 0 || dietFilters.every((f) => item.tags?.includes(f));
    return matchCat && matchSearch && matchDiet;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const catItems = filtered.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const hasFilters = dietFilters.length > 0 || search;

  return (
    <div className="menu-page">
      {/* Hero Header */}
      <header className="menu-hero">
        <div className="menu-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80"
            alt="Culinary creations"
            className="menu-hero__img"
          />
          <div className="menu-hero__overlay" />
        </div>
        <div className="container menu-hero__content">
          <div className="menu-hero__badge">
            <Sparkles size={14} color="#d4a853" />
            <span>Maison Cuisine Collection</span>
          </div>
          <h1 className="menu-hero__title">Our Gastronomic Menu</h1>
          <p className="menu-hero__subtitle">
            An extraordinary tapestry of seasonal flavours, artisanal ingredients, and culinary perfection.
          </p>
          <div className="menu-hero__divider" />
        </div>
      </header>

      <div className="container menu-page__body">
        {/* Controls Bar */}
        <div className="menu-controls-card">
          <div className="menu-controls">
            {/* Search */}
            <div className="menu-search">
              <Search size={16} className="menu-search__icon" />
              <input
                type="text"
                className="menu-search__input"
                placeholder="Search culinary creations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="menu-search"
                aria-label="Search menu"
              />
              {search && (
                <button className="menu-search__clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="menu-categories" role="tablist" aria-label="Menu categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`menu-cat-btn ${selectedCategory === cat ? 'menu-cat-btn--active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  id={`cat-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Diet Filter Toggle */}
            <button
              className={`menu-filter-toggle ${showFilters ? 'menu-filter-toggle--active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              id="diet-filter-toggle"
            >
              <SlidersHorizontal size={15} />
              Dietary {dietFilters.length > 0 && <span className="filter-count">{dietFilters.length}</span>}
            </button>
          </div>

          {/* Dietary Filters Panel */}
          {showFilters && (
            <div className="diet-filters fade-in">
              {DIET_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`diet-btn ${dietFilters.includes(f) ? 'diet-btn--active' : ''}`}
                  onClick={() => toggleDiet(f)}
                  id={`diet-${f.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {f}
                </button>
              ))}
              {dietFilters.length > 0 && (
                <button className="diet-btn diet-btn--clear" onClick={() => setDietFilters([])}>
                  Clear All <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results summary */}
        {hasFilters && (
          <p className="menu-results-count">
            Showing {filtered.length} {filtered.length === 1 ? 'creation' : 'creations'}
            {search && ` for "${search}"`}
          </p>
        )}

        {/* Menu Items Grid */}
        {loading ? (
          <LoadingSpinner message="Preparing the menu..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽</div>
            <h3>No culinary creations found</h3>
            <p>Try adjusting your search query or dietary filters.</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSearch(''); setDietFilters([]); setSelectedCategory('All'); }}>
              Reset Filters
            </button>
          </div>
        ) : selectedCategory !== 'All' ? (
          <div className="menu-grid">
            {filtered.map((item) => (
              <MenuItemCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catItems]) => (
            <section key={cat} className="menu-category-section">
              <h2 className="menu-category-heading">{cat}</h2>
              <div className="menu-grid">
                {catItems.map((item) => (
                  <MenuItemCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selectedItem && <MenuItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
