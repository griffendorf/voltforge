import { solveDC, calcBehavior } from './solver';

export class SimLoop {
  constructor(graph) {
    this._g       = graph;
    this._running = false;
    this._paused  = false;
    this._timer   = null;
    this._tps     = 20;
    this._hash    = '';
    this._cached  = null;
    this.tick     = 0;
    this.snap     = null;
    this.onChange = null;
  }

  _hashGraph() {
    let h = '';
    this._g.components.forEach(c =>
      h += `${c.id}:${c._closed}${c._blown}${c._voltage}${c._irr}|`);
    h += [...this._g.wires.keys()].join(',');
    return h;
  }

  _step() {
    if (!this._running || this._paused) return;
    this.tick++;

    const h = this._hashGraph();
    if (h !== this._hash) { this._hash = h; this._cached = null; }
    const dc = this._cached ?? (this._cached = solveDC(this._g));

    const bh = new Map();
    this._g.components.forEach(c => bh.set(c.id, calcBehavior(c, dc)));

    this.snap = {
      tick:   this.tick,
      status: dc.status,
      Vs:     dc.Vs,
      I:      dc.I,
      P:      dc.P,
      wires:  dc.wireOut,
      termV:  dc.termV,
      bh,
    };
    this.onChange?.();
  }

  _schedule() {
    if (!this._running) return;
    this._timer = setTimeout(() => { this._step(); this._schedule(); }, 1000 / this._tps);
  }

  start() {
    if (this._running) return;
    this._running = true; this._paused = false;
    this.tick = 0; this._cached = null; this._hash = '';
    this._schedule();
  }

  stop() {
    this._running = false;
    clearTimeout(this._timer);
    this.snap = null;
    this.onChange?.();
  }

  pause()      { this._paused = !this._paused; }
  invalidate() { this._cached = null; this._hash = ''; }
  step()       { if (!this._running) { this.tick++; this._step(); } }

  get running() { return this._running; }
  get paused()  { return this._paused;  }
}