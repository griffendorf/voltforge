import { useState, useRef, useEffect, useCallback } from 'react';
import { T } from '@/lib/voltforge/theme';
import { G } from '@/lib/voltforge/instances';
import { buildAIContext } from '@/lib/voltforge/ai-context';
import { DEFS } from '@/lib/voltforge/definitions';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/voltforge/PullToRefresh';

const mdRender = text =>
  text.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
      .replace(/\*(.*?)\*/g,'<i>$1</i>')
      .replace(/`([^`]+)`/g,'<code style="background:rgba(0,212,255,.12);padding:0 3px;border-radius:3px">$1</code>')
      .replace(/\n/g,'<br/>');

const SYSTEM_PROMPT = `You are Volt·AI, a professional electrical engineer inside VoltForge. Design circuits with the precision of a licensed electrician. NEVER guess — reason step by step before building.

MOBILE: Be concise. Use **bold** for component names.

WIRE COLOR STANDARDS (MUST FOLLOW on every wire):
- RED #ff3333: Positive/hot/battery positive/motor forward power
- BLACK #111111: Negative/return/ground/chassis ground
- WHITE #eeeeee: Neutral (AC), return path
- GREEN #39ff7a: Earth/safety ground
- YELLOW #ffd700: Secondary positive, motor reverse, accessory/switched
- BLUE #00d4ff: Control signal, switched load, trailer brakes, relay trigger
- ORANGE #ff8c00: Second hot (AC), interlock signal
- PURPLE #a855f7: Switch leg, relay coil control
- GRAY #aaaaaa: Traveler wire, secondary return

AUTOMOTIVE/VEHICLE (winch, trailer, RV, boat): RED=battery+, BLACK=chassis ground, YELLOW=accessory/switched+, BLUE=brake/reverse/aux

COMPONENT TERMINAL KEYS (use EXACT key names in wires):
battery, dc_source, solar → pos, neg
acsource → pos(L line), neg(N neutral)
resistor, capacitor, inductor, thermistor, ldr, bulb, heater, varistor → t1, t2
potmeter → t1, wiper, t2
led, diode, zener → an(anode +), ca(cathode −)
npn → base, coll, emit
pnp → base, emit, coll
mosfet → gate, drain, src
motor → pos(M+), neg(M−)
buzzer, speaker → pos, neg
switch_ → in(A), out(B)
pushbtn → in(1), out(2)
relay → coil1(C+), coil2(C−), sw(SW switched contact)
fuse, breaker → in, out
transformer → p1(P+), p2(P−), s1(S+), s2(S−)
triac → a1, a2, gate
bridge_rect → ac1, ac2, pos(DC+), neg(DC−)
scr → an, ca, gate
voltage_reg → in, gnd, out
opamp → inp(IN+), inn(IN−), vcc(V+), vee(V−), out
voltmeter, ammeter → pos, neg
and_gate, or_gate → a, b, out
not_gate → in, out

BUILD RULES (follow every time):
1. PLAN: list every component and its role before placing
2. Color EVERY wire using the standards above — "color" field is REQUIRED
3. Always put fuse or breaker on the positive line near the source
4. Verify polarity on all polar components (LEDs, capacitors, motors)
5. Layout: sources x=60 left, controls x=240-360 center, loads x=460-540 right. 160px Y-spacing between rows.
6. For complex circuits (winch, alarm, motor reversing): use relays for switching, fuses for protection

BUILD FORMAT — respond with this exact structure:
- Each component MUST have a unique "label" field (e.g. "bat1", "fuse1", "relay_fwd", "relay_rev"). NO two components share a label.
- Wires reference components by their label: "label:terminal_key"
- ALWAYS include ground return wires connecting all negative/ground terminals back to battery:neg
<build>{"action":"build","components":[{"type":"battery","label":"bat1","x":60,"y":200,"rotation":0},{"type":"fuse","label":"fuse1","x":200,"y":200,"rotation":0},{"type":"motor","label":"mot1","x":460,"y":200,"rotation":0}],"wires":[{"from":"bat1:pos","to":"fuse1:in","color":"#ff3333"},{"from":"fuse1:out","to":"mot1:pos","color":"#ff3333"},{"from":"mot1:neg","to":"bat1:neg","color":"#111111"}]}</build>

