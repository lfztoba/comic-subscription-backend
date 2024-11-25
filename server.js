const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-netlify-app.netlify.app'] // Replace with your Netlify domain
    : ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, description, isMonthly, email = 'customer@example.com' } = req.body;
    console.log('Received request:', { amount, description, isMonthly, email });

    if (isMonthly) {
      console.log('Creating subscription...');
      
      // Create or get customer
      const customers = await stripe.customers.list({ email });
      let customer;
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('Found existing customer:', customer.id);
      } else {
        customer = await stripe.customers.create({ email });
        console.log('Created new customer:', customer.id);
      }

      // Create product and price
      console.log('Creating product...');
      const product = await stripe.products.create({
        name: description,
        type: 'service',
      });
      console.log('Product created:', product.id);

      console.log('Creating price...');
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      });
      console.log('Price created:', price.id);

      // Create the subscription
      console.log('Creating subscription...');
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      console.log('Subscription created:', subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        customerId: customer.id,
      });
    } else {
      console.log('Creating one-time payment...');
      // One-time payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        description,
        payment_method_types: ['card'],
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Webhook endpoint to handle subscription events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET env var');
    return res.sendStatus(400);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      webhookSecret
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded:', invoice.subscription);
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed:', failedInvoice.subscription);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      console.log('Subscription cancelled:', subscription.id);
      break;
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
