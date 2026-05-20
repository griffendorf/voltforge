import { DEFS } from './definitions';

// Component resistance model
function compR(comp) {
  switch (comp.type) {
    case 'battery': case 'solar': case 'acsource':
      return comp._iR ?? 0.5;
    case 'resistor': case 'thermistor': case 'ldr':
      return Math.max(comp._ohms ?? 220, 0.1);
    case 'potmeter':
      return Math.max((comp._ohms ?? 10000) * (comp._wiper ?? 0.5), 0.1);
    case 'capacitor':  return 1e6;
    case 'inductor':   return 0.1;
    case 'led':        return 68;
    case 'diode': case 'zener': return 10;
    case 'switch_': case 'pushbtn':
      return comp._closed ? 0.05 : Infinity;
    case 'relay':
      return comp._energized ? 0.1 : Infinity;
    case 'npn': case 'pnp': case 'mosfet':
      return comp._on ? 0.5 : Infinity;
    case 'fuse':
      return comp._blown ? Infinity : 0.05;
    case 'breaker':
      return comp._tripped ? Infinity : 0.05;
    case 'motor':      return comp._motR ?? 15;
    case 'bulb':       return comp._ohms ?? 60;
    case 'buzzer': case 'speaker': return comp._ohms ?? 8;
    case 'heater':     return comp._ohms ?? 30;
    case 'voltmeter':  return 1e6;
    case 'ammeter':    return 0.01;
    case 'varistor':   return comp._ohms ?? 100000;
    case 'and_gate': case 'or_gate': case 'not_gate':
      return 1e6;
    default:           return 10;
  }
}

function findPath(graph, startTid, endTid, depth, visited, visitedComps) {
  if (depth > 80 || visited.has(startTid)) return null;
  if (startTid === endTid && depth > 0) return { steps:[], R:0 };
  visited.add(startTid);

  const term = graph.terminals.get(startTid);
  if (!term) return null;
  const comp = graph.components.get(term.compId);

  if (comp && comp._role !== 'source' && !visitedComps.has(comp.id)) {
    const r = compR(comp);
    if (r < Infinity) {
      visitedComps.add(comp.id);
      for (const otid of comp.termIds) {
        if (otid === startTid) continue;
        const res = findPath(graph, otid, endTid, depth+1, new Set(visited), new Set(visitedComps));
        if (res) return { steps:[{ kind:'c', id:comp.id, R:r }, ...res.steps], R:r+res.R };
      }
    }
    if (r === Infinity) return null;
  }

  for (const wid of term.wireIds) {
    const w = graph.wires.get(wid);
    if (!w) continue;
    const nextTid = w.from === startTid ? w.to : w.from;
    const nextT   = graph.terminals.get(nextTid);
    if (!nextT) continue;
    const nextComp = graph.components.get(nextT.compId);
    if (nextComp?._role === 'source' && nextTid !== endTid) continue;
    const res = findPath(graph, nextTid, endTid, depth+1, new Set(visited), new Set(visitedComps));
    if (res) return { steps:[{ kind:'w', wid }, ...res.steps], R:res.R };
  }
  return null;
}

export function solveDC(graph) {
  const out = {
    ok: false, status: 'off',
    Vs: 0, I: 0, P: 0,
    compOut: new Map(),
    wireOut: new Map(),
    termV:   new Map(),
  };
  graph.components.forEach(c => out.compOut.set(c.id, { V:0, I:0, P:0, active:false }));
  graph.wires.forEach(w    => out.wireOut.set(w.id,  { active:false, I:0, fi:0 }));

  const sources = [...graph.components.values()].filter(c => c._role === 'source');
  if (!sources.length) return out;

  let fuseBlow = false;

  sources.forEach(src => {
    const terms = src.termIds.map(tid => graph.terminals.get(tid)).filter(Boolean);
    const posT  = terms.find(t => t.polarity === 'source');
    const negT  = terms.find(t => t.polarity === 'sink');
    if (!posT || !negT) return;

    const Vs = (src._voltage ?? 9) * (src.type === 'solar'
      ? Math.max(0, Math.min(1, src._irr ?? 1)) : 1);
    if (Vs < 0.01) return;
    out.Vs = Math.max(out.Vs, Vs);

    const path = findPath(graph, posT.id, negT.id, 0, new Set(), new Set());
    if (!path) { out.status = 'open'; return; }
    if (path.R < 0.3) { out.status = 'short'; return; }

    const Rtot = Math.max(path.R + compR(src), 0.001);
    const I    = Vs / Rtot;
    out.I += I;  out.P += Vs * I;  out.ok = true;  out.status = 'running';
    out.termV.set(posT.id, Vs);
    out.termV.set(negT.id, 0);

    const so = out.compOut.get(src.id);
    so.V = Vs; so.I = I; so.P = Vs*I; so.active = true;

    path.steps.forEach(s => {
      if (s.kind === 'c') {
        const co = out.compOut.get(s.id);
        const cc = graph.components.get(s.id);
        co.I += I; co.V = Math.max(co.V, I*s.R); co.P += I*I*s.R; co.active = true;
        if (cc?.type === 'fuse' && !cc._blown && co.I > (cc._rating ?? 1)) {
          cc._blown = true; fuseBlow = true;
        }
      }
      if (s.kind === 'w') {
        const wo = out.wireOut.get(s.wid);
        if (wo) { wo.active = true; wo.I += I; wo.fi = Math.min(wo.I / 0.06, 1); }
      }
    });
  });

  if (fuseBlow) return solveDC(graph);
  return out;
}

