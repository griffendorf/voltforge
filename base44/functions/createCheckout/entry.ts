import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const PLANS = {
  pro: {
    name: 'VoltForge Pro',
    amount: 499, // cents
    interval: 'month',
  },
  premium: {
    name: 'VoltForge Premium',
    amount: 999, // cents
    interval: 'month',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = await req.json();
    const planDef = PLANS[plan];
    if (!planDef) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const origin = req.headers.get('Origin') || 'https://fast-volt-forge-hub.base44.app';
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: planDef.name },
          unit_amount: planDef.amount,
          recurring: { interval: planDef.interval },
        },
        quantity: 1,
      }],
      customer_email: user.email,
      metadata: { user_email: user.email, plan },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });

    console.log('Stripe session created:', session.id, 'for plan:', plan);
    return Response.json({ redirectUrl: session.url });
  } catch (error) {
    console.error('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});