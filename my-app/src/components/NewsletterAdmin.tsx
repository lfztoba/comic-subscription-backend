import React, { useEffect, useState } from 'react';
import { getNewsletterSubscriptions } from '../firebase';
import './NewsletterAdmin.css';

interface Subscription {
  id: string;
  email: string;
  subscribedAt: {
    toDate: () => Date;
  };
  status: string;
}

const NewsletterAdmin = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await getNewsletterSubscriptions();
        setSubscriptions(data as Subscription[]);
      } catch (err) {
        setError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) return <div className="newsletter-admin-loading">Loading...</div>;
  if (error) return <div className="newsletter-admin-error">{error}</div>;

  return (
    <div className="newsletter-admin">
      <h2>Newsletter Subscriptions</h2>
      <div className="subscription-count">
        Total Subscribers: {subscriptions.length}
      </div>
      <div className="subscription-list">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.email}</td>
                <td>{sub.subscribedAt.toDate().toLocaleDateString()}</td>
                <td>{sub.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsletterAdmin;
