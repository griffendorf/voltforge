import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, CW, CH } from '@/lib/voltforge/theme';
import { DEFS } from '@/lib/voltforge/definitions';
import { G, SIM, HIST } from '@/lib/voltforge/instances';
import { uid } from '@/lib/voltforge/graph';
import { validateGraph } from '@/lib/voltforge/validation';
import { bezier, rubber } from '@/lib/voltforge/routing';

import VFHeader from '@/components/voltforge/VFHeader';
import VFBottomNav from '@/components/voltforge/VFBottomNav';
import CanvasView from '@/components/voltforge/CanvasView';
import PartsView from '@/components/voltforge/PartsView';
import SimView from '@/components/voltforge/SimView';
import InfoView from '@/components/voltforge/InfoView';
import AIView from '@/components/voltforge/AIView';
import SaveView from '@/components/voltforge/SaveView';

export default function VoltForge() {
  const [ver, setVer] = useState(0);
  const [placing, setPlacing] = useState(null);
  const [selected, setSelected] = useState(null);   // component id that shows ✕/↻
  const [wColor, setWColor] = useState(T.blue);
  const [simOn, setSimOn] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simSnap, setSimSnap] = useState(null);
  const [activeCat, setActiveCat] = useState('sources');
  const [view, setView] = useState('canvas');
  const [projName, setProjName] = useState('Untitled');
  const [projId, setProjId] = useState(() => uid('p'));
  const [aiHL, setAiHL] = useState({ compIds: [], type: 'info' });
  const [canUndo, setCanUndo] = useState(false);

  // Rubber-band overlay SVG ref — updated imperatively to avoid re-renders on every mousemove
  const rbSvgRef = useRef(null);

  // ── Zoom / pan state ───────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  // ── Drawing / drag wire refs ────────────────────────────
  const drawing = useRef(null);   // { termId, compId } | { rewireId, fixedTermId, dragTermId } for rewire
  const mouse = useRef({ x: 0, y: 0 });
  const snapRef = useRef(null);
  const cvRef = useRef(null);

  // Long-press tracking
  const lpTimer = useRef(null);
  const lpActive = useRef(false);   // did long-press fire?
  const compTouched = useRef(false); // did a touch start on a component?

  // Pinch tracking
  const pinchRef = useRef(null);  // { dist, cx, cy, panX, panY, zoom }
  const panDragRef = useRef(null); // { startX, startY, panX, panY } — two-finger pan after pinch

  // Wire SIM onChange → React
  useEffect(() => {
    SIM.onChange = () => setSimSnap(SIM.snap ? { ...SIM.snap } : null);
    // Reset history and push the initial state on mount
    HIST.clear();
    HIST.push(G, { pid: projId, name: projName });
    setCanUndo(false);
    return () => { SIM.onChange = null; SIM.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Imperatively update rubber-band SVG (no React re-render) ──
  const updateRubberBand = useCallback((drawOriginTerm, mx, my, snapTgt, isRewire, wColorVal) => {
    const svg = rbSvgRef.current;
    if (!svg) return;
    if (!drawOriginTerm) { svg.style.display = 'none'; return; }
    svg.style.display = 'block';

    const col = snapTgt?.valid ? T.green : snapTgt ? T.red : isRewire ? T.amber : wColorVal;
    let d;
    if (snapTgt) {
      d = bezier(drawOriginTerm.wx, drawOriginTerm.wy, drawOriginTerm.dir,
                 snapTgt.term.wx, snapTgt.term.wy, snapTgt.term.dir);
    } else {
      d = rubber(drawOriginTerm.wx, drawOriginTerm.wy, drawOriginTerm.dir, mx, my);
    }

    const [glow, line, ring] = svg.children;
    glow.setAttribute('d', d); glow.setAttribute('stroke', col);
    line.setAttribute('d', d); line.setAttribute('stroke', col);
    line.setAttribute('stroke-dasharray', snapTgt?.valid ? 'none' : '8 5');
    if (snapTgt) {
      ring.setAttribute('cx', snapTgt.term.wx); ring.setAttribute('cy', snapTgt.term.wy);
      ring.setAttribute('stroke', col); ring.style.display = 'block';
    } else {
      ring.style.display = 'none';
    }
  }, []);

  const clearRubberBand = useCallback(() => {
    const svg = rbSvgRef.current;
    if (svg) svg.style.display = 'none';
  }, []);

  const bump = useCallback(() => {
    setVer(v => v + 1);
    SIM.invalidate();
    HIST.push(G, { pid: projId, name: projName });
    setCanUndo(HIST.canUndo);
  }, [projId, projName]);

  const doUndo = useCallback(() => {
    if (!HIST.canUndo) return;
    HIST.undo(G);
    SIM.invalidate();
    setVer(v => v + 1);
    setCanUndo(HIST.canUndo);
    setSelected(null);
  }, []);

  // Validation
  const issues = useMemo(() => validateGraph(G), [ver]);
  const issuesByComp = useMemo(() => {
    const m = new Map();
    issues.forEach(iss => iss.compIds.forEach(cid => {
      if (!m.has(cid)) m.set(cid, []);
      m.get(cid).push(iss);
    }));
    return m;
  }, [issues]);
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  // ── Canvas coordinate helpers ─────────────────────────
  // Convert screen coords → canvas world coords (accounting for zoom/pan)
  const screenToWorld = useCallback((sx, sy) => {
    const r = cvRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const cx = sx - r.left;
    const cy = sy - r.top;
    return {
      x: (cx - panRef.current.x) / zoomRef.current,
      y: (cy - panRef.current.y) / zoomRef.current,
    };
  }, []);

  const eXY = useCallback(e => {
    const s = e.touches?.[0] || e.changedTouches?.[0] || e;
    return screenToWorld(s.clientX, s.clientY);
  }, [screenToWorld]);

  // ── Pinch-to-zoom + two-finger pan ────────────────────
  const onCanvasTouchStart = useCallback(e => {
    if (compTouched.current) { compTouched.current = false; return; }
    if (e.touches.length === 2) {
      // Two fingers — enter pinch/pan mode, cancel any drawing
      drawing.current = null; snapRef.current = null;
      clearTimeout(lpTimer.current); lpActive.current = false;
      const [a, b] = e.touches;
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      pinchRef.current = {
        dist, zoom: zoomRef.current,
        cx: (a.clientX + b.clientX) / 2,
        cy: (a.clientY + b.clientY) / 2,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      e.preventDefault();
      return;
    }
    // single finger — placing a part can land on any child element
    if (placing) {
      const { x, y } = eXY(e);
      const gs = 20;
      G.addComponent(placing, Math.round((x - CW / 2) / gs) * gs, Math.round((y - CH / 2) / gs) * gs);
      bump();
      setPlacing(null);
      return;
    }
    // Components/terminals call e.stopPropagation(), so anything that reaches here is bare canvas
    if (drawing.current) { drawing.current = null; snapRef.current = null; clearRubberBand(); }
    setSelected(null);
  }, [placing, eXY, bump, clearRubberBand]);

  const onCanvasMouseDown = useCallback(e => {
    if (placing) {
      const { x, y } = eXY(e);
      const gs = 20;
      G.addComponent(placing, Math.round((x - CW / 2) / gs) * gs, Math.round((y - CH / 2) / gs) * gs);
      bump();
      setPlacing(null);
      return;
    }
    // Components/terminals call e.stopPropagation(), so anything that reaches here is bare canvas
    if (drawing.current) { drawing.current = null; snapRef.current = null; clearRubberBand(); }
    setSelected(null);
  }, [placing, eXY, bump, clearRubberBand]);

  // ── Global move / up ─────────────────────────────────
  const onGlobalMove = useCallback(e => {
    // Pinch / two-finger pan
    if (e.touches?.length === 2 && pinchRef.current) {
      const [a, b] = e.touches;
      const newDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const scale = newDist / pinchRef.current.dist;
      const newZoom = Math.min(4, Math.max(0.25, pinchRef.current.zoom * scale));
      const midX = (a.clientX + b.clientX) / 2;
      const midY = (a.clientY + b.clientY) / 2;
      const r = cvRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const cx = pinchRef.current.cx - r.left;
      const cy = pinchRef.current.cy - r.top;
      const dx = midX - pinchRef.current.cx;
      const dy = midY - pinchRef.current.cy;
      const newPanX = cx - (cx - pinchRef.current.panX) * (newZoom / pinchRef.current.zoom) + dx;
      const newPanY = cy - (cy - pinchRef.current.panY) * (newZoom / pinchRef.current.zoom) + dy;
      zoomRef.current = newZoom;
      panRef.current = { x: newPanX, y: newPanY };
      setZoom(newZoom); setPan({ x: newPanX, y: newPanY });
      if (e.cancelable) e.preventDefault();
      return;
    }

    if (!drawing.current) return;
    const { x, y } = eXY(e);
    mouse.current = { x, y };
    const excludeCompId = drawing.current.rewireId
      ? G.terminals.get(drawing.current.fixedTermId)?.compId
      : drawing.current.compId;
    const excludeTermId = drawing.current.rewireId
      ? drawing.current.fixedTermId
      : drawing.current.termId;
    snapRef.current = G.findSnap(x, y, excludeCompId, excludeTermId, drawing.current.rewireId);

    // Update rubber-band imperatively — no React re-render
    const originTermId = drawing.current.rewireId ? drawing.current.fixedTermId : drawing.current.termId;
    const originTerm = G.terminals.get(originTermId);
    updateRubberBand(originTerm, x, y, snapRef.current, !!drawing.current.rewireId, wColor);

    if (e.cancelable) e.preventDefault();
  }, [eXY, updateRubberBand, wColor]);

  const onGlobalUp = useCallback(e => {
    pinchRef.current = null;
    if (!drawing.current) return;

    const snap = snapRef.current;

    if (drawing.current.rewireId) {
      if (snap?.valid) {
        G.removeWire(drawing.current.rewireId);
        G.addWire(drawing.current.fixedTermId, snap.term.id, drawing.current.color);
        bump();
      }
    } else {
      if (snap?.valid) { G.addWire(drawing.current.termId, snap.term.id, wColor); bump(); }
    }

    drawing.current = null;
    snapRef.current = null;
    clearRubberBand();
  }, [wColor, bump, clearRubberBand]);

  // ── Mouse wheel zoom ──────────────────────────────────
  const onWheel = useCallback(e => {
    e.preventDefault();
    const r = cvRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(4, Math.max(0.25, zoomRef.current * delta));
    const newPanX = cx - (cx - panRef.current.x) * (newZoom / zoomRef.current);
    const newPanY = cy - (cy - panRef.current.y) * (newZoom / zoomRef.current);
    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };
    setZoom(newZoom); setPan({ x: newPanX, y: newPanY });
  }, []);

  // Attach wheel listener with passive:false so we can preventDefault
  useEffect(() => {
    const el = cvRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel, view]); // re-attach when view changes (cvRef may remount)

  // ── Terminal press — start drawing OR long-press to rewire ──
  const onTermPress = useCallback((termId, compId, e) => {
    if (placing) return; // let event bubble to canvas for placement
    e.stopPropagation(); e.preventDefault();
    const { x, y } = eXY(e);
    const term = G.terminals.get(termId);
    const isTouch = !!e.touches;

    // Long-press on a wired terminal → rewire the most-recently-added wire end
    if (term && term.wireIds.size > 0 && isTouch) {
      lpActive.current = false;
      clearTimeout(lpTimer.current);
      lpTimer.current = setTimeout(() => {
        lpActive.current = true;
        const wid = [...term.wireIds][0];
        const wire = G.wires.get(wid);
        if (!wire) return;
        const fixedTermId = wire.from === termId ? wire.to : wire.from;
        drawing.current = { rewireId: wid, fixedTermId, termId, compId, color: wire.color };
        mouse.current = { x, y };
        snapRef.current = null;
        setSelected(null);
      }, 480);

      drawing.current = { termId, compId };
      mouse.current = { x, y };
      snapRef.current = null;
      return;
    }

    // Normal: start new wire
    drawing.current = { termId, compId };
    mouse.current = { x, y };
    snapRef.current = null;
    setSelected(null);
  }, [eXY]);

  // ── Component press — long-press to show buttons, drag to move ──
  const onCompPress = useCallback((compId, e) => {
    if (placing) return; // let event bubble to canvas handler for placement
    compTouched.current = true;
    e.stopPropagation();
    if (drawing.current) return;
    const isTouch = !!e.touches;
    const gXY = ev => { const s = ev.touches?.[0] || ev.changedTouches?.[0] || ev; return { x: s.clientX, y: s.clientY }; };
    const comp = G.components.get(compId);
    if (!comp) return;
    const s0 = gXY(e), ox = comp.x, oy = comp.y;
    let moved = false;
    lpActive.current = false;

    // Long-press timer → show ✕/↻
    clearTimeout(lpTimer.current);
    lpTimer.current = setTimeout(() => {
      if (!moved) {
        lpActive.current = true;
        setSelected(compId);
      }
    }, 480);

    // Find the component's DOM element for live position update
    const compEl = cvRef.current?.querySelector(`[data-comp-id="${compId}"]`);

    const onM = ev => {
      const c = gXY(ev);
      const dist = Math.hypot(c.x - s0.x, c.y - s0.y);
      if (dist < 6) return;
      clearTimeout(lpTimer.current);
      moved = true;
      const gs = 20;
      const dxWorld = (c.x - s0.x) / zoomRef.current;
      const dyWorld = (c.y - s0.y) / zoomRef.current;
      const nx = Math.round((ox + dxWorld) / gs) * gs;
      const ny = Math.round((oy + dyWorld) / gs) * gs;
      G.moveComponent(compId, nx, ny);
      // Update position imperatively for smooth dragging
      if (compEl) { compEl.style.left = nx + 'px'; compEl.style.top = ny + 'px'; }
      if (ev.cancelable) ev.preventDefault();
    };
    const onU = () => {
      clearTimeout(lpTimer.current);
      if (moved) bump();
      // Short tap with no long-press — just clear selection (don't toggle on)
      else if (!lpActive.current) setSelected(null);
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onM);
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', onU);
    };
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', onM, { passive: false });
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', onU);
  }, [placing, bump]);

  // Derived
  const comps = useMemo(() => [...G.components.values()], [ver]);
  const wires = useMemo(() => [...G.wires.values()], [ver]);
  const stats = G.stats;
  const selComp = selected ? G.components.get(selected) : null;
  const snap = simSnap;

  const isDrawing = !!drawing.current;

  // Sim controls
  const toggleSim = useCallback(() => {
    if (simOn) { SIM.stop(); setSimOn(false); setSimPaused(false); setSimSnap(null); }
    else { SIM.start(); setSimOn(true); }
  }, [simOn]);

  const togglePause = useCallback(() => { SIM.pause(); setSimPaused(p => !p); }, []);
  const stepOnce = useCallback(() => { SIM.step(); }, []);

  const simStatus = snap?.status ?? 'off';
  const simCol = simStatus === 'running' ? T.green
    : simStatus === 'open' ? T.amber
      : simStatus === 'short' ? T.red : T.sub;

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', height: '100vh',
        background: T.bg, color: T.text,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        overflow: 'hidden', userSelect: 'none',
      }}
    >
      <VFHeader
        simOn={simOn} simPaused={simPaused} simSnap={snap}
        simStatus={simStatus} simCol={simCol}
        comps={comps} wires={wires} errors={errors} warnings={warnings}
        toggleSim={toggleSim} togglePause={togglePause}
        canUndo={canUndo} doUndo={doUndo}
        zoom={zoom}
        onZoomIn={() => {
          const nz = Math.min(4, zoomRef.current * 1.25);
          zoomRef.current = nz; setZoom(nz);
        }}
        onZoomOut={() => {
          const nz = Math.max(0.25, zoomRef.current / 1.25);
          zoomRef.current = nz; setZoom(nz);
        }}
        onZoomReset={() => {
          zoomRef.current = 1; panRef.current = { x: 0, y: 0 };
          setZoom(1); setPan({ x: 0, y: 0 });
        }}
      />

      <div
        style={{ flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'none' }}
        onMouseMove={onGlobalMove} onTouchMove={onGlobalMove}
        onMouseUp={onGlobalUp} onTouchEnd={onGlobalUp}
      >
        {view === 'canvas' && (
          <CanvasView
            cvRef={cvRef} rbSvgRef={rbSvgRef}
            comps={comps} wires={wires}
            placing={placing} isDrawing={isDrawing} selected={selected}
            wColor={wColor} snap={snap} simOn={simOn} errors={errors}
            issuesByComp={issuesByComp} aiHL={aiHL}
            zoom={zoom} pan={pan}
            onCanvasTouchStart={onCanvasTouchStart}
            onCanvasMouseDown={onCanvasMouseDown}
            onCompPress={onCompPress}
            onTermPress={onTermPress}
            setWColor={setWColor}
            setSelected={setSelected}
            bump={bump}
            isRewire={!!drawing.current?.rewireId}
          />
        )}
        {view === 'parts' && (
          <PartsView
            placing={placing} setPlacing={setPlacing}
            activeCat={activeCat} setActiveCat={setActiveCat}
            setView={setView}
          />
        )}
        {view === 'sim' && (
          <SimView
            simOn={simOn} simPaused={simPaused} snap={snap}
            simStatus={simStatus} simCol={simCol} comps={comps}
            toggleSim={toggleSim} togglePause={togglePause} stepOnce={stepOnce}
            setSelected={setSelected} setView={setView}
          />
        )}
        {view === 'info' && (
          <InfoView
            issues={issues} errors={errors} warnings={warnings}
            comps={comps} stats={stats} selComp={selComp} snap={snap}
            selected={selected} setSelected={setSelected}
            wColor={wColor} setWColor={setWColor} bump={bump}
          />
        )}
        {view === 'ai' && (
          <AIView snap={snap} setAiHL={setAiHL} setView={setView} />
        )}
        {view === 'save' && (
          <SaveView
            projName={projName} setProjName={setProjName}
            projId={projId} setProjId={setProjId}
            bump={bump} setSimOn={setSimOn} setSimSnap={setSimSnap}
            setVer={setVer}
          />
        )}
      </div>

      <VFBottomNav view={view} setView={setView} />
    </div>
  );
}