import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function LoginScreen() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  const submit = async () => {
    // Read straight from the input to avoid mobile state-sync issues
    const e = (inputRef.current?.value || '').trim().toLowerCase();
    if (!e || e.indexOf('@') < 1 || e.indexOf('.') < 0) {
      setErr('Enter a valid email');
      return;
    }
    setBusy(true); setErr('');
    try {
      await base44.auth.loginWithEmail(e);
      window.location.href = '/';
    } catch (e2) {
      setErr(e2.message || 'Login failed');
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#040709',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace", padding: '24px', position: 'relative',
    }}>
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: 42, fontWeight: 700,
          background: 'linear-gradient(90deg, #00d4ff, #39ff7a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 10, letterSpacing: '0.06em',
        }}>
          VoltForge
        </div>
        <div style={{ color: '#2a6070', fontSize: 10, letterSpacing: '0.25em' }}>
          CIRCUIT DESIGN STUDIO
        </div>
      </div>

      <div style={{
        width: '100%', maxWidth: 360,
        background: 'linear-gradient(160deg, #07101c 0%, #050c14 100%)',
        border: '1px solid #0c2030', borderRadius: 20, padding: '32px 28px',
        boxShadow: '0 0 80px rgba(0,212,255,0.05), 0 24px 64px rgba(0,0,0,0.7)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#c8e8f0', fontWeight: 700, marginBottom: 6 }}>
            Welcome
          </div>
          <div style={{ fontSize: 10, color: '#2a6070' }}>
            Enter your email to start building
          </div>
        </div>

        <input
          ref={inputRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          onChange={() => err && setErr('')}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="you@example.com"
          style={{
            width: '100%', padding: '13px 16px', borderRadius: 12, marginBottom: 12,
            border: '1px solid #0e2030', background: '#060e18',
            color: '#c8e8f0', fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
            outline: 'none', boxSizing: 'border-box',
          }}
        />

        {err && <div style={{ color: '#ff5577', fontSize: 10, marginBottom: 10 }}>{err}</div>}

        <button
          onClick={submit}
          disabled={busy}
          style={{
            width: '100%', padding: '13px 16px', borderRadius: 12,
            border: 'none', cursor: busy ? 'default' : 'pointer',
            background: 'linear-gradient(135deg, #00d4ff, #39ff7a)',
            color: '#000', fontSize: 12, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            opacity: busy ? 0.6 : 1, touchAction: 'manipulation',
          }}
        >
          {busy ? '...' : 'Continue →'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 9, color: '#1a4050', lineHeight: 1.9 }}>
          7-day free trial · No card required to start
        </div>
      </div>
    </div>
  );
}
