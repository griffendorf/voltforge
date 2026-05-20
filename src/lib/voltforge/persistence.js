import { DEFS } from './definitions';
import { uid } from './graph';

const LS_IDX = 'vf:idx';
const LS_PFX = 'vf:p:';
const LS_AS  = 'vf:autosave';
const SCHEMA = '1.0';

class Serializer {
  pack(graph, meta = {}) {
    const cs = [...graph.components.values()].map(c => ({
      id: c.id, type: c.type, x: c.x, y: c.y, rot: c.rotation,
      lbl: c.label,
      sp: Object.fromEntries(Object.entries(c).filter(([k]) => k.startsWith('_'))),
      tmap: c.termIds.map((tid, i) => ({ id: tid, i })),
    }));
    const ws = [...graph.wires.values()].map(w => ({
      id: w.id, from: w.from, to: w.to, color: w.color,
    }));
    return {
      schema: SCHEMA,
      pid: meta.pid || uid('p'),
      name: meta.name || 'Untitled',
      saved: Date.now(),
      stats: { c: graph.components.size, w: graph.wires.size },
      cs, ws,
    };
  }

  unpack(data, graph) {
    graph.clearAll();
    const remap = new Map();
    const warn = [];

    (data.cs || []).forEach(cd => {
      if (!DEFS[cd.type]) { warn.push(`Unknown type: ${cd.type}`); return; }
      const comp = graph.addComponent(cd.type, cd.x ?? 100, cd.y ?? 100);
      if (!comp) return;
      comp.label = cd.lbl || comp.label;
      comp.rotation = cd.rot || 0;
      comp.termIds.forEach(tid => { const t = graph.terminals.get(tid); if (t) graph._wp(t, comp); });
      Object.assign(comp, cd.sp || {});
      (cd.tmap || []).forEach(({ id: oldId, i }) => {
        const newId = comp.termIds[i];
        if (newId && oldId) remap.set(oldId, newId);
      });
    });

    let wOk = 0, wFail = 0;
    (data.ws || []).forEach(wd => {
      const f = remap.get(wd.from) || wd.from;
      const t = remap.get(wd.to) || wd.to;
      if (!graph.terminals.has(f) || !graph.terminals.has(t)) { wFail++; return; }
      const w = graph.addWire(f, t, wd.color);
      if (w) { wOk++; } else wFail++;
    });

    if (wFail) warn.push(`${wFail} wire(s) could not be restored`);
    return { ok: true, warnings: warn, wires: wOk };
  }
}

export class Store {
  constructor() { this._s = new Serializer(); }

  _idx() { try { return JSON.parse(localStorage.getItem(LS_IDX) || '[]'); } catch { return []; } }
  _setIdx(arr) { localStorage.setItem(LS_IDX, JSON.stringify(arr)); }

  list() { return this._idx().sort((a, b) => b.saved - a.saved); }

  save(graph, meta) {
    const p = this._s.pack(graph, meta);
    const key = LS_PFX + p.pid;
    localStorage.setItem(key, JSON.stringify(p));
    const idx = this._idx().filter(x => x.pid !== p.pid);
    idx.push({ pid: p.pid, name: p.name, saved: p.saved, stats: p.stats });
    this._setIdx(idx);
    return { ok: true, pid: p.pid, name: p.name };
  }

  load(pid) {
    const raw = localStorage.getItem(LS_PFX + pid);
    if (!raw) return { ok: false, err: 'Not found' };
    return { ok: true, data: JSON.parse(raw) };
  }

  delete(pid) {
    localStorage.removeItem(LS_PFX + pid);
    this._setIdx(this._idx().filter(x => x.pid !== pid));
  }

  autoSave(graph, meta) {
    try { localStorage.setItem(LS_AS, JSON.stringify(this._s.pack(graph, meta))); } catch {}
  }

  loadAutoSave() {
    try { const r = localStorage.getItem(LS_AS); return r ? JSON.parse(r) : null; } catch { return null; }
  }

  export(graph, meta) {
    const p = this._s.pack(graph, meta);
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(meta.name || 'circuit').replace(/\s+/g, '_')}.vf.json`;
    a.click();
  }

  unpack(data, graph) { return this._s.unpack(data, graph); }
}

export class HistoryMgr {
  constructor() { this._past = []; this._future = []; this._s = new Serializer(); }

  push(graph, meta) {
    this._past.push(this._s.pack(graph, meta));
    if (this._past.length > 40) this._past.shift();
    this._future = [];
  }

  undo(graph) {
    if (this._past.length < 2) return false;
    this._future.push(this._past.pop());
    this._s.unpack(this._past[this._past.length - 1], graph);
    return true;
  }

  redo(graph) {
    if (!this._future.length) return false;
    const snap = this._future.pop();
    this._past.push(snap);
    this._s.unpack(snap, graph);
    return true;
  }

  get canUndo() { return this._past.length > 1; }
  get canRedo() { return this._future.length > 0; }
  clear() { this._past = []; this._future = []; }
}