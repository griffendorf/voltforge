# VoltForge — Complete Source Code
Generated: 2026-05-22

---

## index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="https://base44.com/logo_v2.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="manifest" href="/manifest.json" />
    <title>Base44 APP</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
```

---

## index.css

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=JetBrains+Mono:wght@400;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 18%;
    --foreground: 200 60% 92%;
    --card: 210 40% 22%;
    --card-foreground: 200 60% 92%;
    --popover: 210 40% 7%;
    --popover-foreground: 200 60% 92%;
    --primary: 190 100% 50%;
    --primary-foreground: 210 30% 3%;
    --secondary: 210 20% 12%;
    --secondary-foreground: 200 60% 92%;
    --muted: 210 20% 12%;
    --muted-foreground: 200 20% 40%;
    --accent: 160 100% 50%;
    --accent-foreground: 210 30% 3%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 8%;
    --input: 0 0% 8%;
    --ring: 190 100% 50%;
    --chart-1: 190 100% 50%;
    --chart-2: 160 100% 50%;
    --chart-3: 140 100% 54%;
    --chart-4: 43 100% 50%;
    --chart-5: 0 100% 62%;
    --radius: 0.5rem;
    --font-orbitron: 'Orbitron', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --sidebar-background: 210 40% 5%;
    --sidebar-foreground: 200 60% 92%;
    --sidebar-primary: 190 100% 50%;
    --sidebar-primary-foreground: 210 30% 3%;
    --sidebar-accent: 210 20% 12%;
    --sidebar-accent-foreground: 200 60% 92%;
    --sidebar-border: 0 0% 8%;
    --sidebar-ring: 190 100% 50%;
  }

  .dark {
    --background: 210 40% 18%;
    --foreground: 200 60% 92%;
    --card: 210 40% 22%;
    --card-foreground: 200 60% 92%;
    --popover: 210 40% 7%;
    --popover-foreground: 200 60% 92%;
    --primary: 190 100% 50%;
    --primary-foreground: 210 30% 3%;
    --secondary: 210 20% 12%;
    --secondary-foreground: 200 60% 92%;
    --muted: 210 20% 12%;
    --muted-foreground: 200 20% 40%;
    --accent: 160 100% 50%;
    --accent-foreground: 210 30% 3%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 8%;
    --input: 0 0% 8%;
    --ring: 190 100% 50%;
    --chart-1: 190 100% 50%;
    --chart-2: 160 100% 50%;
    --chart-3: 140 100% 54%;
    --chart-4: 43 100% 50%;
    --chart-5: 0 100% 62%;
    --sidebar-background: 210 40% 5%;
    --sidebar-foreground: 200 60% 92%;
    --sidebar-primary: 190 100% 50%;
    --sidebar-primary-foreground: 210 30% 3%;
    --sidebar-accent: 210 20% 12%;
    --sidebar-accent-foreground: 200 60% 92%;
    --sidebar-border: 0 0% 8%;
    --sidebar-ring: 190 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    overflow: hidden;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    overscroll-behavior: none;
  }
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { 
  height: 100%;
  height: 100dvh;
  height: -webkit-fill-available;
}
button { 
  cursor: pointer; 
  font-family: 'JetBrains Mono', monospace;
  min-height: 44px;
  min-width: 44px;
  user-select: none;
}
a { user-select: none; }
header { user-select: none; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.18); border-radius: 2px; }

@keyframes popIn    { from { opacity:0; transform:scale(0.6) } to { opacity:1; transform:scale(1) } }
@keyframes snapRing { 0% { r:8; opacity:.9 } 100% { r:22; opacity:0 } }
@keyframes termPulse{ 0%,100%{ box-shadow:0 0 0 0 rgba(0,212,255,0) } 50%{ box-shadow:0 0 0 6px rgba(0,212,255,.25) } }
@keyframes slideIn  { from { opacity:0; transform:translateX(12px) } to   { opacity:1; transform:translateX(0) } }
@keyframes pulse    { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
@keyframes wireFlow { to { stroke-dashoffset: -20 } }
@keyframes stateBlink { 0%,100%{ opacity:1 } 50%{ opacity:.2 } }
@keyframes spin       { to { transform:rotate(360deg) } }
```

---

## tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: { '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))', '3': 'hsl(var(--chart-3))', '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))' },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## App.jsx

```jsx
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import LoginScreen from '@/components/LoginScreen';
import VoltForgeRoutes from '@/lib/VoltForgeRoutes';
import Pricing from '@/pages/Pricing';
import ThankYou from '@/pages/ThankYou';
import AccountSettings from '@/pages/AccountSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background:'#0d1520' }}>
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
        return <LoginScreen />;
    }
  }

  return (
    <Routes>
      <Route path="/*" element={<VoltForgeRoutes />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/account" element={<AccountSettings />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
```

---

## api/base44Client.js

```js
import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
```

---

## lib/VoltForgeRoutes.jsx

```jsx
import { Routes, Route } from 'react-router-dom';
import VoltForge from '@/pages/VoltForge';

export default function VoltForgeRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<VoltForge />} />
    </Routes>
  );
}
```

---

## lib/useSubscription.js

```js
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscription() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const subs = await base44.entities.Subscription.filter({ user_email: me.email, status: 'active' });
        if (subs.length > 0) {
          // Pick highest tier
          const tierOrder = { premium: 2, pro: 1, free: 0 };
          const best = subs.reduce((a, b) => (tierOrder[b.tier] > tierOrder[a.tier] ? b : a));
          setTier(best.tier);
        } else {
          setTier('free');
        }
      } catch {
        setTier('free');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // TEMPORARY: grant premium to everyone
  return { tier: 'premium', loading: false, user };
}
```

---

## lib/voltforge/theme.js

