import { T, CW, CH, STATE_COL } from '@/lib/voltforge/theme';
import CanvasHints from '@/components/voltforge/CanvasHints';
import MultiSelectBar from '@/components/voltforge/MultiSelectBar';
import { DEFS } from '@/lib/voltforge/definitions';
import { G } from '@/lib/voltforge/instances';
import { bezier } from '@/lib/voltforge/routing';
import { useState } from 'react';
import WireColorPicker from '@/components/voltforge/WireColorPicker';

export default function CanvasView({
  cvRef, rbSvgRef, comps, wires, placing, isDrawing, selected,
  wColor, snap, simOn, errors,
  issuesByComp, aiHL,
  zoom, pan,
  onCanvasTouchStart, onCanvasMouseDown,
  onCompPress, onTermPress, setWColor, setSelected, bump,
  isRewire, onWireLongPress,
  multiSelect, setMultiSelect, wireTouchedRef, selectionRect,
  clipboard, onMultiDelete, onMultiCopy, onMultiPaste, onMultiMove,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHints, setShowHints] = useState(() => !localStorage.getItem('vf_canvas_hints'));
  const dismissHints = () => { localStorage.setItem('vf_canvas_hints', '1'); setShowHints(false); };
  const simHasErrors = simOn && errors?.length > 0;
  const simRunning = simOn && !simHasErrors;
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
                        pointerEvents: 'all', zIndex: 5, overflow: 'visible' }}>
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
              const isWireSel = multiSelect?.has(w.id);
              const col = isWireSel ? T.cyan : act ? (fi > 0.6 ? T.green : fi > 0.3 ? T.cyan : T.blue) : w.color;
              const d = bezier(tA.wx, tA.wy, tA.dir, tB.wx, tB.wy, tB.dir);
              const Va = snap?.termV?.get(w.from);

              // Long-press rewire
              let wireLpTimer = null;
              const startWirePress = (e, isTouch) => {
                e.stopPropagation();
                if (wireTouchedRef) wireTouchedRef.current = true;
                const s = e.touches?.[0] || e.changedTouches?.[0] || e;
                const clientX = s.clientX, clientY = s.clientY;
                const r = cvRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
                const wx = (clientX - r.left - pan.x) / zoom;
                const wy = (clientY - r.top - pan.y) / zoom;
                // Pick which terminal is closer to press point
                const dA = Math.hypot(wx - tA.wx, wy - tA.wy);
                const dB = Math.hypot(wx - tB.wx, wy - tB.wy);
                const [nearTerm, farTerm] = dA < dB ? [tA, tB] : [tB, tA];
                wireLpTimer = setTimeout(() => {
                  wireLpTimer = null;
                  onWireLongPress(w.id, farTerm.id, nearTerm.id, w.color, wx, wy);
                }, 420);
                const cancel = () => {
                  if (wireLpTimer) {
                    clearTimeout(wireLpTimer);
                    wireLpTimer = null;
                    if (multiSelect?.has(w.id)) {
                      setMultiSelect(prev => { const n = new Set(prev); n.delete(w.id); return n; });
                    } else {
                      G.removeWire(w.id); bump();
                    }
                  }
                  window.removeEventListener(isTouch ? 'touchend' : 'mouseup', cancel);
                };
                window.addEventListener(isTouch ? 'touchend' : 'mouseup', cancel);
              };

              return (
                <g key={w.id}>
                  {isWireSel && <path d={d} fill="none" stroke={T.cyan} strokeWidth={14}
                                strokeLinecap="round" opacity={.22} />}
                  {(act || isWireSel) && <path d={d} fill="none" stroke={col} strokeWidth={8}
                                strokeLinecap="round" opacity={isWireSel ? .35 : .14} />}
                  <path d={d} fill="none" stroke={col} strokeWidth={2.5}
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: act ? '10 6' : undefined,
                          animation: act ? `wireFlow ${Math.max(0.3, 1.4 - fi).toFixed(2)}s linear infinite` : undefined,
                          cursor: 'pointer', pointerEvents: 'stroke',
                        }}
                        onMouseDown={e => startWirePress(e, false)}
                        onTouchStart={e => startWirePress(e, true)} />
                  {/* Wide invisible hit area */}
                  <path d={d} fill="none" stroke="transparent" strokeWidth={18}
                        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                        onMouseDown={e => startWirePress(e, false)}
                        onTouchStart={e => startWirePress(e, true)} />
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

          {/* Selection rectangle overlay */}
          {selectionRect && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                        pointerEvents: 'none', zIndex: 6, overflow: 'visible' }}>
            <rect
              x={Math.min(selectionRect.x1, selectionRect.x2)}
              y={Math.min(selectionRect.y1, selectionRect.y2)}
              width={Math.abs(selectionRect.x2 - selectionRect.x1)}
              height={Math.abs(selectionRect.y2 - selectionRect.y1)}
              fill="rgba(0,212,255,0.06)"
              stroke="#00d4ff"
              strokeWidth={1.5 / zoom}
              strokeDasharray={`${6 / zoom} ${4 / zoom}`}
            />
          </svg>
          )}

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
            const isMultiSel = multiSelect?.has(comp.id);
            const aiHLCol = { info: T.blue, warning: T.amber, error: T.red, success: T.green }[aiHL.type] || T.blue;

            // Sim glow effects
            const isLit = simRunning && bh?.state === 'ON' && (comp.type === 'bulb' || comp.type === 'led');
            const litColor = comp.type === 'bulb' ? '#ffe066' : def.color;
            const isErrorComp = simHasErrors && hasErr;
            const isHotComp = simRunning && comp.type !== 'bulb' && comp.type !== 'led';
            const hotColor = '#ff6b00';
            const errGlowColor = T.red;

            const borderColor = isMultiSel ? T.cyan
              : isSel ? T.blue
              : isLit ? litColor
              : isErrorComp ? errGlowColor
              : isHotComp ? hotColor
              : isAiHL ? aiHLCol : simBCol || issColor || T.b2;
            const glowColor = isMultiSel ? T.cyan
              : isSel ? T.blue
              : isLit ? litColor
              : isErrorComp ? errGlowColor
              : isHotComp ? hotColor
              : isAiHL ? aiHLCol : simBCol || issColor;

            return (
              <div key={comp.id}
                data-comp-id={comp.id}
                style={{
                  position: 'absolute', left: comp.x, top: comp.y,
                  width: CW, height: CH, zIndex: isMultiSel ? 15 : isSel ? 20 : 10,
                  touchAction: 'none', animation: 'popIn .2s ease both',
                }}
                onMouseDown={e => onCompPress(comp.id, e)}
                onTouchStart={e => onCompPress(comp.id, e)}
              >
                {/* Card */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 13,
                  background: isLit && comp.type === 'bulb'
                    ? 'radial-gradient(ellipse at center, #2a2000 0%, #100e00 100%)'
                    : isLit && comp.type === 'led'
                    ? `radial-gradient(ellipse at center, #002a1a 0%, #000d08 100%)`
                    : isHotComp
                    ? 'radial-gradient(ellipse at center, #1a0d00 0%, #0d0a08 100%)'
                    : isErrorComp
                    ? 'radial-gradient(ellipse at center, #1a0000 0%, #0d0808 100%)'
                    : T.card,
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: isMultiSel
                    ? `0 0 0 2px ${T.cyan}55, 0 0 16px ${T.cyan}33`
                    : isSel
                    ? `0 0 0 2.5px ${T.blue}44, 0 0 20px ${T.blue}22`
                    : isHotComp
                    ? `0 0 0 2px ${hotColor}66, 0 0 18px ${hotColor}55, 0 0 35px ${hotColor}22`
                    : isErrorComp
                    ? `0 0 0 2px ${errGlowColor}88, 0 0 18px ${errGlowColor}66, 0 0 35px ${errGlowColor}33`
                    : glowColor ? `0 0 0 2px ${glowColor}44, 0 0 14px ${glowColor}28`
                    : '0 2px 10px rgba(0,0,0,.45)',
                  cursor: 'grab', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3,
                  overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s, background .3s',
                  animation: isErrorComp ? 'stateBlink .8s ease-in-out infinite' : 'none',
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

                  {/* Bulb glow overlay */}
                  {(comp.type === 'bulb' || comp.type === 'led') && bh?.state === 'ON' && (
                    <div style={{
                      position: 'absolute', inset: -8, borderRadius: 18, pointerEvents: 'none',
                      background: comp.type === 'bulb'
                        ? 'radial-gradient(ellipse at center, rgba(255,230,100,0.55) 0%, rgba(255,180,0,0.18) 50%, transparent 75%)'
                        : `radial-gradient(ellipse at center, ${def.color}88 0%, ${def.color}28 50%, transparent 75%)`,
                      animation: 'pulse 1.1s ease-in-out infinite',
                      zIndex: 1,
                    }} />
                  )}

                  {/* LED symbol */}
                  {comp.type === 'led' ? (
                    <svg width="28" height="24" viewBox="0 0 28 24" style={{ position: 'relative', zIndex: 2 }}>
                      {/* Diode triangle */}
                      <polygon points="6,4 6,20 18,12" fill={bh?.state === 'ON' ? def.color : '#444'}
                        stroke={bh?.state === 'ON' ? def.color : '#666'} strokeWidth="1.5"/>
                      {/* Cathode bar */}
                      <line x1="18" y1="4" x2="18" y2="20" stroke={bh?.state === 'ON' ? def.color : '#666'} strokeWidth="2"/>
                      {/* Light rays when ON */}
                      {bh?.state === 'ON' && (
                        <>
                          <line x1="21" y1="6" x2="26" y2="3" stroke={def.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                          <line x1="22" y1="10" x2="27" y2="9" stroke={def.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                          <line x1="21" y1="14" x2="26" y2="16" stroke={def.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                        </>
                      )}
                    </svg>
                  ) : comp.type === 'bulb' ? (
                    <svg width="26" height="28" viewBox="0 0 26 28" style={{ position: 'relative', zIndex: 2 }}>
                      {/* Bulb glass dome */}
                      <path d="M13,3 C7,3 3,7.5 3,13 C3,17 5.5,20.5 9,22 L9,24 L17,24 L17,22 C20.5,20.5 23,17 23,13 C23,7.5 19,3 13,3 Z"
                        fill={bh?.state === 'ON' ? '#ffe066' : '#2a2a2a'}
                        stroke={bh?.state === 'ON' ? '#ffcc00' : '#555'} strokeWidth="1.5"
                        style={{ transition: 'fill 0.15s, stroke 0.15s' }}/>
                      {/* Filament */}
                      <path d="M10,24 L10,26 L16,26 L16,24" fill="none"
                        stroke={bh?.state === 'ON' ? '#ffaa00' : '#555'} strokeWidth="1.5"/>
                      {/* Base lines */}
                      <line x1="10" y1="26" x2="16" y2="26" stroke={bh?.state === 'ON' ? '#ffaa00' : '#555'} strokeWidth="1"/>
                    </svg>
                  ) : (
                    <span style={{
                      fontSize: 22, lineHeight: 1, position: 'relative', display: 'inline-block', zIndex: 2,
                      animation: comp.type === 'motor' && bh?.state === 'ACTIVE'
                        ? `spin ${Math.max(0.3, 1 - (bh.powerLevel ?? 0) * 0.7)}s linear infinite`
                        : 'none',
                      animationDirection: comp.type === 'motor' && bh?.reversed ? 'reverse' : 'normal',
                    }}>{def.emoji}</span>
                  )}
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
                        position: 'absolute', bottom: 3, right: 3, width: 22, height: 22,
                        minHeight: 0, minWidth: 0,
                        borderRadius: 6, border: 'none', fontSize: 11, cursor: 'pointer',
                        background: comp._closed ? T.green : '#ff4444', color: '#000',
                        touchAction: 'none', zIndex: 8, fontWeight: 700,
                        boxShadow: comp._closed ? `0 0 8px ${T.green}88` : '0 0 8px #ff444488',
                      }}>
                      {comp._closed ? '●' : '○'}
                    </button>
                  )}
                  {comp.type === 'spdt' && (
                    <div style={{ position:'absolute', bottom:3, left:3, right:3, display:'flex', gap:2, zIndex:8 }}
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => e.stopPropagation()}>
                      {[['nc','NC','#ff8c00'],['off','·','#555'],['no','NO',T.green]].map(([pos,lbl,col]) => (
                        <button key={pos}
                          onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); comp._position = pos; bump(); }}
                          onClick={e => { e.stopPropagation(); comp._position = pos; bump(); }}
                          style={{ flex:1, height:16, minHeight:0, minWidth:0, borderRadius:4, border:'none', fontSize:8, cursor:'pointer',
                                   fontWeight:700, touchAction:'none',
                                   background: comp._position === pos ? col : '#222',
                                   color: comp._position === pos ? '#000' : '#555' }}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  )}
                  {comp.type === 'dpdt' && (
                    <div style={{ position:'absolute', bottom:3, left:2, right:2, display:'flex', gap:2, zIndex:8 }}
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => e.stopPropagation()}>
                      {[['rev','◀ REV','#ffd700'],['off','·','#555'],['fwd','FWD ▶',T.green]].map(([pos,lbl,col]) => (
                        <button key={pos}
                          onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); comp._position = pos; bump(); }}
                          onClick={e => { e.stopPropagation(); comp._position = pos; bump(); }}
                          style={{ flex:1, height:18, minHeight:0, minWidth:0, borderRadius:5, border:'none', fontSize:8, cursor:'pointer',
                                   fontWeight:700, touchAction:'none',
                                   background: comp._position === pos ? col : '#222',
                                   color: comp._position === pos ? '#000' : '#555',
                                   boxShadow: comp._position === pos ? `0 0 6px ${col}88` : 'none' }}>
                          {lbl}
                        </button>
                      ))}
                    </div>
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
                        minHeight: 0, minWidth: 0,
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
                        minHeight: 0, minWidth: 0,
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
                        minHeight: 0, minWidth: 0,
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

        {/* Wire line-type picker */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 20,
        }}>
          <button
            onClick={() => setShowColorPicker(true)}
            style={{
              height: 44, padding: '0 16px', borderRadius: 10,
              background: 'rgba(7,16,28,.95)', border: `2px solid ${wColor}66`,
              color: wColor, fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
              fontWeight: 700, cursor: 'pointer', outline: 'none',
              boxShadow: `0 0 8px ${wColor}33`,
              display: 'flex', alignItems: 'center', gap: 8,
              minWidth: 100,
            }}
          >
            <div
              style={{
                width: 16, height: 16, borderRadius: '50%',
                background: wColor,
                boxShadow: `0 0 6px ${wColor}66`,
              }}
            />
            WIRE
          </button>
        </div>

        {/* Floating multi-select toolbar — clamped to viewport */}
        {multiSelect?.size > 0 && !selectionRect && (() => {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          [...multiSelect].forEach(id => {
            const comp = comps.find(c => c.id === id);
            if (comp) {
              minX = Math.min(minX, comp.x); minY = Math.min(minY, comp.y);
              maxX = Math.max(maxX, comp.x + CW); maxY = Math.max(maxY, comp.y + CH);
            } else {
              const wire = wires.find(w => w.id === id);
              if (wire) {
                const tA = G.terminals.get(wire.from), tB = G.terminals.get(wire.to);
                if (tA && tB) {
                  minX = Math.min(minX, tA.wx, tB.wx); minY = Math.min(minY, tA.wy, tB.wy);
                  maxX = Math.max(maxX, tA.wx, tB.wx); maxY = Math.max(maxY, tA.wy, tB.wy);
                }
              }
            }
          });
          if (minX === Infinity) return null;

          const canvasW = cvRef.current?.clientWidth || 360;
          const canvasH = cvRef.current?.clientHeight || 600;
          const BAR_HALF_W = 170;
          const BAR_H = 56;
          const GAP = 10;

          const rawCX = (minX + maxX) / 2 * zoom + pan.x;
          const rawTY = minY * zoom + pan.y - BAR_H - GAP;

          const clampedX = Math.max(BAR_HALF_W + GAP, Math.min(canvasW - BAR_HALF_W - GAP, rawCX));
          const clampedY = Math.max(GAP, Math.min(canvasH - BAR_H - GAP, rawTY));

          return (
            <MultiSelectBar
              barX={clampedX}
              barY={clampedY}
              count={multiSelect.size}
              onDelete={onMultiDelete}
              onCopy={onMultiCopy}
              onPaste={onMultiPaste}
              onMove={onMultiMove}
              hasClipboard={!!clipboard}
            />
          );
        })()}

        {showHints && <CanvasHints onDone={dismissHints} />}

      {showColorPicker && (
          <WireColorPicker
            wColor={wColor}
            setWColor={setWColor}
            onClose={() => setShowColorPicker(false)}
          />
        )}
      </div>
    </div>
  );
}