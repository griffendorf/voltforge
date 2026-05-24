import { T } from '@/lib/voltforge/theme';

const HINTS = [
  { emoji: '➕', title: 'Place components', desc: 'Go to PARTS, pick a component, then tap anywhere on the canvas to place it.' },
  { emoji: '🔴', title: 'Connect with wires', desc: 'Tap the small circle (terminal) on a component and drag it to a terminal on another component.' },
  { emoji: '✋', title: 'Move components', desc: 'Drag any component to reposition it on the canvas.' },
  { emoji: '⏱️', title: 'Edit or delete', desc: 'Long-press a component to select it — then use ✕ to delete or ↻ to rotate.' },
  { emoji: '🤏', title: 'Zoom & pan', desc: 'Pinch to zoom in/out. Drag empty canvas space to pan around.' },
  { emoji: '⬜', title: 'Select multiple', desc: 'Drag across empty canvas to draw a selection box — grab several components and wires at once to move, copy, or delete them together.' },
];

export default function CanvasHints({ onDone }) {
  return (
    <div
      onClick={onDone}
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(5,12,22,0.88)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px', gap: 10,
        animation: 'popIn .2s ease',
      }}>
      <div style={{ fontSize: 11, color: T.blue, letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>
        CANVAS GUIDE
      </div>

      {HINTS.map((h, i) => (
        <div key={i} style={{
          width: '100%', maxWidth: 320,
          background: T.card, border: `1px solid ${T.b2}`,
          borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{h.emoji}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 2 }}>{h.title}</div>
            <div style={{ fontSize: 10, color: T.sub, lineHeight: 1.5 }}>{h.desc}</div>
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 8, padding: '11px 32px', borderRadius: 12, border: 'none',
        background: 'linear-gradient(135deg,#00d4ff,#39ff7a)',
        color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
      }}>
        Got it — let me build! ⚡
      </div>
      <div style={{ fontSize: 10, color: T.dim }}>Tap anywhere to dismiss</div>
    </div>
  );
}