```js
// VoltForge Theme Constants
export const T = {
  bg:'#040709', panel:'#07101c', card:'#0b1828', lift:'#0f2034',
  b1:'rgba(255,255,255,0.06)', b2:'rgba(255,255,255,0.11)',
  blue:'#00d4ff', cyan:'#00ffcc', green:'#39ff7a',
  amber:'#ffb300', red:'#ff3a3a', purple:'#a855f7',
  text:'#ddeeff', sub:'#486880', dim:'#1b3248',
};

export const CW = 72, CH = 72, SNAP_R = 40;

export const STATE_COL = {
  ON:     '#39ff7a',
  ACTIVE: '#00ffcc',
  IDLE:   '#486880',
  OFF:    '#1b3248',
  FAULT:  '#ff3a3a',
};
```

---

## lib/voltforge/instances.js

```js
import { CircuitGraph } from './graph';
import { SimLoop } from './simloop';
import { Store, HistoryMgr } from './persistence';

// Singletons shared across the app
export const G     = new CircuitGraph();
export const SIM   = new SimLoop(G);
export const STORE = new Store();
export const HIST  = new HistoryMgr();
```

---

## lib/voltforge/graph.js

```js
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

  canConnect(fromId, toId, ignoreWireId) {
    if (!fromId || !toId || fromId === toId) return { ok:false };
    const tA = this.terminals.get(fromId), tB = this.terminals.get(toId);
    if (!tA || !tB) return { ok:false, reason:'Terminal missing' };
    if (tA.compId === tB.compId) return { ok:false, reason:'Same component' };
    for (const wid of tA.wireIds) {
      if (ignoreWireId && wid === ignoreWireId) continue;
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

  findSnap(wx, wy, excludeCompId, fromTermId, ignoreWireId) {
    let best = null, bestD = SNAP_R;
    this.terminals.forEach(t => {
      if (t.compId === excludeCompId) return;
      const d = Math.hypot(t.wx - wx, t.wy - wy);
      if (d < bestD) {
        bestD = d;
        best = { term:t, dist:d, valid: this.canConnect(fromTermId, t.id, ignoreWireId).ok };
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
```

---

## lib/voltforge/definitions.js

