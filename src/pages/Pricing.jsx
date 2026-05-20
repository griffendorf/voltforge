import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/lib/useSubscription';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#888',
    features: ['Up to 10 components', 'Basic wire colors', 'Circuit simulation', 'Manual save/load'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    color: '#00d4ff',
    features: ['Unlimited components', 'All wire colors', 'Circuit simulation', 'Cloud save/load', 'Undo history (50 steps)'],
    badge: 'POPULAR',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    period: '/month',
    color: '#39ff7a',
    features: ['Everything in Pro', 'AI circuit assistant', 'Priority support', 'Undo history (unlimited)', 'Export diagrams'],
    badge: 'BEST VALUE',
  },
];

export default function Pricing() {
  const { tier, loading, user } = useSubscription();
  const [upgrading, setUpgrading] = useState(null);
  const [error, setError] = useState('');

  async function handleUpgrade(plan) {
    if (!user) { base44.auth.redirectToLogin(window.location.pathname); return; }
    setUpgrading(plan);
    setError('');
    try {
      const res = await base44.functions.invoke('createCheckout', { plan });
      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        setError(res.data?.error || 'Something went wrong');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#040709', color: '#c8e8f0',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px',
    }}>
      {/* Back */}
      <div style={{ width: '100%', maxWidth: 900, marginBottom: 32 }}>
        <a href="/" style={{ color: '#00d4ff', fontSize: 11, textDecoration: 'none' }}>← Back to VoltForge</a>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 700,
          background: 'linear-gradient(90deg,#00d4ff,#39ff7a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 10,
        }}>
          VoltForge Plans
        </div>
        <div style={{ color: '#5a8a9a', fontSize: 12 }}>
          Choose the plan that powers your circuits
        </div>
        {!loading && tier !== 'free' && (
          <div style={{
            marginTop: 12, padding: '6px 18px', borderRadius: 20, display: 'inline-block',
            background: '#00d4ff18', border: '1px solid #00d4ff44', color: '#00d4ff', fontSize: 10,
          }}>
            Current plan: <strong style={{ textTransform: 'uppercase' }}>{tier}</strong>
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center',
        width: '100%', maxWidth: 900,
      }}>
        {PLANS.map(plan => {
          const isCurrent = tier === plan.id;
          const isUpgrading = upgrading === plan.id;
          return (
            <div key={plan.id} style={{
              flex: '1 1 240px', maxWidth: 280,
              background: plan.id === 'pro' ? 'linear-gradient(135deg,#061520,#091e2e)' : '#07101c',
              border: `1.5px solid ${isCurrent ? plan.color : plan.color + '33'}`,
              borderRadius: 16, padding: 28, position: 'relative',
              boxShadow: isCurrent ? `0 0 20px ${plan.color}44` : plan.id === 'pro' ? `0 0 14px #00d4ff22` : 'none',
              transition: 'box-shadow .2s',
            }}>
              {/* Color stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                            background: plan.color, borderRadius: '16px 16px 0 0', opacity: .7 }} />

              {plan.badge && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: plan.color, color: '#000', fontSize: 7, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 6,
                }}>
                  {plan.badge}
                </div>
              )}
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: plan.color + '22', border: `1px solid ${plan.color}55`,
                  color: plan.color, fontSize: 7, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 6,
                }}>
                  ✓ ACTIVE
                </div>
              )}

              <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 6 }}>
                {plan.name}
              </div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#e8f4f8' }}>{plan.price}</span>
                <span style={{ fontSize: 10, color: '#5a8a9a' }}>{plan.period}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: 10, color: '#9ab8c8', display: 'flex', gap: 8 }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
              </div>

              {plan.id === 'free' ? (
                <div style={{
                  textAlign: 'center', padding: '10px', borderRadius: 10,
                  border: '1px solid #ffffff11', color: '#5a8a9a', fontSize: 10,
                }}>
                  {isCurrent ? 'Your current plan' : 'No payment needed'}
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || isUpgrading}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                    background: isCurrent ? plan.color + '22'
                      : `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                    color: isCurrent ? plan.color : '#000',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                    cursor: isCurrent ? 'default' : 'pointer',
                    opacity: isUpgrading ? .7 : 1,
                    transition: 'opacity .15s',
                    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {isCurrent ? '✓ Current Plan' : isUpgrading ? '...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: 24, color: '#ff4444', fontSize: 11, background: '#ff000011',
                      border: '1px solid #ff444433', borderRadius: 8, padding: '10px 20px' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 48, color: '#3a6a7a', fontSize: 9, textAlign: 'center', lineHeight: 2 }}>
        Payments secured by Base44 Payments · Cancel anytime from your account
      </div>
    </div>
  );
}