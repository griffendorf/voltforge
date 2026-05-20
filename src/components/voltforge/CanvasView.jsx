import { T, CW, CH, STATE_COL } from '@/lib/voltforge/theme';
import { DEFS } from '@/lib/voltforge/definitions';
import { G } from '@/lib/voltforge/instances';
import { bezier } from '@/lib/voltforge/routing';

export default function CanvasView({
  cvRef, rbSvgRef, comps, wires, placing, isDrawing, selected,
  wColor, snap,
  issuesByComp, aiHL,
  zoom, pan,
  onCanvasTouchStart, onCanvasMouseDown,
  onCompPress, onTermPress, setWColor, setSelected, bump,
  isRewire,
}) {
  const hint = isRewire ? 'Drag wire end to a new terminal'
    : isDrawing ? 'Drag to a terminal to connect'
    : placing ? `Tap canvas to place ${DEFS[placing]?.label}`
    : null;
  const hintCol = isRewire ? T.amber : isDrawing ? T.cyan : T.blue;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Hint banner */}
      {hint && (
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                      zIndex: 50, padding: '5px 16px', borderRadius: 20, fontSize: 10,
                      pointerEvents: 'none', background: `${hintCol}18`,
                      border: `1px solid ${hintCol}55`, color: hintCol, whiteSpace: 'nowrap',
                      animation: placing ? 'pulse 1.2s ease-in-out infinite' : 'none' }}>
          {hint}
        </div>
      )}

      {/* Long-press hint (bottom-left) */}
      {comps.length > 0 && !isDrawing && !placing && !selected && (
        <div style={{ position: 'absolute', bottom: 56, left: 10, zIndex: 20,
                      fontSize: 8, color: T.dim, pointerEvents: 'none',
                      padding: '4px 8px', borderRadius: 8,
                      background: 'rgba(7,16,28,.7)' }}>
          Hold component to edit · Hold terminal to rewire
        </div>
      )}

      {/* Empty state */}
      {comps.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 16,
                      pointerEvents: 'none' }}>
          <div style={{ fontSize: 52, opacity: .1 }}>⚡</div>
          <div style={{ fontSize: 12, color: T.dim, textAlign: 'center', lineHeight: 2.2 }}>
            Tap <b style={{ color: T.blue }}>＋ PARTS</b> to pick a component<br />
            then tap the canvas to place it
          </div>
        </div>
      )}

      {/* Canvas surface */}
      <div
        ref={cvRef}
        data-cv="true"
        onMouseDown={onCanvasMouseDown}
        onTouchStart={onCanvasTouchStart}
        style={{
          width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
          cursor: placing ? 'crosshair' : isDrawing ? 'crosshair' : 'default',
          backgroundImage:
            'linear-gradient(rgba(0,212,255,.04) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(0,212,255,.04) 1px,transparent 1px),' +
            'linear-gradient(rgba(0,212,255,.014) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(0,212,255,.014) 1px,transparent 1px)',
          backgroundSize: '80px 80px,80px 80px,20px 20px,20px 20px',
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Zoom/pan transform layer */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: 4000, height: 4000,
        }}>

          {/* SVG wire layer (static wires only) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                        pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
            <defs>
              <filter id="gl">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {wires.map(w => {
              const tA = G.terminals.get(w.from), tB = G.terminals.get(w.to);
              if (!tA || !tB) return null;
              const wo = snap?.wires?.get(w.id);
              const act = wo?.active ?? false;
              const fi = wo?.fi ?? 0;
              const col = act ? (fi > 0.6 ? T.green : fi > 0.3 ? T.cyan : T.blue) : w.color;
              const d = bezier(tA.wx, tA.wy, tA.dir, tB.wx, tB.wy, tB.dir);
              const Va = snap?.termV?.get(w.from);
              return (
                <g key={w.id}>
                  {act && <path d={d} fill="none" stroke={col} strokeWidth={8}
                                strokeLinecap="round" opacity={.14} />}
                  <path d={d} fill="none" stroke={col} strokeWidth={2.5}
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: act ? '10 6' : undefined,
                          animation: act ? `wireFlow ${Math.max(0.3, 1.4 - fi).toFixed(2)}s linear infinite` : undefined,
                          cursor: 'pointer', pointerEvents: 'stroke',
                        }}
                        onMouseDown={e => { e.stopPropagation(); G.removeWire(w.id); bump(); }}
                        onTouchStart={e => { e.stopPropagation(); G.removeWire(w.id); bump(); }} />
                  {Va != null && act && (
                    <text x={(tA.wx + tB.wx) / 2} y={(tA.wy + tB.wy) / 2 - 8}
                          fill={col} fontSize={7} textAnchor="middle" opacity={.85}
                          style={{ fontFamily: 'JetBrains Mono', pointerEvents: 'none' }}>
                      {Va.toFixed(1)}V
                    </text>
                  )}
                </g>
              );
            })}

            {/* Imperative rubber-band overlay (hidden by default, updated via rbSvgRef) */}
            <g ref={rbSvgRef} style={{ display: 'none', pointerEvents: 'none' }}>
              <path fill="none" strokeWidth={8} strokeLinecap="round" opacity={.14} />
              <path fill="none" strokeWidth={2.5} strokeLinecap="round" opacity={.9} />
              <circle r={10} fill="none" strokeWidth={2}
                      style={{ animation: 'snapRing 1s ease-out infinite' }} />
            </g>
          </svg>

          {/* Components */}
          {comps.map(comp => {
            const def = DEFS[comp.type];
            if (!def) return null;
            const isSel = comp.id === selected;
            const bh = snap?.bh?.get(comp.id) ?? null;
            const compIss = issuesByComp.get(comp.id) || [];
            const hasErr = compIss.some(i => i.severity === 'error');
            const hasWarn = compIss.some(i => i.severity === 'warning');
            const issColor = hasErr ? T.red : hasWarn ? T.amber : null;
            const simBCol = bh
              ? (bh.state === 'ON' ? T.green : bh.state === 'ACTIVE' ? T.cyan
                : bh.state === 'FAULT' ? T.red : null) : null;
            const isAiHL = aiHL.compIds.includes(comp.id);
            const aiHLCol = { info: T.blue, warning: T.amber, error: T.red, success: T.green }[aiHL.type] || T.blue;
            const borderColor = isSel ? T.blue : isAiHL ? aiHLCol : simBCol || issColor || T.b2;
            const glowColor = isSel ? T.blue : isAiHL ? aiHLCol : simBCol || issColor;

            return (
              <div key={comp.id}
                data-comp-id={comp.id}
                style={{
                  position: 'absolute', left: comp.x, top: comp.y,
                  width: CW, height: CH, zIndex: isSel ? 20 : 10,
                  touchAction: 'none', animation: 'popIn .2s ease both',
                }}
                onMouseDown={e => onCompPress(comp.id, e)}
                onTouchStart={e => onCompPress(comp.id, e)}
              >
                {/* Card */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 13,
                  background: T.card, border: `1.5px solid ${borderColor}`,
                  boxShadow: isSel
                    ? `0 0 0 2.5px ${T.blue}44, 0 0 20px ${T.blue}22`
                    : glowColor ? `0 0 0 2px ${glowColor}44, 0 0 14px ${glowColor}28`
                    : '0 2px 10px rgba(0,0,0,.45)',
                  cursor: 'grab', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3,
                  overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                background: def.color, opacity: .65, borderRadius: '13px 13px 0 0' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 13,
                                background: 'linear-gradient(135deg,rgba(255,255,255,.05),transparent)',
                                pointerEvents: 'none' }} />
                  {bh && bh.powerLevel > 0 && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3,
                                  width: `${bh.powerLevel * 100}%`, background: STATE_COL[bh.state] ?? T.sub,
                                  borderRadius: '0 0 0 13px', transition: 'width .2s' }} />
                  )}
                  {bh && bh.state !== 'OFF' && (
                    <div style={{
                      position: 'absolute', top: -8, left: '50%',
                      transform: 'translateX(-50%)', padding: '1px 6px',
                      borderRadius: 5, fontSize: 7, fontWeight: 700,
                      background: STATE_COL[bh.state] ?? T.sub, color: '#000',
                      whiteSpace: 'nowrap', zIndex: 6,
                      animation: bh.state === 'FAULT' ? 'stateBlink .6s ease-in-out infinite' : 'none',
                    }}>
                      {bh.state}
                    </div>
                  )}
                  <span style={{ fontSize: 22, lineHeight: 1, position: 'relative' }}>{def.emoji}</span>
                  <span style={{
                    fontSize: 8, color: T.sub, letterSpacing: '.04em', position: 'relative',
                    maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {comp.label}
                  </span>

                  {(comp.type === 'switch_' || comp.type === 'pushbtn') && (
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); comp._closed = !comp._closed; bump(); }}
                      onClick={e => { e.stopPropagation(); comp._closed = !comp._closed; bump(); }}
                      style={{
                        position: 'absolute', bottom: 4, right: 4, width: 16, height: 16,
                        borderRadius: 4, border: 'none', fontSize: 9, cursor: 'pointer',
                        background: comp._closed ? T.green : T.red, color: '#000',
                        touchAction: 'none', zIndex: 8,
                      }}>
                      {comp._closed ? '●' : '○'}
                    </button>
                  )}
                  {((comp.type === 'fuse' && comp._blown) || (comp.type === 'breaker' && comp._tripped)) && (
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchEnd={e => {
                        e.stopPropagation(); e.preventDefault();
                        if (comp.type === 'fuse') comp._blown = false;
                        if (comp.type === 'breaker') comp._tripped = false;
                        bump();
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        if (comp.type === 'fuse') comp._blown = false;
                        if (comp.type === 'breaker') comp._tripped = false;
                        bump();
                      }}
                      style={{
                        position: 'absolute', bottom: 3, right: 3, width: 18, height: 18,
                        borderRadius: 5, border: 'none', fontSize: 11, cursor: 'pointer',
                        background: T.amber, color: '#000', touchAction: 'none', zIndex: 8,
                      }}>↺</button>
                  )}
                </div>

                {/* Delete / Rotate buttons (long-press) */}
                {isSel && (
                  <>
                    <button
                      onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); G.removeComponent(comp.id); setSelected(null); bump(); }}
                      onClick={e => { e.stopPropagation(); G.removeComponent(comp.id); setSelected(null); bump(); }}
                      style={{
                        position: 'absolute', top: -12, right: -12, width: 28, height: 28,
                        borderRadius: '50%', border: 'none', background: T.red, color: '#fff',
                        fontSize: 14, zIndex: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', boxShadow: `0 0 10px ${T.red}99`,
                        touchAction: 'none', animation: 'popIn .15s ease both',
                      }}>✕</button>
                    <button
                      onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchStart={e => { e.stopPropagation(); e.preventDefault(); }}
                      onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); G.rotateComponent(comp.id); setSelected(comp.id); bump(); }}
                      onClick={e => { e.stopPropagation(); G.rotateComponent(comp.id); setSelected(comp.id); bump(); }}
                      style={{
                        position: 'absolute', top: -12, left: -12, width: 28, height: 28,
                        borderRadius: '50%', border: 'none', background: T.purple, color: '#fff',
                        fontSize: 14, zIndex: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', boxShadow: `0 0 10px ${T.purple}99`,
                        touchAction: 'none', animation: 'popIn .15s ease both',
                      }}>↻</button>
                  </>
                )}

                {/* Terminals */}
                {comp.termIds.map(tid => {
                  const t = G.terminals.get(tid);
                  if (!t) return null;
                  const wired = t.wireIds.size > 0;
                  const tColor = wired ? T.blue : T.sub;
                  const sz = wired ? 21 : 19;
                  return (
                    <div key={tid}
                      onMouseDown={e => onTermPress(tid, comp.id, e)}
                      onTouchStart={e => onTermPress(tid, comp.id, e)}
                      style={{
                        position: 'absolute', left: t.lp.x - sz / 2, top: t.lp.y - sz / 2,
                        width: sz, height: sz, borderRadius: '50%',
                        border: `2.5px solid ${tColor}`,
                        background: wired ? `${tColor}18` : T.bg,
                        cursor: 'crosshair', zIndex: 30, touchAction: 'none',
                        boxShadow: wired ? `0 0 5px ${tColor}66` : 'none',
                      }} />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Wire colour picker */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 20,
          display: 'flex', gap: 6, padding: '7px 10px', borderRadius: 20,
          background: 'rgba(7,16,28,.92)', border: `1px solid ${T.b1}`,
        }}>
          {[T.blue, T.cyan, T.green, T.amber, T.red, T.purple].map(c => (
            <div key={c} onClick={() => setWColor(c)}
              style={{
                width: 18, height: 18, borderRadius: '50%', background: c, cursor: 'pointer',
                border: `2.5px solid ${wColor === c ? '#fff' : 'transparent'}`,
                transform: wColor === c ? 'scale(1.25)' : 'scale(1)', transition: 'all .15s',
                boxShadow: wColor === c ? `0 0 7px ${c}` : 'none',
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}