```js
import { T } from './theme';

export const DEFS = {
  // ── SOURCES
  battery:   { label:'Battery',    emoji:'🔋', color:T.amber,
    _role:'source', _voltage:9, _iR:0.5, _maxI:2,
    terms:[{key:'pos',label:'+', lp:{x:36,y:0}, dir:'top',    pol:'source'},
           {key:'neg',label:'−', lp:{x:36,y:72},dir:'bottom', pol:'sink'  }]},

  solar:     { label:'Solar',      emoji:'☀️', color:'#ffcc00',
    _role:'source', _voltage:12, _iR:0.8, _irr:1,
    terms:[{key:'pos',label:'S+',lp:{x:36,y:0}, dir:'top',    pol:'source'},
           {key:'neg',label:'S−',lp:{x:36,y:72},dir:'bottom', pol:'sink'  }]},

  acsource:  { label:'AC Source',  emoji:'∿', color:'#ff9800',
    _role:'source', _voltage:12, _freq:50, _iR:0.5,
    terms:[{key:'pos',label:'L', lp:{x:36,y:0}, dir:'top',    pol:'source'},
           {key:'neg',label:'N', lp:{x:36,y:72},dir:'bottom', pol:'sink'  }]},

  // ── PASSIVE
  resistor:  { label:'Resistor',   emoji:'〰', color:T.cyan,
    _role:'passive', _ohms:220, _maxP:0.25,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  potmeter:  { label:'Pot',        emoji:'🎚', color:T.cyan,
    _role:'passive', _ohms:10000, _wiper:0.5,
    terms:[{key:'t1',label:'A', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'wiper',label:'W', lp:{x:36,y:0}, dir:'top', pol:'neutral'},
           {key:'t2',label:'B', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  capacitor: { label:'Capacitor',  emoji:'⊣⊢', color:T.purple,
    _role:'passive', _farads:0.0001, _Vc:0,
    terms:[{key:'t1',label:'+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  inductor:  { label:'Inductor',   emoji:'⌇', color:'#7c4dff',
    _role:'passive', _henries:0.001,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  thermistor:{ label:'Thermistor', emoji:'🌡', color:T.cyan,
    _role:'passive', _ohms:10000, _tempC:25,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  ldr:       { label:'LDR',        emoji:'👁', color:T.cyan,
    _role:'passive', _ohms:5000, _lux:100,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  // ── SEMICONDUCTORS
  led:       { label:'LED',        emoji:'LED', color:T.green,
    _role:'load', _fwdV:1.8, _maxI:0.05,
    terms:[{key:'an',label:'A+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'ca',label:'K−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  diode:     { label:'Diode',      emoji:'⊳|', color:'#ef5350',
    _role:'passive', _fwdV:0.7,
    terms:[{key:'an',label:'A+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'ca',label:'K−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  zener:     { label:'Zener',      emoji:'⊳‖', color:'#ec407a',
    _role:'passive', _fwdV:0.7, _zV:5.1,
    terms:[{key:'an',label:'A+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'ca',label:'K−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  npn:       { label:'NPN',        emoji:'⏚', color:'#26c6da',
    _role:'transistor', _hFE:100, _on:false,
    terms:[{key:'base',  label:'B', lp:{x:0,y:36},  dir:'left',   pol:'base'},
           {key:'coll',  label:'C', lp:{x:36,y:0},  dir:'top',    pol:'neutral'},
           {key:'emit',  label:'E', lp:{x:36,y:72}, dir:'bottom', pol:'neutral'}]},

  pnp:       { label:'PNP',        emoji:'⏛', color:'#ab47bc',
    _role:'transistor', _hFE:100, _on:false,
    terms:[{key:'base',  label:'B', lp:{x:0,y:36},  dir:'left',   pol:'base'},
           {key:'emit',  label:'E', lp:{x:36,y:0},  dir:'top',    pol:'neutral'},
           {key:'coll',  label:'C', lp:{x:36,y:72}, dir:'bottom', pol:'neutral'}]},

  mosfet:    { label:'MOSFET',     emoji:'⊡', color:'#29b6f6',
    _role:'transistor', _vth:2.0, _on:false,
    terms:[{key:'gate',  label:'G', lp:{x:0,y:36},  dir:'left',   pol:'gate'},
           {key:'drain', label:'D', lp:{x:36,y:0},  dir:'top',    pol:'neutral'},
           {key:'src',   label:'S', lp:{x:36,y:72}, dir:'bottom', pol:'neutral'}]},

  // ── LOADS
  motor:     { label:'Motor',      emoji:'⚙️', color:T.red,
    _role:'load', _motR:15, _minV:3, _ratedV:12,
    terms:[{key:'pos',label:'M+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'neg',label:'M−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  bulb:      { label:'Bulb',       emoji:'BULB', color:'#ffd54f',
    _role:'load', _ohms:60, _ratedW:1,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  buzzer:    { label:'Buzzer',     emoji:'🔔', color:'#ff7043',
    _role:'load', _ohms:8, _minV:3,
    terms:[{key:'pos',label:'+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'neg',label:'−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  speaker:   { label:'Speaker',    emoji:'🔊', color:'#ff7043',
    _role:'load', _ohms:8,
    terms:[{key:'pos',label:'+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'neg',label:'−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  heater:    { label:'Heater',     emoji:'♨️', color:'#ff5722',
    _role:'load', _ohms:30, _ratedW:5,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  // ── SWITCHES
  switch_:   { label:'Switch',     emoji:'🔀', color:T.blue,
    _role:'switch', _closed:false,
    terms:[{key:'in', label:'A', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'out',label:'B', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  pushbtn:   { label:'Push Btn',   emoji:'⏺', color:T.blue,
    _role:'switch', _closed:false, _momentary:true,
    terms:[{key:'in', label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'out',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  spdt:      { label:'SPDT',       emoji:'⇌', color:T.blue,
    _role:'switch', _position:'no',
    terms:[{key:'com',label:'C',  lp:{x:0,y:36},  dir:'left',   pol:'neutral'},
           {key:'no', label:'NO', lp:{x:72,y:18}, dir:'right',  pol:'neutral'},
           {key:'nc', label:'NC', lp:{x:72,y:54}, dir:'right',  pol:'neutral'}]},

  dpdt:      { label:'DPDT Rev',   emoji:'⇔', color:'#ffd700',
    _role:'switch', _position:'off',
    terms:[{key:'c1', label:'C1', lp:{x:0,y:18},  dir:'left',   pol:'neutral'},
           {key:'c2', label:'C2', lp:{x:0,y:54},  dir:'left',   pol:'neutral'},
           {key:'f1', label:'F1', lp:{x:72,y:18}, dir:'right',  pol:'neutral'},
           {key:'f2', label:'F2', lp:{x:72,y:54}, dir:'right',  pol:'neutral'},
           {key:'r1', label:'R1', lp:{x:36,y:0},  dir:'top',    pol:'neutral'},
           {key:'r2', label:'R2', lp:{x:36,y:72}, dir:'bottom', pol:'neutral'}]},

  relay:     { label:'Relay',      emoji:'🔁', color:'#66bb6a',
    _role:'relay', _energized:false, _coilR:180, _pickupV:4.5,
    terms:[{key:'coil1',label:'C+', lp:{x:0,y:18}, dir:'left',  pol:'neutral'},
           {key:'coil2',label:'C−', lp:{x:0,y:54}, dir:'left',  pol:'neutral'},
           {key:'sw',   label:'SW', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  // ── PROTECTION
  fuse:      { label:'Fuse',       emoji:'🛡', color:T.amber,
    _role:'protection', _blown:false, _rating:1,
    terms:[{key:'in', label:'IN',  lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  breaker:   { label:'Breaker',    emoji:'⚡', color:T.amber,
    _role:'protection', _tripped:false, _rating:5,
    terms:[{key:'in', label:'IN',  lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  varistor:  { label:'Varistor',   emoji:'⚁', color:'#78909c',
    _role:'passive', _ohms:100000, _clampV:14,
    terms:[{key:'t1',label:'1', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'t2',label:'2', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  // ── AC COMPONENTS
  transformer:{ label:'Transformer', emoji:'⇌', color:'#ff9800',
    _role:'passive', _ratio:1, _maxVA:50,
    terms:[{key:'p1',label:'P+', lp:{x:0,y:18}, dir:'left',  pol:'neutral'},
           {key:'p2',label:'P−', lp:{x:0,y:54}, dir:'left',  pol:'neutral'},
           {key:'s1',label:'S+', lp:{x:72,y:18},dir:'right', pol:'neutral'},
           {key:'s2',label:'S−', lp:{x:72,y:54},dir:'right', pol:'neutral'}]},

  triac:     { label:'TRIAC',      emoji:'⬡', color:'#ff7043',
    _role:'transistor', _vth:1.0, _on:false,
    terms:[{key:'a1',  label:'A1', lp:{x:0,y:18},  dir:'left',   pol:'neutral'},
           {key:'a2',  label:'A2', lp:{x:0,y:54},  dir:'left',   pol:'neutral'},
           {key:'gate',label:'G',  lp:{x:72,y:36}, dir:'right',  pol:'gate'}]},

  bridge_rect:{ label:'Bridge Rect',emoji:'⟁', color:'#ef5350',
    _role:'passive', _fwdV:0.7,
    terms:[{key:'ac1',label:'AC~', lp:{x:0,y:18},  dir:'left',  pol:'neutral'},
           {key:'ac2',label:'AC~', lp:{x:0,y:54},  dir:'left',  pol:'neutral'},
           {key:'pos',label:'DC+', lp:{x:72,y:18}, dir:'right', pol:'neutral'},
           {key:'neg',label:'DC−', lp:{x:72,y:54}, dir:'right', pol:'neutral'}]},

  scr:       { label:'SCR',        emoji:'▷|', color:'#e53935',
    _role:'transistor', _vth:1.2, _on:false,
    terms:[{key:'an', label:'A',  lp:{x:0,y:36},  dir:'left',   pol:'neutral'},
           {key:'ca', label:'K',  lp:{x:72,y:36}, dir:'right',  pol:'neutral'},
           {key:'gate',label:'G', lp:{x:36,y:0},  dir:'top',    pol:'gate'}]},

  // ── DC POWER
  dc_source: { label:'DC Adj.',    emoji:'⎍', color:T.amber,
    _role:'source', _voltage:5, _iR:0.1, _maxI:3,
    terms:[{key:'pos',label:'+', lp:{x:36,y:0}, dir:'top',    pol:'source'},
           {key:'neg',label:'−', lp:{x:36,y:72},dir:'bottom', pol:'sink'  }]},

  current_src:{ label:'I Source',  emoji:'⊙', color:'#ffa726',
    _role:'source', _voltage:0, _current:0.1, _iR:100000,
    terms:[{key:'pos',label:'I+', lp:{x:36,y:0}, dir:'top',    pol:'source'},
           {key:'neg',label:'I−', lp:{x:36,y:72},dir:'bottom', pol:'sink'  }]},

  voltage_reg:{ label:'Volt Reg',  emoji:'▣', color:'#26c6da',
    _role:'passive', _ohms:0.5, _dropout:1.5,
    terms:[{key:'in', label:'IN',  lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'gnd',label:'GND', lp:{x:36,y:72},dir:'bottom',pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  opamp:     { label:'Op-Amp',     emoji:'△', color:'#7e57c2',
    _role:'passive', _gain:100000,
    terms:[{key:'inp',label:'IN+', lp:{x:0,y:18},  dir:'left',  pol:'neutral'},
           {key:'inn',label:'IN−', lp:{x:0,y:54},  dir:'left',  pol:'neutral'},
           {key:'vcc',label:'V+',  lp:{x:36,y:0},  dir:'top',   pol:'neutral'},
           {key:'vee',label:'V−',  lp:{x:36,y:72}, dir:'bottom',pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36}, dir:'right', pol:'neutral'}]},

  // ── MEASUREMENT
  voltmeter: { label:'Voltmeter',  emoji:'V̲', color:'#42a5f5',
    _role:'meter', _ohms:1000000,
    terms:[{key:'pos',label:'V+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'neg',label:'V−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  ammeter:   { label:'Ammeter',    emoji:'A̲', color:'#42a5f5',
    _role:'meter', _ohms:0.01,
    terms:[{key:'pos',label:'A+', lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'neg',label:'A−', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  // ── LOGIC GATES
  and_gate:  { label:'AND',        emoji:'⊓', color:'#66bb6a',
    _role:'logic', _out:false,
    terms:[{key:'a',  label:'A',   lp:{x:0,y:18}, dir:'left',  pol:'neutral'},
           {key:'b',  label:'B',   lp:{x:0,y:54}, dir:'left',  pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  or_gate:   { label:'OR',         emoji:'⊔', color:'#66bb6a',
    _role:'logic', _out:false,
    terms:[{key:'a',  label:'A',   lp:{x:0,y:18}, dir:'left',  pol:'neutral'},
           {key:'b',  label:'B',   lp:{x:0,y:54}, dir:'left',  pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},

  not_gate:  { label:'NOT',        emoji:'¬', color:'#66bb6a',
    _role:'logic', _out:true,
    terms:[{key:'in', label:'IN',  lp:{x:0,y:36}, dir:'left',  pol:'neutral'},
           {key:'out',label:'OUT', lp:{x:72,y:36},dir:'right', pol:'neutral'}]},
};

// Palette categories
export const CATEGORIES = [
  { id:'sources',      label:'DC Sources',    types:['battery','solar','dc_source','current_src'] },
  { id:'ac',           label:'AC',            types:['acsource','transformer','triac','bridge_rect','scr'] },
  { id:'passive',      label:'Passive',       types:['resistor','potmeter','capacitor','inductor','thermistor','ldr'] },
  { id:'semi',         label:'Semicon',       types:['led','diode','zener','npn','pnp','mosfet','opamp','voltage_reg'] },
  { id:'loads',        label:'Loads',         types:['motor','bulb','buzzer','speaker','heater'] },
  { id:'switches',     label:'Switches',      types:['switch_','pushbtn','spdt','dpdt','relay'] },
  { id:'protection',   label:'Protection',    types:['fuse','breaker','varistor'] },
  { id:'measurement',  label:'Measure',       types:['voltmeter','ammeter'] },
  { id:'logic',        label:'Logic',         types:['and_gate','or_gate','not_gate'] },
];
```

