import { useNavigate } from 'react-router-dom';
import { T } from '@/lib/voltforge/theme';

export default function UpgradePrompt({ onClose }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,.72)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 80px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, margin: '0 16px',
          background: '#0d1520',
          border: `1px solid ${T.b2}`,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(0,212,255,.15)',
        }}
      >
        {/* Glow strip */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg,#00d4ff,#a855f7,#39ff7a)',
        }} />

        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
          <div style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(90deg,#00d4ff,#a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            Volt·AI is a Pro feature
          </div>
          <p style={{ fontSize: 12, color: T.sub, lineHeight: 1.6, marginBottom: 20 }}>
            Upgrade to <b style={{ color: T.cyan }}>Pro</b> or <b style={{ color: '#a855f7' }}>Premium</b> to unlock the AI circuit assistant — describe any circuit and watch it get built automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => { navigate('/pricing'); onClose(); }}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#00d4ff,#a855f7)',
                color: '#000', fontWeight: 700, fontSize: 13,
                fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer',
              }}
            >
              ★ See Plans — from $1.99/mo
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '11px', borderRadius: 12,
                border: `1px solid ${T.b2}`, background: 'transparent',
                color: T.sub, fontSize: 12,
                fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}