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
  const [selected, setSelected] = useState(null);
  const [wColor, setWColor] = useState(T.blue);
  const [simOn, setSimOn] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simSnap, setSimSnap] = useState(null);
  const [activeCat, setActiveCat] = useState('sources');
  const [view, setView] = useState('canvas');
  const [projName, setProjName] = useState('Untitled');
  const [projId, setProjId] = useState(() => uid('p'));
  const [aiHL, setAiHL] = useState({ compIds: [], type: 'info' });

  const drawing = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const snapRef = useRef(null);
  const [drawVer, setDrawVer] = useState(0);
  const cvRef = useRef(null);
  const asTimer = useRef(null);

  // Wire SIM onChange → React
  useEffect(() => {
    SIM.onChange = () => setSimSnap(SIM.snap ? { ...SIM.snap } : null);
    return () => { SIM.onChange = null; SIM.stop(); };
  }, []);

  const bump = useCallback(() => {
    setVer(v => v + 1);
    SIM.invalidate();
    HIST.push(G, { pid: projId, name: projName });
  }, [projId, projName]);

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

  // XY from event
  const eXY = useCallback(e => {
    const r = cvRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const s = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: s.clientX - r.left, y: s.clientY - r.top };
  }, []);

  // Global move / up for wire drawing
  const onGlobalMove = useCallback(e => {
    if (!drawing.current) return;
    const { x, y } = eXY(e);
    mouse.current = { x, y };
    snapRef.current = G.findSnap(x, y, drawing.current.compId, drawing.current.termId);
    setDrawVer(v => v + 1);
    if (e.cancelable) e.preventDefault();
  }, [eXY]);

  const onGlobalUp = useCallback(() => {
    if (!drawing.current) return;
    const snap = snapRef.current;
    if (snap?.valid) { G.addWire(drawing.current.termId, snap.term.id, wColor); bump(); }
    drawing.current = null;
    snapRef.current = null;
    setDrawVer(v => v + 1);
  }, [wColor, bump]);

  const onTermPress = useCallback((termId, compId, e) => {
    e.stopPropagation(); e.preventDefault();
    const { x, y } = eXY(e);
    drawing.current = { termId, compId };
    mouse.current = { x, y };
    snapRef.current = null;
    setSelected(null);
    setDrawVer(v => v + 1);
  }, [eXY]);

  const onCanvasTap = useCallback(e => {
    if (!e.target.dataset.cv) return;
    if (placing) {
      const { x, y } = eXY(e);
      const gs = 20;
      G.addComponent(placing, Math.round((x - CW / 2) / gs) * gs, Math.round((y - CH / 2) / gs) * gs);
      bump();
      setPlacing(null);
      return;
    }
    if (drawing.current) { drawing.current = null; snapRef.current = null; setDrawVer(v => v + 1); }
    setSelected(null);
  }, [placing, eXY, bump]);

  const onCompPress = useCallback((compId, e) => {
    e.stopPropagation();
    if (placing || drawing.current) return;
    const isTouch = !!e.touches;
    const gXY = ev => { const s = ev.touches?.[0] || ev.changedTouches?.[0] || ev; return { x: s.clientX, y: s.clientY }; };
    const comp = G.components.get(compId);
    if (!comp) return;
    const s0 = gXY(e), ox = comp.x, oy = comp.y;
    let moved = false;

    const onM = ev => {
      const c = gXY(ev);
      const dist = Math.hypot(c.x - s0.x, c.y - s0.y);
      if (dist < 6) return;
      moved = true;
      const gs = 20;
      G.moveComponent(compId, Math.round((ox + c.x - s0.x) / gs) * gs, Math.round((oy + c.y - s0.y) / gs) * gs);
      setVer(v => v + 1);
      if (ev.cancelable) ev.preventDefault();
    };
    const onU = () => {
      if (!moved) setSelected(s => s === compId ? null : compId);
      else bump();
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
  const drawOrigin = isDrawing ? G.terminals.get(drawing.current.termId) : null;
  const snapTarget = snapRef.current;
  const rubberPath = drawOrigin
    ? (snapTarget
      ? bezier(drawOrigin.wx, drawOrigin.wy, drawOrigin.dir, snapTarget.term.wx, snapTarget.term.wy, snapTarget.term.dir)
      : rubber(drawOrigin.wx, drawOrigin.wy, drawOrigin.dir, mouse.current.x, mouse.current.y))
    : null;

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
        overflow: 'hidden', userSelect: 'none', touchAction: 'none'
      }}
      onMouseMove={onGlobalMove} onTouchMove={onGlobalMove}
      onMouseUp={onGlobalUp} onTouchEnd={onGlobalUp}
    >
      <VFHeader
        simOn={simOn} simPaused={simPaused} simSnap={snap}
        simStatus={simStatus} simCol={simCol}
        comps={comps} wires={wires} errors={errors} warnings={warnings}
        toggleSim={toggleSim} togglePause={togglePause}
      />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {view === 'canvas' && (
          <CanvasView
            cvRef={cvRef} comps={comps} wires={wires}
            placing={placing} isDrawing={isDrawing} selected={selected}
            drawOrigin={drawOrigin} rubberPath={rubberPath}
            snapTarget={snapTarget} wColor={wColor} snap={snap}
            issuesByComp={issuesByComp} aiHL={aiHL}
            onCanvasTap={onCanvasTap} onCompPress={onCompPress}
            onTermPress={onTermPress} setWColor={setWColor}
            setSelected={setSelected} bump={bump}
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