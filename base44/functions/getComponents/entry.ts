import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPONENTS = {
  // SOURCES
  battery:     { label:'Battery',      role:'source',     terminals:['pos(+)','neg(-)'],       notes:'9V default, adjustable voltage' },
  dc_source:   { label:'DC Adj.',      role:'source',     terminals:['pos(+)','neg(-)'],       notes:'Adjustable DC voltage source' },
  solar:       { label:'Solar Panel',  role:'source',     terminals:['pos(S+)','neg(S-)'],     notes:'Solar PV source, 12V default' },
  acsource:    { label:'AC Source',    role:'source',     terminals:['pos(L)','neg(N)'],       notes:'AC mains/generator, 120/240V' },
  current_src: { label:'I Source',     role:'source',     terminals:['pos(I+)','neg(I-)'],     notes:'Constant current source' },

  // PASSIVE
  resistor:    { label:'Resistor',     role:'passive',    terminals:['t1','t2'],               notes:'220Ω default, adjustable' },
  potmeter:    { label:'Pot',          role:'passive',    terminals:['t1(A)','wiper(W)','t2(B)'], notes:'10kΩ variable resistor' },
  capacitor:   { label:'Capacitor',    role:'passive',    terminals:['t1(+)','t2(-)'],         notes:'100µF default, check polarity' },
  inductor:    { label:'Inductor',     role:'passive',    terminals:['t1','t2'],               notes:'1mH default' },
  thermistor:  { label:'Thermistor',   role:'passive',    terminals:['t1','t2'],               notes:'NTC 10kΩ at 25°C' },
  ldr:         { label:'LDR',          role:'passive',    terminals:['t1','t2'],               notes:'Light dependent resistor' },
  varistor:    { label:'Varistor',     role:'passive',    terminals:['t1','t2'],               notes:'MOV surge protection, 14V clamp' },

  // SEMICONDUCTORS
  led:         { label:'LED',          role:'load',       terminals:['an(anode+)','ca(cathode-)'], notes:'1.8-3.5V forward voltage, 20mA max — ALWAYS use current limiting resistor' },
  diode:       { label:'Diode',        role:'passive',    terminals:['an(anode+)','ca(cathode-)'], notes:'0.7V drop, use as flyback diode across relay/motor coils' },
  zener:       { label:'Zener',        role:'passive',    terminals:['an(anode+)','ca(cathode-)'], notes:'Voltage reference/clamp, 5.1V default' },
  npn:         { label:'NPN BJT',      role:'transistor', terminals:['base(B)','coll(C)','emit(E)'], notes:'Low-side switch, 2N2222/BC547 type' },
  pnp:         { label:'PNP BJT',      role:'transistor', terminals:['base(B)','emit(E)','coll(C)'], notes:'High-side switch, 2N2907 type' },
  mosfet:      { label:'MOSFET',       role:'transistor', terminals:['gate(G)','drain(D)','src(S)'], notes:'N-ch enhancement, always use gate resistor' },
  opamp:       { label:'Op-Amp',       role:'passive',    terminals:['inp(IN+)','inn(IN-)','vcc(V+)','vee(V-)','out(OUT)'], notes:'LM358/TL071, gain 100000 open loop' },
  voltage_reg: { label:'Volt Reg',     role:'passive',    terminals:['in(IN)','gnd(GND)','out(OUT)'], notes:'LM7805 type, 1.5V dropout' },

  // LOADS
  motor:       { label:'DC Motor',     role:'load',       terminals:['pos(M+)','neg(M-)'],     notes:'12V rated, always add flyback diode' },
  bulb:        { label:'Bulb',         role:'load',       terminals:['t1','t2'],               notes:'Incandescent, 60Ω/1W default' },
  buzzer:      { label:'Buzzer',       role:'load',       terminals:['pos(+)','neg(-)'],       notes:'8Ω, 3V minimum' },
  speaker:     { label:'Speaker',      role:'load',       terminals:['pos(+)','neg(-)'],       notes:'8Ω, use LM386 for amplification' },
  heater:      { label:'Heater',       role:'load',       terminals:['t1','t2'],               notes:'Resistive heating element, 30Ω/5W' },

  // SWITCHES
  switch_:     { label:'SPST Switch',  role:'switch',     terminals:['in(A)','out(B)'],        notes:'Single pole single throw, NO default' },
  pushbtn:     { label:'Push Button',  role:'switch',     terminals:['in(1)','out(2)'],        notes:'Momentary normally-open' },
  spdt:        { label:'SPDT',         role:'switch',     terminals:['com(C)','no(NO)','nc(NC)'], notes:'Single pole double throw' },
  dpdt:        { label:'DPDT',         role:'switch',     terminals:['c1','c2','f1','f2','r1','r2'], notes:'Double pole double throw — motor reversing' },
  relay:       { label:'Relay',        role:'relay',      terminals:['coil1(C+)','coil2(C-)','sw(SW)'], notes:'180Ω coil, 4.5V pickup — ALWAYS add flyback diode across coil' },

  // PROTECTION
  fuse:        { label:'Fuse',         role:'protection', terminals:['in(IN)','out(OUT)'],     notes:'FIRST component on positive rail, 125% of max current' },
  breaker:     { label:'Breaker',      role:'protection', terminals:['in(IN)','out(OUT)'],     notes:'Resettable, thermal-magnetic' },

  // AC COMPONENTS
  transformer: { label:'Transformer',  role:'passive',    terminals:['p1(P+)','p2(P-)','s1(S+)','s2(S-)'], notes:'Galvanic isolation, adjustable ratio' },
  triac:       { label:'TRIAC',        role:'transistor', terminals:['a1(A1)','a2(A2)','gate(G)'], notes:'Bidirectional AC switching' },
  bridge_rect: { label:'Bridge Rect',  role:'passive',    terminals:['ac1(AC~)','ac2(AC~)','pos(DC+)','neg(DC-)'], notes:'Full-wave AC to DC rectifier' },
  scr:         { label:'SCR',          role:'transistor', terminals:['an(A)','ca(K)','gate(G)'], notes:'Silicon controlled rectifier, latching' },

  // MEASUREMENT
  voltmeter:   { label:'Voltmeter',    role:'meter',      terminals:['pos(V+)','neg(V-)'],     notes:'1MΩ input impedance, wire in PARALLEL' },
  ammeter:     { label:'Ammeter',      role:'meter',      terminals:['pos(A+)','neg(A-)'],     notes:'0.01Ω, wire in SERIES' },

  // LOGIC GATES
  and_gate:    { label:'AND Gate',     role:'logic',      terminals:['a(A)','b(B)','out(OUT)'], notes:'Output HIGH only when both inputs HIGH' },
  or_gate:     { label:'OR Gate',      role:'logic',      terminals:['a(A)','b(B)','out(OUT)'], notes:'Output HIGH when either input HIGH' },
  not_gate:    { label:'NOT Gate',     role:'logic',      terminals:['in(IN)','out(OUT)'],     notes:'Inverts input signal' },
};

