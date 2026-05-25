import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscription() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!active) return;
        setUser(me);
        const subs = await base44.entities.Subscription.list();
        const mine = (subs || []).find(
          s => s.user_email === me.email && s.status === 'active'
        );
        if (active) setTier(mine ? mine.tier : 'free');
      } catch {
        if (active) setTier('free');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return { tier, loading, user };
}
