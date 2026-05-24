import { T } from '@/lib/voltforge/theme';

const ActionBtn = ({ icon, label, onClick, color, disabled }) => (
  <button
    onMouseDown={e => e.stopPropagation()}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
    onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); if (!disabled) onClick(); }}
    onClick={e => { e.stopPropagation(); if (!disabled) onClick(); }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 2, padding: '0 14px', height: '100%', minHeight: 0, minWidth: 0,
      border: 'none', background: 'transparent',
      color: disabled ? '#444' : (color || '#e0e0e0'),
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
      borderRadius: 0,
    }}>
    <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
    <span style={{ fontSize: 9, letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
  </button>
);

const NudgeBtn = ({ label, onClick }) => (
  <button
    onMouseDown={e => e.stopPropagation()}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
    onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onClick(); }}
    onClick={e => { e.stopPropagation(); onClick(); }}
    style={{
      width: 32, height: 32, borderRadius: 6, border: 'none',
      background: 'rgba(255,255,255,0.07)',
      color: '#b0b0b0', fontSize: 15, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 0, minWidth: 0,
    }}>
    {label}
  </button>
);

const Divider = () => (
  <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
);

export default function MultiSelectBar({ count, onDelete, onCopy, onPaste, onMove, hasClipboard }) {
  if (!count) return null;

  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      style={{
        zIndex: 200,
        height: 56,
        display: 'flex', alignItems: 'center',
        background: '#1c1c1e',
        borderRadius: 14,
        boxShadow: '0 4px 20px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        animation: 'popIn .15s ease both',
        pointerEvents: 'all',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}>

      {/* Count badge */}
      <div style={{
        padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: 10, color: '#888', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
          {count} sel
        </span>
      </div>

      {/* Nudge cluster */}
      <div style={{ display: 'flex', gap: 3, padding: '0 10px', alignItems: 'center', height: '100%' }}>
        <NudgeBtn label="↑" onClick={() => onMove(0, -20)} />
        <NudgeBtn label="↓" onClick={() => onMove(0, 20)} />
        <NudgeBtn label="←" onClick={() => onMove(-20, 0)} />
        <NudgeBtn label="→" onClick={() => onMove(20, 0)} />
      </div>

      <Divider />

      <ActionBtn icon="📋" label="COPY" onClick={onCopy} />

      {hasClipboard && <>
        <ActionBtn icon="⎋" label="PASTE" onClick={onPaste} color={T.green} />
      </>}

      <Divider />

      <ActionBtn icon="✕" label="DELETE" onClick={onDelete} color="#ff4444" />
    </div>
  );
}