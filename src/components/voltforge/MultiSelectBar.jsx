import { T } from '@/lib/voltforge/theme';

const BTN = ({ onClick, children, color, title }) => (
  <button
    onMouseDown={e => e.stopPropagation()}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
    onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onClick(); }}
    onClick={e => { e.stopPropagation(); onClick(); }}
    title={title}
    style={{
      padding: '0 13px', height: 36, minHeight: 0, minWidth: 0, borderRadius: 8,
      border: `1px solid ${(color || T.blue)}44`,
      background: `${(color || T.blue)}18`,
      color: color || T.blue, fontSize: 11, cursor: 'pointer',
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
    }}>
    {children}
  </button>
);

const NUDGE_BTN = ({ onClick, label }) => (
  <button
    onMouseDown={e => e.stopPropagation()}
    onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
    onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onClick(); }}
    onClick={e => { e.stopPropagation(); onClick(); }}
    style={{
      width: 28, height: 28, minHeight: 0, minWidth: 0, borderRadius: 6,
      border: `1px solid ${T.cyan}33`, background: `${T.cyan}12`,
      color: T.cyan, fontSize: 13, cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
    {label}
  </button>
);

export default function MultiSelectBar({ screenX, screenY, count, onDelete, onCopy, onPaste, onMove, hasClipboard }) {
  if (!count) return null;

  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY - 52,
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px',
        background: 'rgba(7,16,28,0.95)',
        border: `1px solid ${T.b2}`,
        borderRadius: 12,
        boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px ${T.blue}22`,
        animation: 'popIn .15s ease both',
        pointerEvents: 'all',
      }}>
      {/* Count badge */}
      <span style={{ fontSize: 9, color: T.dim, paddingRight: 4, borderRight: `1px solid ${T.b1}`, marginRight: 2 }}>
        {count} selected
      </span>

      {/* Move nudge */}
      <div style={{ display: 'flex', gap: 2 }}>
        <NUDGE_BTN label="↑" onClick={() => onMove(0, -20)} />
        <NUDGE_BTN label="↓" onClick={() => onMove(0, 20)} />
        <NUDGE_BTN label="←" onClick={() => onMove(-20, 0)} />
        <NUDGE_BTN label="→" onClick={() => onMove(20, 0)} />
      </div>

      <div style={{ width: 1, height: 24, background: T.b1 }} />

      <BTN onClick={onCopy} title="Copy selection">📋 Copy</BTN>
      {hasClipboard && <BTN onClick={onPaste} color={T.green} title="Paste clipboard">⎋ Paste</BTN>}

      <div style={{ width: 1, height: 24, background: T.b1 }} />

      <BTN onClick={onDelete} color={T.red} title="Delete selection">✕ Delete</BTN>
    </div>
  );
}