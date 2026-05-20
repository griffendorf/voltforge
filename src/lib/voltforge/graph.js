import { DEFS } from './definitions';
import { CW, CH, SNAP_R } from './theme';

let _seq = 1;
export const uid = p => `${p}${(_seq++).toString(36)}`;

class UF {
  constructor() { this.p = new Map(); }
  add(x)    { if (!this.p.has(x)) this.p.set(x, x); }
  find(x)   { if (this.p.get(x) !== x) this.p.set(x, this.find(this.p.get(x))); return this.p.get(x); }
  union(a,b){ this.p.set(this.find(a), this.find(b)); }
  groups()  {
    const m = new Map();
    this.p.forEach((_, x) => { const r = this.find(x); if (!m.has(r)) m.set(r, new Set()); m.get(r).add(x); });
    return [...m.values()];
  }
}

export class CircuitGraph {
  constructor() {
    this.components = new Map();
    this.terminals  = new Map();
    this.wires      = new Map();
    this.nodes      = new Map();
    this.version    = 0;
  }

  _bump() { this.version++; }

  _wp(term, comp) {
    const cx = comp.x + CW/2, cy = comp.y + CH/2;
    const rad = comp.rotation * Math.PI / 180;
    const lx = term.lp.x - CW/2, ly = term.lp.y - CH/2;
    term.wx = cx + lx*Math.cos(rad) - ly*Math.sin(rad);
    term.wy = cy + lx*Math.sin(rad) + ly*Math.cos(rad);
    const DIRS = ['top','right','bottom','left'];
    term.dir = DIRS[(DIRS.indexOf(term.baseDir) + Math.round(comp.rotation/90) + 4) % 4];
  }

  _rebuildNodes() {
    this.nodes.clear();
    this.terminals.forEach(t => { t.nodeId = null; });
    this.wires.forEach(w => { w.nodeId = null; });

    const uf = new UF();
    this.terminals.forEach((_, tid) => uf.add(tid));
    this.wires.forEach(w => { uf.add(w.from); uf.add(w.to); uf.union(w.from, w.to); });

    uf.groups().forEach(group => {
      const wired = [...group].filter(tid => {
        const t = this.terminals.get(tid);
        return t && t.wireIds.size > 0;
      });
      if (!wired.length) return;
      const node = { id: uid('n'), termIds: new Set(group), wireIds: new Set() };
      group.forEach(tid => {
        const t = this.terminals.get(tid);
        if (t) {
          t.nodeId = node.id;
          t.wireIds.forEach(wid => {
            node.wireIds.add(wid);
            const w = this.wires.get(wid);
            if (w) w.nodeId = node.id;
          });
        }
      });
      this.nodes.set(node.id, node);
    });
  }

  addComponent(type, x, y) {
    const def = DEFS[type];
    if (!def) return null;
    const comp = { id:uid('c'), type, x, y, rotation:0,
                   label:`${type.slice(0,3).toUpperCase()}-${String(_seq).padStart(2,'0')}`,
                   termIds:[],
                   ...Object.fromEntries(
                     Object.entries(def).filter(([k]) => k.startsWith('_'))
                   ),
                 };
    def.terms.forEach(td => {
      const t = { id:uid('t'), compId:comp.id, key:td.key, label:td.label,
                  lp:{...td.lp}, polarity:td.pol, baseDir:td.dir,
                  dir:td.dir, wx:0, wy:0, wireIds:new Set(), nodeId:null };
      this._wp(t, comp);
      this.terminals.set(t.id, t);
      comp.termIds.push(t.id);
    });
    this.components.set(comp.id, comp);
    this._bump();
    return comp;
  }

  removeComponent(id) {
    const comp = this.components.get(id);
    if (!comp) return;
    const wids = new Set();
    comp.termIds.forEach(tid => { const t = this.terminals.get(tid); if (t) t.wireIds.forEach(w => wids.add(w)); });
    wids.forEach(wid => this._deleteWire(wid));
    comp.termIds.forEach(tid => this.terminals.delete(tid));
    this.components.delete(id);
    this._rebuildNodes();
    this._bump();
  }

  moveComponent(id, x, y) {
    const c = this.components.get(id);
    if (!c) return;
    c.x = x; c.y = y;
    c.termIds.forEach(tid => { const t = this.terminals.get(tid); if (t) this._wp(t, c); });
    this._bump();
  }

  rotateComponent(id) {
    const c = this.components.get(id);
    if (!c) return;
    c.rotation = (c.rotation + 90) % 360;
    c.termIds.forEach(tid => { const t = this.terminals.get(tid); if (t) this._wp(t, c); });
    this._bump();
  }

  canConnect(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return { ok:false };
    const tA = this.terminals.get(fromId), tB = this.terminals.get(toId);
    if (!tA || !tB) return { ok:false, reason:'Terminal missing' };
    if (tA.compId === tB.compId) return { ok:false, reason:'Same component' };
    for (const wid of tA.wireIds) {
      const w = this.wires.get(wid);
      if (w && (w.from === toId || w.to === toId)) return { ok:false, reason:'Already wired' };
    }
    if (tA.polarity !== 'neutral' && tB.polarity !== 'neutral' && tA.polarity === tB.polarity)
      return { ok:false, reason:'Polarity clash' };
    return { ok:true };
  }

  addWire(fromId, toId, color = '#00d4ff') {
    const check = this.canConnect(fromId, toId);
    if (!check.ok) return null;
    const w = { id:uid('w'), from:fromId, to:toId, color, nodeId:null };
    this.wires.set(w.id, w);
    this.terminals.get(fromId).wireIds.add(w.id);
    this.terminals.get(toId).wireIds.add(w.id);
    this._rebuildNodes();
    this._bump();
    return w;
  }

  removeWire(id) { this._deleteWire(id); this._rebuildNodes(); this._bump(); }

  _deleteWire(id) {
    const w = this.wires.get(id);
    if (!w) return;
    const tA = this.terminals.get(w.from), tB = this.terminals.get(w.to);
    if (tA) tA.wireIds.delete(id);
    if (tB) tB.wireIds.delete(id);
    this.wires.delete(id);
  }

  findSnap(wx, wy, excludeCompId, fromTermId) {
    let best = null, bestD = SNAP_R;
    this.terminals.forEach(t => {
      if (t.compId === excludeCompId) return;
      const d = Math.hypot(t.wx - wx, t.wy - wy);
      if (d < bestD) {
        bestD = d;
        best = { term:t, dist:d, valid: this.canConnect(fromTermId, t.id).ok };
      }
    });
    return best;
  }

  clearAll() {
    [...this.components.keys()].forEach(id => this.removeComponent(id));
    this.version = 0;
  }

  get stats() { return { c:this.components.size, w:this.wires.size, n:this.nodes.size }; }
}