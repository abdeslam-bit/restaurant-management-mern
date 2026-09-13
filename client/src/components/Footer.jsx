import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, MapPin, Clock, Globe, Share2, Rss } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="footer__logo-icon">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <span className="footer__logo-name">Maison Cuisine</span>
              <span className="footer__logo-tagline">Fine Dining Since 2010</span>
            </div>
          </div>
          <p className="footer__desc">
            A celebration of seasonal ingredients, culinary artistry, and warm hospitality — crafted for every occasion.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Website" className="footer__social-link"><Globe size={18} /></a>
            <a href="#" aria-label="Share" className="footer__social-link"><Share2 size={18} /></a>
            <a href="#" aria-label="Blog" className="footer__social-link"><Rss size={18} /></a>
          </div>
        </div>

        <div className="footer__links">
          <h4>Navigate</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/reservation">Reserve a Table</Link></li>
          </ul>
        </div>

        <div className="footer__contact">
          <h4>Find Us</h4>
          <ul>
            <li><MapPin size={14} /> <span>42 Rue de la Gastronomie, Paris</span></li>
            <li><Phone size={14} /> <span>+33 1 23 45 67 89</span></li>
            <li><Clock size={14} /> <span>Mon–Sun: 12:00 – 23:00</span></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Maison Cuisine. All rights reserved.</p>
          <Link to="/admin/login" className="footer__admin-link">Staff Portal</Link>
        </div>
      </div>
    </footer>
  );
}
