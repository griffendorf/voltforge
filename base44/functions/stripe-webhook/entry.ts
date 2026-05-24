import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log('Stripe webhook event:', event.type);

    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_email || session.metadata?.user_email;
      const plan = session.metadata?.plan;

      if (email && plan) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            tier: plan,
            status: 'active',
            payment_id: session.subscription,
            checkout_id: session.id,
          });
        } else {
          await base44.asServiceRole.entities.Subscription.create({
            user_email: email,
            tier: plan,
            status: 'active',
            payment_id: session.subscription,
            checkout_id: session.id,
          });
        }
        console.log('Subscription activated for', email, 'plan:', plan);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customer = await stripe.customers.retrieve(sub.customer);
      const email = customer.email;
      if (email) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            tier: 'free',
            status: 'cancelled',
          });
        }
        console.log('Subscription cancelled for', email);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripe-webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});