---

## lib/voltforge/routing.js

```js
// Wire routing helpers
const DV = { top:[0,-1], bottom:[0,1], left:[-1,0], right:[1,0] };

export const bezier = (ax, ay, aDirName, bx, by, bDirName) => {
  const t = Math.max(50, Math.hypot(bx-ax, by-ay) * 0.44);
  const [adx, ady] = DV[aDirName] || [1,0];
  const [bdx, bdy] = DV[bDirName] || [-1,0];
  return `M ${ax} ${ay} C ${ax+adx*t} ${ay+ady*t}, ${bx+bdx*t} ${by+bdy*t}, ${bx} ${by}`;
};

export const rubber = (ax, ay, aDir, mx, my) => {
  const t = Math.max(50, Math.hypot(mx-ax, my-ay) * 0.44);
  const [adx, ady] = DV[aDir] || [1,0];
  return `M ${ax} ${ay} C ${ax+adx*t} ${ay+ady*t}, ${mx} ${my}, ${mx} ${my}`;
};
```

---

## lib/voltforge/validation.js

```js
import { DEFS } from './definitions';

export function validateGraph(graph) {
  const issues = [];
  const comps  = [...graph.components.values()];
  const wires  = [...graph.wires.values()];

  if (!comps.length) return issues;

  const sources = comps.filter(c => DEFS[c.type]?.terms.some(t => t.pol === 'source'));
  const loads   = comps.filter(c => ['led','motor','resistor','capacitor'].includes(c.type));

  if (!sources.length) {
    issues.push({ id:'NO_SOURCE', severity:'error',
      msg:'No power source — add a Battery or Solar panel',
      compIds:[], wireIds:[] });
  }

  comps.forEach(c => {
    const allOpen = c.termIds.every(tid => graph.terminals.get(tid)?.wireIds.size === 0);
    if (allOpen) {
      issues.push({ id:`ISOLATED_${c.id}`, severity:'warning',
        msg:`${c.label} is isolated — connect it to the circuit`,
        compIds:[c.id], wireIds:[] });
    }
  });

  comps.forEach(c => {
    const terms = c.termIds.map(tid => graph.terminals.get(tid)).filter(Boolean);
    const wiredCount = terms.filter(t => t.wireIds.size > 0).length;
    if (wiredCount > 0 && wiredCount < terms.length) {
      const openTerms = terms.filter(t => t.wireIds.size === 0).map(t => t.label);
      issues.push({ id:`DANGLING_${c.id}`, severity:'warning',
        msg:`${c.label} has open terminal${openTerms.length > 1 ? 's' : ''}: ${openTerms.join(', ')}`,
        compIds:[c.id], wireIds:[] });
    }
  });

  const ledComps = comps.filter(c => c.type === 'led');
  ledComps.forEach(led => {
    const visited = new Set();
    const queue   = [led.id];
    let hasResistor = false;
    while (queue.length) {
      const cid = queue.shift();
      if (visited.has(cid)) continue;
      visited.add(cid);
      const comp = graph.components.get(cid);
      if (!comp) continue;
      if (comp.type === 'resistor' && comp.id !== led.id) { hasResistor = true; break; }
      comp.termIds.forEach(tid => {
        const term = graph.terminals.get(tid);
        if (!term) return;
        term.wireIds.forEach(wid => {
          const w = graph.wires.get(wid);
          if (!w) return;
          const otherId = graph.terminals.get(w.from)?.compId === cid
            ? graph.terminals.get(w.to)?.compId
            : graph.terminals.get(w.from)?.compId;
          if (otherId && !visited.has(otherId)) queue.push(otherId);
        });
      });
    }
    if (!hasResistor && led.termIds.some(tid => graph.terminals.get(tid)?.wireIds.size > 0)) {
      issues.push({ id:`LED_NO_R_${led.id}`, severity:'warning',
        msg:`${led.label} has no current-limiting resistor — it may burn out`,
        compIds:[led.id], wireIds:[] });
    }
  });

  if (sources.length && loads.length) {
    const canReach = (startCompId) => {
      const visited = new Set();
      const queue   = [startCompId];
      while (queue.length) {
        const cid = queue.shift();
        if (visited.has(cid)) continue;
        visited.add(cid);
        const comp = graph.components.get(cid);
        if (!comp) continue;
        if (loads.some(l => l.id === cid)) return true;
        comp.termIds.forEach(tid => {
          const term = graph.terminals.get(tid);
          if (!term) return;
          term.wireIds.forEach(wid => {
            const w = graph.wires.get(wid);
            if (!w) return;
            const tA = graph.terminals.get(w.from);
            const tB = graph.terminals.get(w.to);
            const nextCid = tA?.compId === cid ? tB?.compId : tA?.compId;
            if (nextCid && !visited.has(nextCid)) queue.push(nextCid);
          });
        });
      }
      return false;
    };
    const anyPath = sources.some(src => canReach(src.id));
    if (!anyPath && wires.length > 0) {
      issues.push({ id:'OPEN_CIRCUIT', severity:'error',
        msg:'Circuit is open — no complete path from source to load',
        compIds: sources.map(s => s.id), wireIds:[] });
    }
  }

  sources.forEach(src => {
    const posTerms = src.termIds.map(tid => graph.terminals.get(tid)).filter(t => t?.polarity === 'source');
    const negTerms = src.termIds.map(tid => graph.terminals.get(tid)).filter(t => t?.polarity === 'sink');
    posTerms.forEach(pos => {
      negTerms.forEach(neg => {
        if (pos.nodeId && pos.nodeId === neg.nodeId) {
          issues.push({ id:`SHORT_${src.id}`, severity:'error',
            msg:`Short circuit on ${src.label} — positive and negative are connected directly`,
            compIds:[src.id], wireIds:[] });
        }
      });
    });
  });

  if (sources.length > 1) {
    const negNodes = sources.map(src => {
      const negTerm = src.termIds.map(tid => graph.terminals.get(tid)).find(t => t?.polarity === 'sink');
      return negTerm?.nodeId;
    }).filter(Boolean);
    const uniqueNegNodes = new Set(negNodes);
    if (uniqueNegNodes.size > 1) {
      issues.push({ id:'NO_COMMON_GND', severity:'warning',
        msg:`${sources.length} sources have separate grounds — connect negatives together`,
        compIds: sources.map(s => s.id), wireIds:[] });
    }
  }

  return issues;
}
```

