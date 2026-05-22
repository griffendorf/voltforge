import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as jose from 'npm:jose@5.9.6';

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const publicKeyPem = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!publicKeyPem) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return new Response('Forbidden', { status: 403 });
    }

    // Step 1: Verify JWT
    const publicKey = await jose.importSPKI(publicKeyPem, 'RS256');
    const { payload: rawPayload } = await jose.jwtVerify(body, publicKey, { algorithms: ['RS256'] });

    // Step 2+3: Double-nested JSON parse
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    console.log('Webhook event type:', event.eventType);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;
      const buyerEmail = order.buyerInfo?.email;

      console.log('Order approved. checkoutId:', checkoutId, 'buyer:', buyerEmail);

      // Determine tier from purchased item name
      let tier = 'pro';
      let subscriptionId = null;
      for (const lineItem of order.lineItems || []) {
        const itemName = lineItem.productName?.original || '';
        if (itemName.toLowerCase().includes('premium')) tier = 'premium';
        if (lineItem.subscriptionInfo?.id) subscriptionId = lineItem.subscriptionInfo.id;
      }

      // Find pending subscription by checkoutId (authoritative link — email can change on Wix checkout)
      let pending = await base44.asServiceRole.entities.Subscription.filter({ checkout_id: checkoutId });
      if (pending.length === 0 && buyerEmail) {
        // Fallback: match by email if no checkout_id record found
        pending = await base44.asServiceRole.entities.Subscription.filter({ user_email: buyerEmail, status: 'pending' });
      }
      if (pending.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(pending[0].id, {
          status: 'active',
          tier,
          payment_id: subscriptionId || order.id,
        });
        console.log('Activated subscription for', pending[0].user_email, 'tier:', tier);
      } else {
        // Create fresh if no pending record exists
        await base44.asServiceRole.entities.Subscription.create({
          user_email: buyerEmail,
          tier,
          status: 'active',
          payment_id: subscriptionId || order.id,
          checkout_id: checkoutId,
        });
        console.log('Created subscription for', buyerEmail, 'tier:', tier);
      }
    } else if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;
      console.log('Subscription ended:', subscriptionId);

      const subs = await base44.asServiceRole.entities.Subscription.filter({ payment_id: subscriptionId });
      for (const sub of subs) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, { status: 'cancelled', tier: 'free' });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response('Error', { status: 500 });
  }
});