import React from 'react';
import './pricingPage.css';
import { FaCheck } from 'react-icons/fa';

const PricingPage: React.FC = () => {
  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your business needs</p>
      </div>
      
      <div className="pricing-cards">
        {/* Basic Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h2>Basic</h2>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">19</span>
              <span className="period">/month</span>
            </div>
          </div>
          <div className="card-body">
            <ul>
              <li><FaCheck className="check-icon" /> Up to 50 product listings</li>
              <li><FaCheck className="check-icon" /> Basic analytics</li>
              <li><FaCheck className="check-icon" /> Customer support</li>
              <li><FaCheck className="check-icon" /> Basic shop customization</li>
              <li><FaCheck className="check-icon" /> Standard processing</li>
            </ul>
            <button className="subscribe-btn">Get Started</button>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="pricing-card featured">
          <div className="popular-badge">Most Popular</div>
          <div className="card-header">
            <h2>Professional</h2>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">49</span>
              <span className="period">/month</span>
            </div>
          </div>
          <div className="card-body">
            <ul>
              <li><FaCheck className="check-icon" /> Unlimited product listings</li>
              <li><FaCheck className="check-icon" /> Advanced analytics</li>
              <li><FaCheck className="check-icon" /> Priority customer support</li>
              <li><FaCheck className="check-icon" /> Advanced shop customization</li>
              <li><FaCheck className="check-icon" /> Priority processing</li>
              <li><FaCheck className="check-icon" /> Marketing tools</li>
            </ul>
            <button className="subscribe-btn featured-btn">Get Started</button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h2>Enterprise</h2>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">99</span>
              <span className="period">/month</span>
            </div>
          </div>
          <div className="card-body">
            <ul>
              <li><FaCheck className="check-icon" /> Everything in Professional</li>
              <li><FaCheck className="check-icon" /> Custom solutions</li>
              <li><FaCheck className="check-icon" /> 24/7 dedicated support</li>
              <li><FaCheck className="check-icon" /> Advanced API access</li>
              <li><FaCheck className="check-icon" /> Custom integrations</li>
              <li><FaCheck className="check-icon" /> Account manager</li>
            </ul>
            <button className="subscribe-btn">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