const CATEGORIES = {
  sources:    ['battery','dc_source','solar','acsource','current_src'],
  passive:    ['resistor','potmeter','capacitor','inductor','thermistor','ldr','varistor'],
  semi:       ['led','diode','zener','npn','pnp','mosfet','opamp','voltage_reg'],
  loads:      ['motor','bulb','buzzer','speaker','heater'],
  switches:   ['switch_','pushbtn','spdt','dpdt','relay'],
  protection: ['fuse','breaker'],
  ac:         ['acsource','transformer','triac','bridge_rect','scr'],
  measurement:['voltmeter','ammeter'],
  logic:      ['and_gate','or_gate','not_gate'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');

    // Return a single component
    if (type) {
      const comp = COMPONENTS[type];
      if (!comp) return Response.json({ error: 'Component not found' }, { status: 404 });
      return Response.json({ type, ...comp });
    }

    // Return components by category
    if (category) {
      const types = CATEGORIES[category] || [];
      const result = types.map(t => ({ type: t, ...COMPONENTS[t] }));
      return Response.json({ category, components: result });
    }

    // Return full library
    return Response.json({
      total: Object.keys(COMPONENTS).length,
      categories: CATEGORIES,
      components: Object.entries(COMPONENTS).map(([type, def]) => ({ type, ...def })),
    });
  } catch (error) {
    console.error('getComponents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});