---

## lib/voltforge/solver.js

```js
import { DEFS } from './definitions';

function compR(comp) {
  switch (comp.type) {
    case 'battery': case 'solar': case 'acsource': return comp._iR ?? 0.5;
    case 'resistor': case 'thermistor': case 'ldr': return Math.max(comp._ohms ?? 220, 0.1);
    case 'potmeter': return Math.max((comp._ohms ?? 10000) * (comp._wiper ?? 0.5), 0.1);
    case 'capacitor':  return 1e6;
    case 'inductor':   return 0.1;
    case 'led':        return 68;
    case 'diode': case 'zener': return 10;
    case 'switch_': case 'pushbtn': return comp._closed ? 0.05 : Infinity;
    case 'spdt': case 'dpdt': return 0.05;
    case 'relay': return comp._energized ? 0.1 : Infinity;
    case 'npn': case 'pnp': case 'mosfet': return comp._on ? 0.5 : Infinity;
    case 'fuse': return comp._blown ? Infinity : 0.05;
    case 'breaker': return comp._tripped ? Infinity : 0.05;
    case 'motor':      return comp._motR ?? 15;
    case 'bulb':       return comp._ohms ?? 60;
    case 'buzzer': case 'speaker': return comp._ohms ?? 8;
    case 'heater':     return comp._ohms ?? 30;
    case 'voltmeter':  return 1e6;
    case 'ammeter':    return 0.01;
    case 'varistor':   return comp._ohms ?? 100000;
    case 'and_gate': case 'or_gate': case 'not_gate': return 1e6;
    default:           return 10;
  }
}

function getExitTerm(comp, entryTid) {
  if (comp.type === 'dpdt') {
    const [c1, c2, f1, f2, r1, r2] = comp.termIds;
    const pos = comp._position ?? 'off';
    const pairs = pos === 'fwd' ? [[c1,f1],[c2,f2]] : pos === 'rev' ? [[c1,r1],[c2,r2]] : [];
    for (const [a, b] of pairs) {
      if (entryTid === a) return b;
      if (entryTid === b) return a;
    }
    return null;
  }
  if (comp.type === 'spdt') {
    const [com, no, nc] = comp.termIds;
    const pos = comp._position ?? 'no';
    if (pos === 'no') { if (entryTid === com) return no; if (entryTid === no) return com; }
    if (pos === 'nc') { if (entryTid === com) return nc; if (entryTid === nc) return com; }
    return null;
  }
  return undefined;
}

function findPath(graph, startTid, endTid, depth, visited, visitedComps) {
  if (depth > 80 || visited.has(startTid)) return null;
  if (startTid === endTid && depth > 0) return { steps:[], R:0 };
  visited.add(startTid);
  const term = graph.terminals.get(startTid);
  if (!term) return null;
  const comp = graph.components.get(term.compId);
  if (comp && comp._role !== 'source' && !visitedComps.has(comp.id)) {
    const exitTid = getExitTerm(comp, startTid);
    if (exitTid !== undefined) {
      if (exitTid !== null) {
        visitedComps.add(comp.id);
        const res = findPath(graph, exitTid, endTid, depth+1, new Set(visited), new Set(visitedComps));
        if (res) return { steps:[{ kind:'c', id:comp.id, R:0.05, entryTid:startTid }, ...res.steps], R:0.05+res.R };
      }
    } else {
      const r = compR(comp);
      if (r < Infinity) {
        visitedComps.add(comp.id);
        for (const otid of comp.termIds) {
          if (otid === startTid) continue;
          const res = findPath(graph, otid, endTid, depth+1, new Set(visited), new Set(visitedComps));
          if (res) return { steps:[{ kind:'c', id:comp.id, R:r, entryTid:startTid }, ...res.steps], R:r+res.R };
        }
      }
      if (r === Infinity) return null;
    }
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

function findAllPaths(graph, startTid, endTid, depth, visited, visitedComps) {
  if (depth > 80 || visited.has(startTid)) return [];
  if (startTid === endTid && depth > 0) return [{ steps:[], R:0 }];
  const vis = new Set(visited);
  vis.add(startTid);
  const term = graph.terminals.get(startTid);
  if (!term) return [];
  const comp = graph.components.get(term.compId);
  const results = [];
  let vcForWires = new Set(visitedComps);
  if (comp && comp._role !== 'source' && !visitedComps.has(comp.id)) {
    const exitTid = getExitTerm(comp, startTid);
    if (exitTid !== undefined) {
      if (exitTid !== null) {
        const vc = new Set(visitedComps); vc.add(comp.id);
        findAllPaths(graph, exitTid, endTid, depth+1, new Set(vis), vc)
          .forEach(res => results.push({ steps:[{ kind:'c', id:comp.id, R:0.05, entryTid:startTid }, ...res.steps], R:0.05+res.R }));
      }
      return results;
    } else {
      const r = compR(comp);
      if (r < Infinity) {
        vcForWires = new Set(visitedComps); vcForWires.add(comp.id);
        for (const otid of comp.termIds) {
          if (otid === startTid) continue;
          findAllPaths(graph, otid, endTid, depth+1, new Set(vis), vcForWires)
            .forEach(res => results.push({ steps:[{ kind:'c', id:comp.id, R:r, entryTid:startTid }, ...res.steps], R:r+res.R }));
        }
      }
    }
  }
  for (const wid of term.wireIds) {
    const w = graph.wires.get(wid);
    if (!w) continue;
    const nextTid = w.from === startTid ? w.to : w.from;
    const nextT   = graph.terminals.get(nextTid);
    if (!nextT) continue;
    const nextComp = graph.components.get(nextT.compId);
    if (nextComp?._role === 'source' && nextTid !== endTid) continue;
    findAllPaths(graph, nextTid, endTid, depth+1, new Set(vis), new Set(vcForWires))
      .forEach(res => results.push({ steps:[{ kind:'w', wid }, ...res.steps], R:res.R }));
  }
  return results;
}

export function solveDC(graph) {
  const out = { ok: false, status: 'off', Vs: 0, I: 0, P: 0, compOut: new Map(), wireOut: new Map(), termV: new Map() };
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
    const Vs = (src._voltage ?? 9) * (src.type === 'solar' ? Math.max(0, Math.min(1, src._irr ?? 1)) : 1);
    if (Vs < 0.01) return;
    out.Vs = Math.max(out.Vs, Vs);
    const paths = findAllPaths(graph, posT.id, negT.id, 0, new Set(), new Set()).filter(p => p.R >= 0.3);
    if (!paths.length) {
      const anyPath = findPath(graph, posT.id, negT.id, 0, new Set(), new Set());
      out.status = anyPath ? (anyPath.R < 0.3 ? 'short' : 'open') : 'open';
      return;
    }
    out.termV.set(posT.id, Vs);
    out.termV.set(negT.id, 0);
    out.ok = true; out.status = 'running';
    let srcTotalI = 0;
    paths.forEach(path => {
      const Rtot = Math.max(path.R + compR(src), 0.001);
      const I    = Vs / Rtot;
      srcTotalI += I;
      out.I += I; out.P += Vs * I;
      path.steps.forEach(s => {
        if (s.kind === 'c') {
          const co = out.compOut.get(s.id);
          const cc = graph.components.get(s.id);
          co.I += I; co.V = Math.max(co.V, I*s.R); co.P += I*I*s.R; co.active = true;
          if (cc?.type === 'motor' && s.entryTid) {
            const posTermId = cc.termIds[0];
            co.reversed = s.entryTid !== posTermId;
          }
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
    const so = out.compOut.get(src.id);
    so.V = Vs; so.I = srcTotalI; so.P = Vs*srcTotalI; so.active = true;
  });
  if (fuseBlow) return solveDC(graph);
  return out;
}

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
      state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(co.P / 0.1, 1); break;
    case 'capacitor':
      state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(Math.abs(comp._Vc ?? 0) / 5, 1); break;
    case 'inductor':
      state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(I / 0.5, 1); break;
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
      state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(I / 0.1, 1); break;
    case 'motor': {
      const Vmin = comp._minV ?? 3, Vr = comp._ratedV ?? 12;
      state = act && V >= Vmin ? 'ACTIVE' : act ? 'IDLE' : 'OFF';
      powerLevel = state === 'ACTIVE' ? Math.min((V - Vmin) / (Vr - Vmin), 1) : 0;
      break;
    }
    case 'bulb':
      state = act ? 'ON' : 'OFF'; powerLevel = Math.min(co.P / (comp._ratedW ?? 1), 1); break;
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
    case 'spdt':
      state = comp._position !== 'off' && act ? 'ACTIVE' : 'OFF';
      powerLevel = state === 'ACTIVE' ? 1 : 0;
      break;
    case 'dpdt':
      state = comp._position !== 'off' && act ? 'ACTIVE' : 'OFF';
      powerLevel = state === 'ACTIVE' ? 1 : 0;
      break;
    case 'relay':
      if (comp._energized) { state = act ? 'ACTIVE' : 'ON'; powerLevel = 0.8; }
      else { state = 'OFF'; powerLevel = 0; }
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
      state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(V / 15, 1); break;
    case 'ammeter':
      state = act ? 'ACTIVE' : 'OFF'; powerLevel = Math.min(I / 1, 1); break;
    case 'and_gate': case 'or_gate': case 'not_gate':
      state = comp._out ? 'ON' : 'OFF'; powerLevel = comp._out ? 1 : 0; break;
    default:
      state = act ? 'ACTIVE' : 'OFF';
  }
  return { state, powerLevel, faults, V:co.V, I:co.I, P:co.P, thermalC, reversed: co.reversed ?? false };
}
```

