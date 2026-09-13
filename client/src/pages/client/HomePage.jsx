import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Calendar, ChefHat, Leaf, Award } from 'lucide-react';
import { getMenuItems } from '../../api/menu';
import MenuItemCard from '../../components/MenuItemCard';
import MenuItemModal from '../../components/MenuItemModal';
import './HomePage.css';

const FEATURES = [
  { icon: <ChefHat size={24} />, title: 'Culinary Excellence', desc: 'Every dish crafted by award-winning chefs using time-honoured techniques.' },
  { icon: <Leaf size={24} />, title: 'Seasonal & Local', desc: 'Ingredients sourced daily from trusted local farms and artisan producers.' },
  { icon: <Award size={24} />, title: 'Premium Experience', desc: 'An atmosphere designed to make every visit a memorable occasion.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    getMenuItems({ available: true })
      .then((res) => {
        const chefSpecials = res.data.data.filter((i) => i.tags?.includes('Chef Special')).slice(0, 3);
        const popular = res.data.data.filter((i) => i.tags?.includes('Popular') && !i.tags?.includes('Chef Special')).slice(0, 3 - chefSpecials.length);
        setFeatured([...chefSpecials, ...popular].slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
            alt="Fine dining restaurant interior"
            className="hero__bg-img"
          />
          <div className="hero__overlay" />
        </div>
        <div className="container hero__content">
          <span className="hero__eyebrow">Welcome to Maison Cuisine</span>
          <h1 className="hero__title">
            Where Every Dish<br />
            <em>Tells a Story</em>
          </h1>
          <p className="hero__subtitle">
            An intimate culinary journey through seasonal flavours, crafted with passion and served with grace.
          </p>
          <div className="hero__actions">
            <Link to="/menu" className="btn btn-primary btn-lg" id="hero-menu-btn">
              Explore Our Menu <ArrowRight size={20} />
            </Link>
            <Link to="/reservation" className="btn btn-gold btn-lg" id="hero-reserve-btn">
              <Calendar size={18} />
              Reserve a Table
            </Link>
          </div>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-num">16+</span>
              <span className="hero__stat-label">Curated Dishes</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">14</span>
              <span className="hero__stat-label">Years of Excellence</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#d4a853" color="#d4a853" />)}
              </div>
              <span className="hero__stat-label">Michelin Recognised</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Chef's Selections</span>
              <h2>Tonight's Highlights</h2>
              <div className="section-divider" />
            </div>
            <div className="featured-grid">
              {featured.map((item) => (
                <MenuItemCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
            </div>
            <div className="featured-cta">
              <Link to="/menu" className="btn btn-secondary btn-lg" id="view-full-menu-btn">
                View Full Menu <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div className="cta-content">
            <span className="section-eyebrow" style={{ color: 'var(--color-gold)' }}>Reserve Your Table</span>
            <h2 style={{ color: 'white' }}>Plan Your Perfect Evening</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              Whether an intimate dinner or a celebratory gathering, we create moments that last a lifetime.
            </p>
          </div>
          <Link to="/reservation" className="btn btn-gold btn-lg" id="cta-reserve-btn">
            <Calendar size={18} />
            Make a Reservation
          </Link>
        </div>
      </section>

      {selectedItem && <MenuItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