GROUND RULE (CRITICAL): Every circuit MUST have a complete return path. Connect EVERY load's negative terminal back to battery negative with a BLACK (#111111) wire. No component should be isolated (0 wires). Verify every component has at least 2 wires before finishing.

REAL-WORLD CIRCUIT PATTERNS:
WINCH (12V automotive): battery → fuse(high-amp 100A+) → relay_forward + relay_reverse (H-bridge) → motor. Control: switch_ triggers relay coils. Red=battery+, Black=ground, Yellow=reverse leg, Blue=control signal, Purple=relay coil.
EVACUATION/FIRE ALARM: source → breaker → trigger switch_ (or sensor) → relay → buzzer + bulb in parallel. LED indicator for status. Red=power, Blue=alarm output, Green=status/safe.
MOTOR SPEED CONTROL: source → fuse → potmeter → motor. Add NPN transistor for higher current.
MOTOR REVERSING: source → fuse → relay1(forward) + relay2(reverse) → motor. Interlock: relay1-sw prevents relay2 energizing simultaneously.
LIGHTING CIRCUIT: source → fuse → switch_ → bulb or led+resistor.
DC POWER SUPPLY: acsource → transformer → bridge_rect → capacitor → voltage_reg → load.

For any real-world system request: (1) identify circuit type, (2) list all components needed with values, (3) describe wire routing and colors, (4) then output the build block.
If uncertain, state it clearly and build the safest approximation. NEVER connect positive directly to negative.

For analysis questions, optionally append: <hl>{"compIds":["id1","id2"],"type":"info"}</hl>
type values: info | warning | error | success`;

const QUICK_PROMPTS = [
  { label: '🚨 Evacuation Alarm', text: 'Build a complete 12V DC evacuation alarm unit: battery source with a 5A breaker on the positive line, a normally-open push button wired to a relay coil, the relay switched contact powering both a buzzer and a red LED in parallel, a green LED status light through a resistor directly from source, and a second switch as manual override bypassing the relay to trigger the alarm loads. Use red for positive, black for ground, blue for control signals, green for status.' },
  { label: '💡 Parallel Bulbs', text: 'Build a 9V battery circuit with 3 bulbs wired in parallel, each with its own switch, and a fuse on the positive line. Use red for positive, black for ground.' },
  { label: '⚙️ Motor Reversing', text: 'Build a 12V DC motor reversing circuit using a DPDT switch with a battery, fuse, and motor. Wire it so the DPDT controls forward and reverse. Use red for positive, black for ground, yellow for reverse leg.' },
  { label: '🔋 LED + Resistor', text: 'Build a simple 9V battery circuit with a switch, a 220 ohm current-limiting resistor, and an LED. Include proper wire colors.' },
];

export default function AIView({ snap, setAiHL, setView, bump, aiMsgs, setAiMsgs }) {
  const [showQuick, setShowQuick] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [aiMsgs, loading]);

  const sendAI = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setAiMsgs(m => [...m, { role:'user', content:text }]);
    setLoading(true);

    const context = buildAIContext(G, snap);
    const compIds = [...G.components.values()].map(c => `${c.id}=${c.label}`).join(', ');
    const allDefs = Object.keys(DEFS).join(', ');

    const prompt = `${SYSTEM_PROMPT}

Component types available: ${allDefs}
Canvas components: ${compIds || 'none yet'}

LIVE CIRCUIT DATA:
${context}