---

## lib/voltforge/simloop.js

```js
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
      h += `${c.id}:${c._closed}${c._blown}${c._voltage}${c._irr}${c._position}${c._energized}${c._tripped}${c._wiper}|`);
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
    this.snap = { tick: this.tick, status: dc.status, Vs: dc.Vs, I: dc.I, P: dc.P, wires: dc.wireOut, termV: dc.termV, bh };
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
```

---

## lib/voltforge/persistence.js

```js
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
    return { schema: SCHEMA, pid: meta.pid || uid('p'), name: meta.name || 'Untitled', saved: Date.now(), stats: { c: graph.components.size, w: graph.wires.size }, cs, ws };
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
```

---

## lib/voltforge/ai-context.js

```js
export function buildAIContext(graph, simSnap) {
  const comps = [...graph.components.values()];
  const compLines = comps.map(c => {
    const terms = c.termIds.map(tid => graph.terminals.get(tid)).filter(Boolean);
    const conns = terms.flatMap(t =>
      [...t.wireIds].map(wid => {
        const w = graph.wires.get(wid);
        if (!w) return null;
        const ox = w.from === t.id ? w.to : w.from;
        const ot = graph.terminals.get(ox);
        const oc = ot ? graph.components.get(ot.compId) : null;
        return oc ? `${oc.label}(${ot.label})` : null;
      }).filter(Boolean)
    );
    return `• ${c.label} [${c.type}]: ${conns.join(', ') || 'unconnected'}`;
  }).join('\n');

  const issues = (simSnap?.issues || []).map(i => `  [${i.severity.toUpperCase()}] ${i.msg}`).join('\n');
  const simLine = simSnap?.status === 'running'
    ? `ACTIVE — ${simSnap.Vs?.toFixed(2)}V  ${(simSnap.I * 1000)?.toFixed(1)}mA  ${(simSnap.P * 1000)?.toFixed(0)}mW`
    : (simSnap?.status || 'off').toUpperCase();

  return `CIRCUIT (${comps.length} components, ${graph.wires.size} wires):\n${compLines}\n\nSIMULATION: ${simLine}\n\nVALIDATION:\n${issues || '  No issues ✓'}`;
}
```

