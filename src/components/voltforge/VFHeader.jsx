import { T } from '@/lib/voltforge/theme';

export default function VFHeader({
  simOn, simSnap, simStatus, simCol,
  comps, wires, errors, warnings,
  autoSnap, setAutoSnap,
  canUndo, doUndo,
  zoom, onZoomIn, onZoomOut, onZoomReset,
}) {
  const snap = simSnap;

  return (
    <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center',
                  padding: '0 8px', gap: 6, background: T.panel,
                  borderBottom: `1px solid ${T.b1}`,
                  boxShadow: '0 2px 14px rgba(0,0,0,.8)' }}>

      {/* Logo */}
      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700,
                     background: 'linear-gradient(90deg,#00d4ff,#39ff7a)',
                     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                     flexShrink: 0 }}>
        VF
      </span>

      {/* Undo */}
      <button onClick={doUndo} disabled={!canUndo}
        title="Undo"
        style={{ width: 34, height: 34, minHeight: 0, minWidth: 0, borderRadius: 8, flexShrink: 0,
                 border: `1px solid ${canUndo ? T.blue + '55' : T.dim + '33'}`,
                 background: canUndo ? `${T.blue}10` : 'transparent',
                 color: canUndo ? T.blue : T.dim,
                 fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                 cursor: canUndo ? 'pointer' : 'default', transition: 'all .15s',
                 touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                 userSelect: 'none' }}>
        ↩
      </button>

      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button onClick={onZoomOut}
          style={{ width: 26, height: 26, minHeight: 0, minWidth: 0, borderRadius: 6, border: `1px solid ${T.b2}`,
                   background: T.card, color: T.text, fontSize: 14,
                   display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          −
        </button>
        <button onClick={onZoomReset}
          title="Reset zoom"
          style={{ height: 26, minHeight: 0, padding: '0 6px', borderRadius: 6, border: `1px solid ${T.b2}`,
                   background: T.card, color: zoom !== 1 ? T.cyan : T.sub, fontSize: 8,
                   minWidth: 34, fontFamily: 'JetBrains Mono, monospace' }}>
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={onZoomIn}
          style={{ width: 26, height: 26, minHeight: 0, minWidth: 0, borderRadius: 6, border: `1px solid ${T.b2}`,
                   background: T.card, color: T.text, fontSize: 14,
                   display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ＋
        </button>
      </div>

      {/* Sim status pill */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {simOn && snap && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                        borderRadius: 14, border: `1px solid ${simCol}44`,
                        background: `${simCol}0e`, fontSize: 8, color: simCol }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: simCol,
                          animation: 'pulse 1.8s ease-in-out infinite' }} />
            {simStatus === 'running'
              ? `${snap.Vs.toFixed(1)}V  ${(snap.I * 1000).toFixed(1)}mA`
              : simStatus.toUpperCase()}
          </div>
        )}
        {!simOn && (
          <span style={{ fontSize: 8, color: T.dim }}>
            {comps.length}c · {wires.length}w
            {errors.length > 0 && <span style={{ color: T.red }}> · ✕{errors.length}</span>}
            {warnings.length > 0 && <span style={{ color: T.amber }}> · ⚠{warnings.length}</span>}
          </span>
        )}
      </div>

      {/* AutoSnap toggle */}
      <button
        onClick={() => setAutoSnap(v => !v)}
        title={autoSnap ? 'AutoSnap ON — tap to disable' : 'AutoSnap OFF — tap to enable'}
        style={{
          height: 34, minHeight: 0, minWidth: 0, padding: '0 12px', borderRadius: 9, flexShrink: 0,
          border: `1.5px solid ${autoSnap ? T.cyan : T.b2}`,
          background: autoSnap ? `${T.cyan}18` : T.card,
          color: autoSnap ? T.cyan : T.sub,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
          cursor: 'pointer', touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: autoSnap ? `0 0 10px ${T.cyan}44` : 'none',
          transition: 'all .15s',
        }}>
        {autoSnap ? '⚡ SNAP' : '○ SNAP'}
      </button>
    </div>
  );
}