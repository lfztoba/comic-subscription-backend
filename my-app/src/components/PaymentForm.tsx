import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { auth } from '../firebase';
import './PaymentForm.css';

interface PaymentFormProps {
  price: number;
  comicTitle: string;
  isMonthly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  price,
  comicTitle,
  isMonthly = false,
  onClose,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('Please sign in to purchase');
      }

      // Create payment intent or subscription on the server
      const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:3001' + '/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: price * 100, // Convert to cents
          description: `${comicTitle}${isMonthly ? ' (Monthly Subscription)' : ''}`,
          isMonthly,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      if (isMonthly) {
        // Handle subscription payment
        const { error: paymentError } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: {
                email: user.email,
                name: user.displayName || undefined,
              },
            },
          }
        );

        if (paymentError) {
          throw new Error(paymentError.message || 'Payment failed');
        }

        // Store subscription details in your database
        // You can use the subscriptionService here to save the subscription
        console.log('Subscription created:', data.subscriptionId);
        
      } else {
        // Handle one-time payment
        const { error: paymentError } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: {
                email: user.email,
                name: user.displayName || undefined,
              },
            },
          }
        );

        if (paymentError) {
          throw new Error(paymentError.message || 'Payment failed');
        }
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-modal">
      <div className="purchase-modal-content">
        <form className="payment-form" onSubmit={handleSubmit}>
          <h3>Purchase Comic</h3>
          <div className="price-container">
            <div className="price">
              ${price.toFixed(2)} {isMonthly && <span className="monthly-label">/ month</span>}
            </div>
            <div className="comic-title">{comicTitle}</div>
            {isMonthly && (
              <div className="subscription-info">
                <div className="subscription-badge">Monthly Subscription</div>
                <p className="subscription-details">
                  You will be charged ${price.toFixed(2)} monthly for access to new chapters.
                  You can cancel your subscription at any time.
                </p>
              </div>
            )}
          </div>

          <div className="card-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          <div className="button-container">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!stripe || loading}
            >
              {loading ? 'Processing...' : `Pay ${isMonthly ? 'Monthly' : 'Now'}`}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};
