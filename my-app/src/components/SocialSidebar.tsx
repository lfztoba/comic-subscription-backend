import React, { useState } from 'react';
import './SocialSidebar.css';
import { addNewsletterSubscription } from '../firebase';

const SocialSidebar = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await addNewsletterSubscription(email);
      if (result.success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-sidebar">
      <div className="social-links">
        <a href="https://x.com/slashpalooza" target="_blank" rel="noopener noreferrer" className="social-link">
          <i className="fab fa-x-twitter"></i>
          <span>Twitter</span>
        </a>
        <a href="https://www.instagram.com/slashpalooza/" target="_blank" rel="noopener noreferrer" className="social-link">
          <i className="fab fa-instagram"></i>
          <span>Instagram</span>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
          <i className="fab fa-facebook"></i>
          <span>Facebook</span>
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link">
          <i className="fab fa-tiktok"></i>
          <span>TikTok</span>
        </a>
      </div>

      <div className="newsletter-section">
        <h3>Subscribe to Our Newsletter</h3>
        {subscribed ? (
          <p className="success-message">Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default SocialSidebar;