---

## pages/VoltForge.jsx

(See context snapshot — full file included there)

---

## pages/Pricing.jsx

(See context snapshot — full file included there)

---

## pages/ThankYou.jsx

```jsx
export default function ThankYou() {
  return (
    <div style={{
      minHeight: '100vh', background: '#040709', color: '#c8e8f0',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 24, padding: 40, textAlign: 'center',
    }}>
      <div style={{ fontSize: 60 }}>⚡</div>
      <div style={{
        fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 700,
        background: 'linear-gradient(90deg,#00d4ff,#39ff7a)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        You're powered up!
      </div>
      <div style={{ color: '#5a8a9a', fontSize: 12, maxWidth: 360, lineHeight: 1.9 }}>
        Payment successful. Your subscription is being activated — it may take a moment to reflect in your account.
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/" style={{ padding: '11px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#00d4ff,#00d4ffbb)', color: '#000', fontWeight: 700, fontSize: 11, textDecoration: 'none' }}>
          Start Building →
        </a>
        <a href="/pricing" style={{ padding: '11px 28px', borderRadius: 10, border: '1px solid #00d4ff44', color: '#00d4ff', fontSize: 11, textDecoration: 'none' }}>
          View Plan
        </a>
      </div>
    </div>
  );
}
```

---

## pages/AccountSettings.jsx

