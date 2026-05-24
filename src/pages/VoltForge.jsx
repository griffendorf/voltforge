import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { T, CW, CH } from '@/lib/voltforge/theme';
import { DEFS } from '@/lib/voltforge/definitions';
import { G, SIM, HIST } from '@/lib/voltforge/instances';
import { uid } from '@/lib/voltforge/graph';
import { validateGraph } from '@/lib/voltforge/validation';
import { bezier, rubber } from '@/lib/voltforge/routing';
import { buildAIContext } from '@/lib/voltforge/ai-context';

import VFHeader from '@/components/voltforge/VFHeader';
import UpgradePrompt from '@/components/voltforge/UpgradePrompt';
import { useSubscription } from '@/lib/useSubscription';
import VFBottomNav from '@/components/voltforge/VFBottomNav';
import CanvasView from '@/components/voltforge/CanvasView';
import PartsView from '@/components/voltforge/PartsView';
import SimView from '@/components/voltforge/SimView';
import InfoView from '@/components/voltforge/InfoView';
import AIView from '@/components/voltforge/AIView';
import SaveView from '@/components/voltforge/SaveView';
import SlideTransition from '@/components/voltforge/SlideTransition';
import OnboardingOverlay from '@/components/voltforge/OnboardingOverlay';

const VIEW_TO_ROUTE = {
  canvas: '/canvas',
  parts: '/parts',
  sim: '/sim',
  ai: '/ai',
  info: '/info',
  save: '/save',
};

const ROUTE_TO_VIEW = {
  '/canvas': 'canvas',
  '/parts': 'parts',
  '/sim': 'sim',
  '/ai': 'ai',
  '/info': 'info',
  '/save': 'save',
};

