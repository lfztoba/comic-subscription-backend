import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your public key
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');