(See full content read above)

---

## components/LoginScreen.jsx

(See full content read above)

---

## components/voltforge/VFHeader.jsx

(See full content read above)

---

## components/voltforge/VFBottomNav.jsx

(See full content read above)

---

## components/voltforge/CanvasView.jsx

(See full content read above)

---

## components/voltforge/PartsView.jsx

(See full content read above)

---

## components/voltforge/SimView.jsx

(See full content read above)

---

## components/voltforge/InfoView.jsx

(See full content read above)

---

## components/voltforge/SaveView.jsx

(See full content read above)

---

## components/voltforge/AIView.jsx

(See full content read above)

---

## components/voltforge/SlideTransition.jsx

(See full content read above)

---

## components/voltforge/PullToRefresh.jsx

(See full content read above)

---

## components/voltforge/WireColorPicker.jsx

(See full content read above)

---

## components/voltforge/UpgradePrompt.jsx

(See full content read above)

---

## functions/createCheckout

```js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLANS = {
  pro: {
    name: 'VoltForge Pro',
    price: '1.99',
    subscriptionInfo: {
      subscriptionSettings: { frequency: 'MONTH' },
      title: 'VoltForge Pro – Monthly',
      description: 'Unlimited components, wire colors, save/load projects',
    },
  },
  premium: {
    name: 'VoltForge Premium',
    price: '2.99',
    subscriptionInfo: {
      subscriptionSettings: { frequency: 'MONTH' },
      title: 'VoltForge Premium – Monthly',
      description: 'Everything in Pro + AI circuit assistant, priority support',
    },
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = await req.json();
    const planDef = PLANS[plan];
    if (!planDef) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const origin = req.headers.get('Origin') || 'https://fast-volt-forge-hub.base44.app';

    const response = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Deno.env.get('WIX_PAYMENTS_API_KEY'),
          'wix-site-id': Deno.env.get('WIX_PAYMENTS_SITE_ID'),
        },
        body: JSON.stringify({
          cart: {
            items: [{ name: planDef.name, quantity: 1, price: planDef.price, subscriptionInfo: planDef.subscriptionInfo }],
            customerInfo: { email: user.email },
          },
          callbackUrls: {
            postFlowUrl: `${origin}/pricing`,
            thankYouPageUrl: `${origin}/thank-you`,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Checkout error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Checkout failed' }, { status: 500 });
    }

    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    console.error('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## functions/wix-payments-webhook

```js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as jose from 'npm:jose@5.9.6';

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const publicKeyPem = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!publicKeyPem) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return new Response('Forbidden', { status: 403 });
    }

    const publicKey = await jose.importSPKI(publicKeyPem, 'RS256');
    const { payload: rawPayload } = await jose.jwtVerify(body, publicKey, { algorithms: ['RS256'] });

    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    console.log('Webhook event type:', event.eventType);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;
      const buyerEmail = order.buyerInfo?.email;
      let tier = 'pro';
      let subscriptionId = null;
      for (const lineItem of order.lineItems || []) {
        const itemName = lineItem.productName?.original || '';
        if (itemName.toLowerCase().includes('premium')) tier = 'premium';
        if (lineItem.subscriptionInfo?.id) subscriptionId = lineItem.subscriptionInfo.id;
      }
      let pending = await base44.asServiceRole.entities.Subscription.filter({ checkout_id: checkoutId });
      if (pending.length === 0 && buyerEmail) {
        pending = await base44.asServiceRole.entities.Subscription.filter({ user_email: buyerEmail, status: 'pending' });
      }
      if (pending.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(pending[0].id, { status: 'active', tier, payment_id: subscriptionId || order.id });
        console.log('Activated subscription for', pending[0].user_email, 'tier:', tier);
      } else {
        await base44.asServiceRole.entities.Subscription.create({ user_email: buyerEmail, tier, status: 'active', payment_id: subscriptionId || order.id, checkout_id: checkoutId });
        console.log('Created subscription for', buyerEmail, 'tier:', tier);
      }
    } else if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;
      const subs = await base44.asServiceRole.entities.Subscription.filter({ payment_id: subscriptionId });
      for (const sub of subs) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, { status: 'cancelled', tier: 'free' });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response('Error', { status: 500 });
  }
});
```

---

## entities/Subscription.json

```json
{
  "name": "Subscription",
  "type": "object",
  "properties": {
    "user_email": { "type": "string", "title": "User Email" },
    "tier": { "type": "string", "enum": ["free", "pro", "premium"], "title": "Tier", "default": "free" },
    "status": { "type": "string", "enum": ["active", "cancelled", "expired", "pending"], "title": "Status", "default": "active" },
    "payment_id": { "type": "string", "title": "Payment ID" },
    "checkout_id": { "type": "string", "title": "Checkout ID" },
    "expires_at": { "type": "string", "format": "date-time", "title": "Expires At" }
  },
  "required": ["user_email", "tier", "status"]
}
``