export default function VoltForge() {
  const navigate = useNavigate();
  const location = useLocation();

  const [ver, setVer] = useState(0);
  const [placing, setPlacing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [wColor, setWColor] = useState(T.blue);
  const [simOn, setSimOn] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simSnap, setSimSnap] = useState(null);
  const [activeCat, setActiveCat] = useState('sources');
  const [projName, setProjName] = useState('Untitled');
  const [projId, setProjId] = useState(() => uid('p'));
  const [aiHL, setAiHL] = useState({ compIds: [], type: 'info' });
  const [aiMsgs, setAiMsgs] = useState([{
    role: 'assistant',
    content: "👋 I'm **Volt·AI**! I can help you with anything VoltForge:\n\n• **Build circuits** — just describe what you need and I'll place and wire it for you\n• **Analyze your circuit** — ask about voltage, current, faults or component choices\n• **How to use the app** — placing parts, drawing wires, running the simulator, saving projects, multi-select… just ask!\n\nWhat would you like to do?",
  }]);
  const [autoSnap, setAutoSnap] = useState(false);
  const autoSnapRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('vf_onboarded'));
  const [multiSelect, setMultiSelect] = useState(new Set());
  const [selectionRect, setSelectionRect] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const { tier } = useSubscription();

  // Orientation detection
  const [isLandscape, setIsLandscape] = useState(() => window.screen.width > window.screen.height);
  useEffect(() => {
    const check = () => setIsLandscape(window.screen.width > window.screen.height);
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  // Zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  const rbSvgRef = useRef(null);
  const drawing = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const snapRef = useRef(null);
  const cvRef = useRef(null);
  const lpTimer = useRef(null);
  const lpActive = useRef(null);
  const compTouched = useRef(false);
  const wireTouched = useRef(false);
  const pinchRef = useRef(null);
  const panDragRef = useRef(null);
  const selDragRef = useRef(null);

  const view = ROUTE_TO_VIEW[location.pathname] || 'canvas';

  const setView = useCallback((newView) => {
    if (newView === 'ai' && tier === 'free') {
      setShowUpgrade(true);
      return;
    }
    const route = VIEW_TO_ROUTE[newView];
    if (route) navigate(route);
  }, [navigate, tier]);

  useEffect(() => {
    SIM.onChange = () => setSimSnap(SIM.snap ? { ...SIM.snap } : null);
    HIST.clear();
    HIST.push(G, { pid: projId, name: projName });
    setCanUndo(false);
    return () => { SIM.onChange = null; SIM.stop(); };
  }, []);

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

  const onCanvasTouchStart = useCallback(e => {
    if (compTouched.current) { compTouched.current = false; return; }
    if (wireTouched.current) { wireTouched.current = false; return; }
    if (e.touches.length === 2) {
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
    if (placing) {
      const { x, y } = eXY(e);
      const gs = 20;
      G.addComponent(placing, Math.round((x - CW / 2) / gs) * gs, Math.round((y - CH / 2) / gs) * gs);
      bump();
      setPlacing(null);
      return;
    }
    if (drawing.current) { drawing.current = null; snapRef.current = null; clearRubberBand(); return; }
    // If items are selected, start a pan instead of clearing selection
    if (multiSelect.size > 0) {
      const s = e.touches[0];
      panDragRef.current = { startClientX: s.clientX, startClientY: s.clientY, panX: panRef.current.x, panY: panRef.current.y };
      if (e.cancelable) e.preventDefault();
      return;
    }
    const { x: _sx, y: _sy } = eXY(e);
    selDragRef.current = { startX: _sx, startY: _sy, currentX: _sx, currentY: _sy };
    setSelectionRect({ x1: _sx, y1: _sy, x2: _sx, y2: _sy });
    setSelected(null);
    setMultiSelect(new Set());
  }, [placing, eXY, bump, clearRubberBand, multiSelect]);

  const onCanvasMouseDown = useCallback(e => {
    if (wireTouched.current) { wireTouched.current = false; return; }
    if (placing) {
      const { x, y } = eXY(e);
      const gs = 20;
      G.addComponent(placing, Math.round((x - CW / 2) / gs) * gs, Math.round((y - CH / 2) / gs) * gs);
      bump();
      setPlacing(null);
      return;
    }
    if (drawing.current) { drawing.current = null; snapRef.current = null; clearRubberBand(); return; }
    // Pan canvas if something is selected (don't dismiss selection)
    if (multiSelect.size > 0) {
      panDragRef.current = { startClientX: e.clientX, startClientY: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
      return;
    }
    const { x: _sx, y: _sy } = eXY(e);
    selDragRef.current = { startX: _sx, startY: _sy, currentX: _sx, currentY: _sy };
    setSelectionRect({ x1: _sx, y1: _sy, x2: _sx, y2: _sy });
    setSelected(null);
    setMultiSelect(new Set());
  }, [placing, eXY, bump, clearRubberBand, multiSelect]);

  const onGlobalMove = useCallback(e => {
    // Single-finger pan while multiselect active
    if (panDragRef.current && !pinchRef.current) {
      const s = e.touches?.[0] || e;
      const newPanX = panDragRef.current.panX + (s.clientX - panDragRef.current.startClientX);
      const newPanY = panDragRef.current.panY + (s.clientY - panDragRef.current.startClientY);
      panRef.current = { x: newPanX, y: newPanY };
      setPan({ x: newPanX, y: newPanY });
      if (e.cancelable) e.preventDefault();
      return;
    }
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
    if (selDragRef.current) {
      const { x, y } = eXY(e);
      selDragRef.current.currentX = x;
      selDragRef.current.currentY = y;
      setSelectionRect({ x1: selDragRef.current.startX, y1: selDragRef.current.startY, x2: x, y2: y });
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
    const originTermId = drawing.current.rewireId ? drawing.current.fixedTermId : drawing.current.termId;
    const originTerm = G.terminals.get(originTermId);
    updateRubberBand(originTerm, x, y, snapRef.current, !!drawing.current.rewireId, wColor);
    if (e.cancelable) e.preventDefault();
  }, [eXY, updateRubberBand, wColor]);

  const onGlobalUp = useCallback(e => {
    pinchRef.current = null;
    clearTimeout(lpTimer.current);
    // End single-finger pan (tap on empty = clear selection)
    if (panDragRef.current) {
      const s = e.changedTouches?.[0] || e;
      const dist = Math.hypot(
        s.clientX - panDragRef.current.startClientX,
        s.clientY - panDragRef.current.startClientY
      );
      panDragRef.current = null;
      if (dist < 8) setMultiSelect(new Set());
      return;
    }
    if (selDragRef.current) {
      const sd = selDragRef.current;
      selDragRef.current = null;
      setSelectionRect(null);
      const dist = Math.hypot(sd.currentX - sd.startX, sd.currentY - sd.startY);
      if (dist > 8) {
        const rx1 = Math.min(sd.startX, sd.currentX);
        const ry1 = Math.min(sd.startY, sd.currentY);
        const rx2 = Math.max(sd.startX, sd.currentX);
        const ry2 = Math.max(sd.startY, sd.currentY);
        const newSel = new Set();
        [...G.components.values()].forEach(comp => {
          if (comp.x < rx2 && comp.x + CW > rx1 && comp.y < ry2 && comp.y + CH > ry1) {
            newSel.add(comp.id);
          }
        });
        [...G.wires.values()].forEach(wire => {
          const tA = G.terminals.get(wire.from), tB = G.terminals.get(wire.to);
          if (!tA || !tB) return;
          const mx = (tA.wx + tB.wx) / 2, my = (tA.wy + tB.wy) / 2;
          if ((tA.wx >= rx1 && tA.wx <= rx2 && tA.wy >= ry1 && tA.wy <= ry2) ||
              (tB.wx >= rx1 && tB.wx <= rx2 && tB.wy >= ry1 && tB.wy <= ry2) ||
              (mx >= rx1 && mx <= rx2 && my >= ry1 && my <= ry2)) {
            newSel.add(wire.id);
          }
        });
        setMultiSelect(newSel);
      } else {
        setMultiSelect(new Set());
      }
      return;
    }
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
    if (autoSnapRef.current && !drawing.current?.rewireId && snap?.valid) {
      const restartTermId = drawing.current?.termId;
      const restartCompId = drawing.current?.compId;
      drawing.current = null;
      snapRef.current = null;
      clearRubberBand();
      if (restartTermId) {
        drawing.current = { termId: restartTermId, compId: restartCompId };
        snapRef.current = null;
      }
      return;
    }
    drawing.current = null;
    snapRef.current = null;
    clearRubberBand();
  }, [wColor, bump, clearRubberBand]);

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

  useEffect(() => {
    const el = cvRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel, view]);

  const globalMoveRef = useRef(null);
  const globalUpRef = useRef(null);
  useEffect(() => { globalMoveRef.current = onGlobalMove; }, [onGlobalMove]);
  useEffect(() => { globalUpRef.current = onGlobalUp; }, [onGlobalUp]);
  useEffect(() => { autoSnapRef.current = autoSnap; }, [autoSnap]);
  useEffect(() => {
    const move = e => globalMoveRef.current?.(e);
    const up = e => globalUpRef.current?.(e);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  const onTermPress = useCallback((termId, compId, e) => {
    if (placing) return;
    e.stopPropagation(); e.preventDefault();
    const { x, y } = eXY(e);
    if (drawing.current && !drawing.current.rewireId && termId !== drawing.current.termId) {
      G.addWire(drawing.current.termId, termId, wColor);
      bump();
      if (autoSnapRef.current) {
        drawing.current = { termId, compId };
        mouse.current = { x, y };
        snapRef.current = null;
      } else {
        drawing.current = null;
        snapRef.current = null;
      }
      clearRubberBand();
      setSelected(null);
      return;
    }
    drawing.current = { termId, compId };
    mouse.current = { x, y };
    snapRef.current = null;
    setSelected(null);
  }, [eXY, placing, wColor, bump, clearRubberBand]);

  const onCompPress = useCallback((compId, e) => {
    if (placing) return;
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
    clearTimeout(lpTimer.current);
    lpTimer.current = setTimeout(() => {
      if (!moved) { lpActive.current = true; setSelected(compId); }
    }, 480);
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
      if (compEl) { compEl.style.left = nx + 'px'; compEl.style.top = ny + 'px'; }
      if (ev.cancelable) ev.preventDefault();
    };
    const onU = () => {
      clearTimeout(lpTimer.current);
      if (moved) bump();
      else if (!lpActive.current) {
        if (multiSelect?.has(compId)) {
          setMultiSelect(prev => { const n = new Set(prev); n.delete(compId); return n; });
        } else {
          setSelected(null);
        }
      }
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onM);
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', onU);
    };
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', onM, { passive: false });
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', onU);
  }, [placing, bump, multiSelect, setMultiSelect]);

  const comps = useMemo(() => [...G.components.values()], [ver]);
  const wires = useMemo(() => [...G.wires.values()], [ver]);
  const stats = G.stats;
  const selComp = selected ? G.components.get(selected) : null;
  const snap = simSnap;
  const isDrawing = !!drawing.current;

  const onMultiDelete = useCallback(() => {
    multiSelect.forEach(id => {
      if (G.components.has(id)) G.removeComponent(id);
      else if (G.wires.has(id)) G.removeWire(id);
    });
    setMultiSelect(new Set());
    setSelected(null);
    bump();
  }, [multiSelect, bump]);

  const onMultiCopy = useCallback(() => {
    const copiedComps = [...multiSelect]
      .filter(id => G.components.has(id))
      .map(id => ({ ...G.components.get(id) }));
    const copiedWires = [...multiSelect]
      .filter(id => G.wires.has(id))
      .map(id => ({ ...G.wires.get(id) }));
    setClipboard({ comps: copiedComps, wires: copiedWires });
  }, [multiSelect]);

  const onMultiPaste = useCallback(() => {
    if (!clipboard) return;
    const idMap = new Map();
    const newComps = [];
    clipboard.comps.forEach(c => {
      const nc = G.addComponent(c.type, c.x + 40, c.y + 40);
      if (nc) { idMap.set(c.id, nc.id); newComps.push(nc); }
    });
    clipboard.wires.forEach(w => {
      const fromComp = G.terminals.get(w.from);
      const toComp = G.terminals.get(w.to);
      if (!fromComp || !toComp) return;
      const newFromCompId = idMap.get(fromComp.compId);
      const newToCompId = idMap.get(toComp.compId);
      if (!newFromCompId || !newToCompId) return;
      const newFromComp = G.components.get(newFromCompId);
      const newToComp = G.components.get(newToCompId);
      if (!newFromComp || !newToComp) return;
      const newFrom = newFromComp.termIds.map(tid => G.terminals.get(tid)).find(t => t?.key === fromComp.key);
      const newTo = newToComp.termIds.map(tid => G.terminals.get(tid)).find(t => t?.key === toComp.key);
      if (newFrom && newTo) G.addWire(newFrom.id, newTo.id, w.color);
    });
    const newSel = new Set(newComps.map(c => c.id));
    setMultiSelect(newSel);
    bump();
  }, [clipboard, bump]);

  const onMultiMove = useCallback((dx, dy) => {
    const gs = 20;
    [...multiSelect].forEach(id => {
      const comp = G.components.get(id);
      if (comp) G.moveComponent(id, Math.round((comp.x + dx) / gs) * gs, Math.round((comp.y + dy) / gs) * gs);
    });
    bump();
  }, [multiSelect, bump]);

  const onWireLongPress = useCallback((wireId, fixedTermId, dragTermId, color, startX, startY) => {
    drawing.current = { rewireId: wireId, fixedTermId, dragTermId, color };
    mouse.current = { x: startX, y: startY };
    snapRef.current = null;
  }, []);

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

  const onTabReset = useCallback((tabId) => {
    if (tabId === 'ai') setAiHL({ compIds: [], type: 'info' });
    else if (tabId === 'info') setSelected(null);
    else if (tabId === 'canvas') {
      zoomRef.current = 1; panRef.current = { x: 0, y: 0 };
      setZoom(1); setPan({ x: 0, y: 0 }); setSelected(null);
    } else if (tabId === 'parts') {
      if (placing) setPlacing(null);
    }
  }, [placing]);

  const onBuildComplete = useCallback((placedComps) => {
    if (!placedComps.length) return;
    const PAD = 80;
    const xs = placedComps.map(c => c.x);
    const ys = placedComps.map(c => c.y);
    const minX = Math.min(...xs) - PAD;
    const minY = Math.min(...ys) - PAD;
    const maxX = Math.max(...xs) + 120 + PAD;
    const maxY = Math.max(...ys) + 60 + PAD;
    const cw = cvRef.current?.clientWidth || 360;
    const ch = cvRef.current?.clientHeight || 600;
    const newZoom = Math.min(1.2, Math.max(0.2, Math.min(cw / (maxX - minX), ch / (maxY - minY))));
    const newPanX = (cw - (maxX + minX) * newZoom) / 2;
    const newPanY = (ch - (maxY + minY) * newZoom) / 2;
    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, []);

  const headerEl = (
    <VFHeader
      simOn={simOn} simSnap={snap}
      simStatus={simStatus} simCol={simCol}
      comps={comps} wires={wires} errors={errors} warnings={warnings}
      autoSnap={autoSnap} setAutoSnap={setAutoSnap}
      canUndo={canUndo} doUndo={doUndo}
      zoom={zoom}
      onZoomIn={() => { const nz = Math.min(4, zoomRef.current * 1.25); zoomRef.current = nz; setZoom(nz); }}
      onZoomOut={() => { const nz = Math.max(0.25, zoomRef.current / 1.25); zoomRef.current = nz; setZoom(nz); }}
      onZoomReset={() => { zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; setZoom(1); setPan({ x: 0, y: 0 }); }}
    />
  );

  const contentEl = (
    <SlideTransition activeView={view}>
      {(currentView) => (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'none', height: '100%' }}>
          {currentView === 'canvas' && (
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
              onWireLongPress={onWireLongPress}
              onTermPress={onTermPress}
              setWColor={setWColor}
              setSelected={setSelected}
              bump={bump}
              isRewire={!!drawing.current?.rewireId}
              multiSelect={multiSelect}
              setMultiSelect={setMultiSelect}
              wireTouchedRef={wireTouched}
              selectionRect={selectionRect}
              clipboard={clipboard}
              onMultiDelete={onMultiDelete}
              onMultiCopy={onMultiCopy}
              onMultiPaste={onMultiPaste}
              onMultiMove={onMultiMove}
            />
          )}
          {currentView === 'parts' && (
            <PartsView
              placing={placing} setPlacing={setPlacing}
              activeCat={activeCat} setActiveCat={setActiveCat}
              setView={setView}
            />
          )}
          {currentView === 'sim' && (
            <SimView
              simOn={simOn} simPaused={simPaused} snap={snap}
              simStatus={simStatus} simCol={simCol} comps={comps}
              toggleSim={toggleSim} togglePause={togglePause} stepOnce={stepOnce}
              setSelected={setSelected} setView={setView}
            />
          )}
          {currentView === 'info' && (
            <InfoView
              issues={issues} errors={errors} warnings={warnings}
              comps={comps} stats={stats} selComp={selComp} snap={snap}
              selected={selected} setSelected={setSelected}
              wColor={wColor} setWColor={setWColor} bump={bump}
            />
          )}
          {currentView === 'ai' && (
            <AIView
              snap={snap}
              setAiHL={setAiHL}
              setView={setView}
              bump={bump}
              aiMsgs={aiMsgs}
              setAiMsgs={setAiMsgs}
              onBuildComplete={onBuildComplete}
            />
          )}
          {currentView === 'save' && (
            <SaveView
              projName={projName} setProjName={setProjName}
              projId={projId} setProjId={setProjId}
              bump={bump} setSimOn={setSimOn} setSimSnap={setSimSnap}
              setVer={setVer} setView={setView} setSelected={setSelected}
            />
          )}
        </div>
      )}
    </SlideTransition>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: isLandscape ? 'row' : 'column',
      height: '100dvh',
      minHeight: '-webkit-fill-available',
      background: T.bg, color: T.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 'clamp(11px, 2.5vw, 13px)',
      overflow: 'hidden',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {isLandscape ? (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {headerEl}
            {contentEl}
          </div>
          <VFBottomNav view={view} setView={setView} onTabReset={onTabReset} isLandscape />
        </>
      ) : (
        <>
          {headerEl}
          {contentEl}
          <VFBottomNav view={view} setView={setView} onTabReset={onTabReset} />
        </>
      )}
      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
      {showOnboarding && <OnboardingOverlay onDone={() => setShowOnboarding(false)} />}
    </div>
  );
}