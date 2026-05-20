import { T } from './theme';

// Component definitions
// Each entry: { label, emoji, color, _role, ...simProps, terms[] }
// term: { key, label, lp:{x,y}, dir, pol }
// pol: 'source' | 'sink' | 'neutral' | 'base' | 'gate'

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
  led:       { label:'LED',        emoji:'💡', color:T.green,
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

  bulb:      { label:'Bulb',       emoji:'💫', color:'#ffd54f',
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
  { id:'sources',      label:'Sources',       types:['battery','solar','acsource'] },
  { id:'passive',      label:'Passive',       types:['resistor','potmeter','capacitor','inductor','thermistor','ldr'] },
  { id:'semi',         label:'Semicon',       types:['led','diode','zener','npn','pnp','mosfet'] },
  { id:'loads',        label:'Loads',         types:['motor','bulb','buzzer','speaker','heater'] },
  { id:'switches',     label:'Switches',      types:['switch_','pushbtn','relay'] },
  { id:'protection',   label:'Protection',    types:['fuse','breaker','varistor'] },
  { id:'measurement',  label:'Measure',       types:['voltmeter','ammeter'] },
  { id:'logic',        label:'Logic',         types:['and_gate','or_gate','not_gate'] },
];