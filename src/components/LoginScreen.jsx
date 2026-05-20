import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function LoginScreen() {
  const login = () => base44.auth.redirectToLogin('/');

  return (
    <div style={{
      minHeight: '100vh', background: '#040709',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace", padding: '24px',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '10%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57,255,122,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
        <div style={{ marginTop: 16, display: 'flex', gap: 20, justifyContent: 'center' }}>
          {['⚡ Simulate', '🔋 Design', '✦ AI Assist'].map(f => (
            <span key={f} style={{ fontSize: 9, color: '#1a5060', letterSpacing: '0.1em' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'linear-gradient(160deg, #07101c 0%, #050c14 100%)',
        border: '1px solid #0c2030',
        borderRadius: 20, padding: '32px 28px',
        boxShadow: '0 0 80px rgba(0,212,255,0.05), 0 24px 64px rgba(0,0,0,0.7)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: '#c8e8f0', fontWeight: 700, marginBottom: 6 }}>
            Welcome back
          </div>
          <div style={{ fontSize: 10, color: '#2a6070' }}>
            Sign in to build and save your circuits
          </div>
        </div>

        {/* Google */}
        <SignInButton onClick={login} hoverColor="#00d4ff" label="Continue with Google">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </SignInButton>

        {/* Apple */}
        <SignInButton onClick={login} hoverColor="#39ff7a" label="Continue with Apple">
          <svg width="18" height="18" viewBox="0 0 814 1000" fill="#e8f4f8">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.4-57.2-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.6 135.4-317.3 270-317.3 71 0 130.1 46.4 174.5 46.4 42.7 0 109.7-49.5 188.2-49.5z"/>
            <path d="M551.5 117.7c-28.8 35.3-74.1 62.7-117.9 62.7-5.5 0-11-.5-16.5-1.4-1-5.1-1.5-10.3-1.5-15.6 0-35 17.8-72.4 43.5-96.5 28.8-27.3 75.7-47.3 115.7-48.5 1 6 1.5 12 1.5 17.5 0 34.5-14.7 70.5-24.8 81.8z"/>
          </svg>
        </SignInButton>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 9, color: '#1a4050', lineHeight: 1.9 }}>
          By signing in you agree to our Terms of Service<br />and Privacy Policy
        </div>
      </div>

      <div style={{ marginTop: 32, fontSize: 8, color: '#0e2a35', letterSpacing: '0.2em' }}>
        POWERED BY BASE44
      </div>
    </div>
  );
}

function SignInButton({ onClick, hoverColor, label, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '13px 16px', borderRadius: 12, marginBottom: 12,
        border: `1px solid ${hovered ? hoverColor + '55' : '#0e2030'}`,
        background: hovered ? '#0a1520' : '#060e18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        cursor: 'pointer', transition: 'all .18s',
        color: '#c8e8f0', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
      }}
    >
      {children}
      {label}
    </button>
  );
}