// Behavior Engine
export function calcBehavior(comp, dcOut) {
  const co  = dcOut.compOut?.get(comp.id) ?? { V:0, I:0, P:0, active:false };
  const I   = co.I, V = co.V, act = I > 0.0005;
  let state = 'OFF', powerLevel = 0, faults = [], thermalC = 25 + co.P * 100;

  switch (comp.type) {
    case 'battery': case 'solar': case 'acsource':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(I / (comp._maxI ?? 2), 1);
      break;
    case 'resistor': case 'varistor':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(co.P / (comp._maxP ?? 0.25), 1);
      if (powerLevel > 1) faults.push('Over power rating');
      break;
    case 'potmeter': case 'thermistor': case 'ldr':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(co.P / 0.1, 1);
      break;
    case 'capacitor':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(Math.abs(comp._Vc ?? 0) / 5, 1);
      break;
    case 'inductor':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(I / 0.5, 1);
      break;
    case 'led':
      state = (act && V >= (comp._fwdV ?? 1.8)) ? 'ON' : 'OFF';
      powerLevel = state === 'ON' ? Math.min(I / (comp._maxI ?? 0.05), 1) : 0;
      if (act && I > (comp._maxI ?? 0.05) * 1.2) faults.push('Overcurrent — needs resistor');
      break;
    case 'diode':
      state = (act && V >= (comp._fwdV ?? 0.7)) ? 'ACTIVE' : 'OFF';
      powerLevel = state === 'ACTIVE' ? Math.min(I / 0.5, 1) : 0;
      break;
    case 'zener':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(I / 0.1, 1);
      break;
    case 'motor': {
      const Vmin = comp._minV ?? 3, Vr = comp._ratedV ?? 12;
      state = act && V >= Vmin ? 'ACTIVE' : act ? 'IDLE' : 'OFF';
      powerLevel = state === 'ACTIVE' ? Math.min((V - Vmin) / (Vr - Vmin), 1) : 0;
      break;
    }
    case 'bulb':
      state = act ? 'ON' : 'OFF';
      powerLevel = Math.min(co.P / (comp._ratedW ?? 1), 1);
      break;
    case 'buzzer': case 'speaker':
      state = (act && V >= (comp._minV ?? 3)) ? 'ACTIVE' : 'OFF';
      powerLevel = state === 'ACTIVE' ? Math.min(I / 0.1, 1) : 0;
      break;
    case 'heater':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(co.P / (comp._ratedW ?? 5), 1);
      thermalC = 25 + co.P * 30;
      if (thermalC > 100) faults.push('High temperature');
      break;
    case 'switch_': case 'pushbtn':
      state = comp._closed && act ? 'ACTIVE' : 'OFF';
      powerLevel = comp._closed && act ? 1 : 0;
      break;
    case 'relay':
      if (comp._energized) {
        state = act ? 'ACTIVE' : 'ON';
        powerLevel = 0.8;
      } else {
        state = 'OFF'; powerLevel = 0;
      }
      break;
    case 'npn': case 'pnp': case 'mosfet':
      state = comp._on ? (act ? 'ACTIVE' : 'ON') : 'OFF';
      powerLevel = comp._on && act ? Math.min(I / 0.1, 1) : 0;
      break;
    case 'fuse':
      if (comp._blown) { state = 'FAULT'; faults.push('Fuse blown — tap ↺ to reset'); }
      else { state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(I / (comp._rating ?? 1), 0.9); }
      break;
    case 'breaker':
      if (comp._tripped) { state = 'FAULT'; faults.push('Breaker tripped — tap ↺ to reset'); }
      else {
        state = act ? 'ACTIVE' : 'OFF';
        powerLevel = Math.min(I / (comp._rating ?? 5), 0.9);
        if (I > (comp._rating ?? 5) * 1.1) { comp._tripped = true; }
      }
      break;
    case 'voltmeter':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(V / 15, 1);
      break;
    case 'ammeter':
      state = act ? 'ACTIVE' : 'OFF';
      powerLevel = Math.min(I / 1, 1);
      break;
    case 'and_gate': case 'or_gate': case 'not_gate':
      state = comp._out ? 'ON' : 'OFF';
      powerLevel = comp._out ? 1 : 0;
      break;
    default:
      state = act ? 'ACTIVE' : 'OFF';
  }
  return { state, powerLevel, faults, V:co.V, I:co.I, P:co.P, thermalC };
}