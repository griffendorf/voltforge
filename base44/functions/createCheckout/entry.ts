import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLANS = {
  pro: {
    name: 'VoltForge Pro',
    price: '9.99',
    subscriptionInfo: {
      subscriptionSettings: { frequency: 'MONTH' },
      title: 'VoltForge Pro – Monthly',
      description: 'Unlimited components, wire colors, save/load projects',
    },
  },
  premium: {
    name: 'VoltForge Premium',
    price: '19.99',
    subscriptionInfo: {
      subscriptionSettings: { frequency: 'MONTH' },
      title: 'VoltForge Premium – Monthly',
      description: 'Everything in Pro + AI circuit assistant, priority support',
    },
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

    // Store a pending subscription so we can link it after webhook fires
    await base44.asServiceRole.entities.Subscription.create({
      user_email: user.email,
      tier: plan,
      status: 'pending',
      payment_id: '',
    });

    const response = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Deno.env.get('WIX_PAYMENTS_API_KEY'),
          'wix-site-id': Deno.env.get('WIX_PAYMENTS_SITE_ID'),
        },
        body: JSON.stringify({
          cart: {
            items: [{ name: planDef.name, quantity: 1, price: planDef.price, subscriptionInfo: planDef.subscriptionInfo }],
            customerInfo: { email: user.email },
          },
          callbackUrls: {
            postFlowUrl: `${origin}/pricing`,
            thankYouPageUrl: `${origin}/thank-you`,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Wix checkout error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Checkout failed' }, { status: 500 });
    }

    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    console.error('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});