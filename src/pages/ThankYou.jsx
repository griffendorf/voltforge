export default function ThankYou() {
  return (
    <div style={{
      minHeight: '100vh', background: '#040709', color: '#c8e8f0',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 24, padding: 40, textAlign: 'center',
    }}>
      <div style={{ fontSize: 60 }}>⚡</div>
      <div style={{
        fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 700,
        background: 'linear-gradient(90deg,#00d4ff,#39ff7a)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        You're powered up!
      </div>
      <div style={{ color: '#5a8a9a', fontSize: 12, maxWidth: 360, lineHeight: 1.9 }}>
        Payment successful. Your subscription is being activated — it may take a moment to reflect in your account.
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/"
          style={{
            padding: '11px 28px', borderRadius: 10,
            background: 'linear-gradient(135deg,#00d4ff,#00d4ffbb)',
            color: '#000', fontWeight: 700, fontSize: 11, textDecoration: 'none',
          }}>
          Start Building →
        </a>
        <a href="/pricing"
          style={{
            padding: '11px 28px', borderRadius: 10,
            border: '1px solid #00d4ff44', color: '#00d4ff', fontSize: 11, textDecoration: 'none',
          }}>
          View Plan
        </a>
      </div>
    </div>
  );
}