USER QUESTION: ${text}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gemini_3_flash',
      });
      
      const raw = typeof response === 'string' ? response : JSON.stringify(response);

      // Check for build command
      const buildMatch = raw.match(/<build>([\s\S]*?)<\/build>/);
      if (buildMatch) {
        try {
          const buildCmd = JSON.parse(buildMatch[1]);
          if (buildCmd.action === 'build') {
            // Place components
            const placedComps = new Map();
            buildCmd.components.forEach(compSpec => {
              const comp = G.addComponent(compSpec.type, compSpec.x, compSpec.y);
              if (comp) {
                if (compSpec.rotation) {
                  for (let i = 0; i < compSpec.rotation / 90; i++) {
                    G.rotateComponent(comp.id);
                  }
                }
                // Use label as key (supports multiple same-type components)
                const key = compSpec.label || compSpec.type;
                placedComps.set(key, comp);
              }
            });

            // Connect wires
            if (buildCmd.wires) {
              buildCmd.wires.forEach(wireSpec => {
                const [fromLabel, fromTerm] = wireSpec.from.split(':');
                const [toLabel, toTerm] = wireSpec.to.split(':');
                const fromComp = placedComps.get(fromLabel);
                const toComp = placedComps.get(toLabel);
                if (fromComp && toComp) {
                  const fromTermObj = fromComp.termIds.map(tid => G.terminals.get(tid)).find(t => t?.key === fromTerm);
                  const toTermObj = toComp.termIds.map(tid => G.terminals.get(tid)).find(t => t?.key === toTerm);
                  if (fromTermObj && toTermObj) {
                    G.addWire(fromTermObj.id, toTermObj.id, wireSpec.color || T.blue);
                  }
                }
              });
            }

            bump();
            const responseText = raw.replace(/<build>[\s\S]*?<\/build>/g, '').trim();
            setAiMsgs(m => [...m, { role:'assistant', content:responseText || '✓ Circuit built successfully!' }]);
            setView('canvas');
            return;
          }
        } catch (e) {
          console.error('Build command failed:', e);
        }
      }

      const hlMatch = raw.match(/<hl>([\s\S]*?)<\/hl>/);
      let hl = null;
      try { if (hlMatch) hl = JSON.parse(hlMatch[1]); } catch {}

      const clean = raw.replace(/<hl>[\s\S]*?<\/hl>/g, '').replace(/<build>[\s\S]*?<\/build>/g, '').trim();
      setAiMsgs(m => [...m, { role:'assistant', content:clean, hl }]);

      if (hl?.compIds?.length) {
        setAiHL({ compIds: hl.compIds, type: hl.type || 'info' });
        setTimeout(() => setAiHL({ compIds:[], type:'info' }), 7000);
      }
    } catch {
      const fb = snap?.status === 'running'
        ? `Circuit is active: ${snap.Vs?.toFixed(1)}V, ${(snap.I*1000)?.toFixed(1)}mA.`
        : 'No simulation running — press ▶ RUN first.';
      setAiMsgs(m => [...m, { role:'assistant', content:`_(offline)_ ${fb}` }]);
    }
    setLoading(false);
  }, [loading, snap, setAiHL, setAiMsgs]);

  return (
    <div style={{ width:'100%', height:'100%', display:'flex',
                  flexDirection:'column', overflow:'hidden' }}>
    <PullToRefresh
      onRefresh={async () => {}}
      refreshKey={aiMsgs.length}
    >
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 8px',
                    display:'flex', flexDirection:'column', gap:10 }}>
        {aiMsgs.map((msg, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column',
                                alignItems: msg.role==='user' ? 'flex-end' : 'flex-start',
                                animation:'popIn .2s ease' }}>
            {msg.role === 'assistant' && (
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                              background:'linear-gradient(135deg,#00d4ff,#a855f7)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:10 }}>✦</div>
                <span style={{ fontSize:8, color:T.dim }}>VOLT·AI</span>
              </div>
            )}
            <div style={{
              maxWidth:'88%', padding:'9px 12px', wordBreak:'break-word',
              borderRadius: msg.role==='user' ? '13px 13px 4px 13px' : '4px 13px 13px 13px',
              background: msg.role==='user' ? 'rgba(168,85,247,.13)' : T.card,
              border:`1px solid ${msg.role==='user' ? 'rgba(168,85,247,.3)' : T.b1}`,
              fontSize:13, lineHeight:1.55, color: msg.role==='user' ? T.purple : T.text,
            }} dangerouslySetInnerHTML={{ __html: mdRender(msg.content) }}/>
            {msg.hl?.compIds?.length > 0 && (
              <button
                onClick={() => {
                  setAiHL({ compIds: msg.hl.compIds, type: msg.hl.type||'info' });
                  setView('canvas');
                  setTimeout(() => setAiHL({ compIds:[], type:'info' }), 7000);
                }}
                style={{ marginTop:5, padding:'3px 10px', borderRadius:10, cursor:'pointer',
                         border:`1px solid ${T.blue}44`, background:`${T.blue}0a`,
                         color:T.blue, fontSize:9, alignSelf:'flex-start' }}>
                ✦ Show on canvas
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                            background:'linear-gradient(135deg,#00d4ff,#a855f7)',
                            animation:'pulse 0.7s ease-in-out infinite',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10 }}>✦</div>
              <span style={{ fontSize:8, color:T.dim }}>thinking…</span>
            </div>
            <div style={{ padding:'9px 14px', borderRadius:'4px 13px 13px 13px',
                          background:T.card, border:`1px solid ${T.b1}`,
                          display:'flex', gap:5, alignItems:'center' }}>
              <div style={{ width:4, height:4, borderRadius:'50%', background:T.blue,
                            animation:'pulse .6s ease-in-out infinite' }}/>
              <div style={{ width:4, height:4, borderRadius:'50%', background:T.cyan,
                            animation:'pulse .6s ease-in-out .15s infinite' }}/>
              <div style={{ width:4, height:4, borderRadius:'50%', background:T.purple,
                            animation:'pulse .6s ease-in-out .3s infinite' }}/>
            </div>
          </div>
        )}
        <div ref={chatEndRef}/>
      </div>

      {showQuick && (
        <div style={{ flexShrink:0, padding:'6px 10px', background:T.panel,
                      borderTop:`1px solid ${T.b1}`, display:'flex', gap:6,
                      overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          {QUICK_PROMPTS.map((qp, i) => (
            <button key={i}
              onClick={() => { setInput(qp.text); setShowQuick(false); }}
              style={{ flexShrink:0, padding:'6px 12px', borderRadius:20,
                       border:`1px solid ${T.blue}44`, background:`${T.blue}0d`,
                       color:T.blue, fontSize:11, cursor:'pointer', whiteSpace:'nowrap',
                       fontFamily:'JetBrains Mono, monospace' }}>
              {qp.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ flexShrink:0, padding:'8px 10px', background:T.panel,
                    borderTop:`1px solid ${T.b1}`, display:'flex', gap:8 }}>
        <button
          onClick={() => setShowQuick(v => !v)}
          style={{ padding:'0 12px', borderRadius:10, border:`1px solid ${T.b2}`,
                   background: showQuick ? `${T.blue}22` : T.card,
                   color: showQuick ? T.blue : T.dim,
                   fontSize:16, cursor:'pointer', flexShrink:0 }}
          title="Quick prompts">
          ⚡
        </button>
        <button onClick={() => sendAI(input)}
          disabled={loading || !input.trim()}
          style={{ padding:'0 18px', borderRadius:10, border:'none',
                   background: loading || !input.trim()
                     ? T.dim : 'linear-gradient(135deg,#00d4ff,#a855f7)',
                   color: loading || !input.trim() ? T.sub : '#000',
                   fontWeight:700, fontSize:11, cursor: loading ? 'wait' : 'pointer' }}>
          ✦
        </button>
      </div>
    </PullToRefresh>
    </div>
  );
}