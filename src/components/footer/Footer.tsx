import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Policy, Gavel, Cookie, Mail, Favorite } from '@mui/icons-material';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/pricing', label: 'Pricing', icon: null },
    { path: '/videos', label: 'Videos', icon: null },
    { path: '/wishlist', label: 'Wishlist', icon: <Favorite /> },
  ];

  const legalLinks = [
    { path: '/legal/privacy', label: 'Privacy Policy', icon: <Policy /> },
    { path: '/legal/terms', label: 'Terms of Service', icon: <Gavel /> },
    { path: '/legal/cookies', label: 'Cookie Policy', icon: <Cookie /> },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <Link to="/" className="footer-logo">
              Unseen Price
            </Link>
            <p className="footer-tagline">
              Discover local shops and products near you. Shop local, support local.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              {legalLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links footer-contact">
              <li>
                <Mail className="footer-icon" />
                <a href="mailto:support@unseenprice.com">support@unseenprice.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Unseen Price. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
