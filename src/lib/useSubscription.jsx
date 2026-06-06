import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const RANK = { free: 0, pro: 1, premium: 2 };

export function useSubscription() {
  const [tier, setTier] = useState('free');
  const [paidTier, setPaidTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [inTrial, setInTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!active) return;
        setUser(me);
        setTier(me.tier || 'free');
        setPaidTier(me.paidTier || null);
        setInTrial(!!me.inTrial);
        setTrialDaysLeft(me.trialDaysLeft || 0);
      } catch {
        if (active) {
          setUser(null); setTier('free'); setPaidTier(null);
          setInTrial(false); setTrialDaysLeft(0);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const hasAccessTo = (required) => (RANK[tier] ?? 0) >= (RANK[required] ?? 0);

  return { tier, paidTier, loading, user, inTrial, trialDaysLeft, hasAccessTo };
}
