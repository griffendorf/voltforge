import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscription() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const subs = await base44.entities.Subscription.filter({ user_email: me.email, status: 'active' });
        if (subs.length > 0) {
          // Pick highest tier
          const tierOrder = { premium: 2, pro: 1, free: 0 };
          const best = subs.reduce((a, b) => (tierOrder[b.tier] > tierOrder[a.tier] ? b : a));
          setTier(best.tier);
        } else {
          setTier('free');
        }
      } catch {
        setTier('free');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { tier, loading, user };
}