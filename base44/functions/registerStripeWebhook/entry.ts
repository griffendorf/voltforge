import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const origin = req.headers.get('origin') || 'https://voltforge.base44.app';
    const webhookUrl = `${origin}/api/functions/stripe-webhook`;

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    const res = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams([
        ['url', webhookUrl],
        ['enabled_events[]', 'checkout.session.completed'],
        ['enabled_events[]', 'customer.subscription.deleted'],
        ['description', 'VoltForge subscription webhook'],
      ]),
    });

    const data = await res.json();
    console.log('Stripe webhook registration response:', JSON.stringify(data));

    if (data.error) {
      return Response.json({ error: data.error.message, raw: data }, { status: 400 });
    }

    return Response.json({
      success: true,
      webhook_id: data.id,
      url: data.url,
      signing_secret: data.secret,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});