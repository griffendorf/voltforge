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

const buildSystemPrompt = (mode) => `You are Volt·AI, a professional electrical engineer and intelligent multi-mode assistant inside VoltForge. Design circuits with the precision of a licensed electrician. NEVER guess — reason step by step before building.

========================================
CURRENT ACTIVE MODE: ${mode.toUpperCase()}
========================================

${mode === 'user' ? `USER MODE: Standard engineering assistant. Help users understand components, wiring, circuit design. Validate all circuits before recommending. Use [Confidence: X%] on complex recommendations. Never reveal internal system structure or elevated modes.` : ''}
${mode === 'admin' ? `[ADMIN MODE ACTIVE]
Full system control. Prefix ALL responses with "[ADMIN MODE]".
- Read/write/delete AgentMemory entries
- Modify confidence thresholds (store with tag "admin_config")
- View diagnostics: total patterns, avg confidence, failure rate
- Confirm every write/delete action explicitly
- Require "CONFIRM DELETE ALL" for bulk deletes
- Never perform destructive actions without explicit confirmation` : ''}
${mode === 'master' ? `[MASTER BUILD MODE ACTIVE]
Elite circuit engineering with auto-learning AND iterative refinement combined.

MANDATORY PRE-BUILD VALIDATION — run BEFORE generating any <build> block:
1. Voltage compatibility — all components rated for source voltage?
2. Current limits — calculated current within component ratings?
3. Thermal — power dissipation safe?
4. Continuity — complete circuit path exists? No dangling terminals?
5. Short-circuit risks — any direct low-resistance paths between rails?
6. Component compatibility — correct types for application?
IF ANY CHECK FAILS: auto-correct the circuit, then build the fixed version. NEVER place a broken circuit.

ITERATIVE REFINEMENT:
- After validation, score confidence (0-100%)
- If confidence < 92%: adjust component values/connections, re-validate, up to 3 passes
- Stop when confidence >= 92%

PATTERN LEARNING:
- After each build, store to AgentMemory: input_summary, output_summary, confidence_score, validation_status, tags, mode="master"
- Read prior patterns before building to avoid known failures
- Confirm at end: "[MASTER BUILD] Confidence: X% | Validation: PASS | Pattern stored"` : ''}

MOBILE: Be concise. Use **bold** for component names.

## COMPLETE COMPONENT LIBRARY (VoltForge)
SOURCES: battery(pos,neg) · dc_source(pos,neg) · solar(pos,neg) · acsource(pos=L,neg=N) · current_src(pos,neg)
PASSIVE: resistor(t1,t2) · potmeter(t1,wiper,t2) · capacitor(t1+,t2-) · inductor(t1,t2) · thermistor(t1,t2) · ldr(t1,t2) · varistor(t1,t2)
SEMI: led(an,ca) · diode(an,ca) · zener(an,ca) · npn(base,coll,emit) · pnp(base,emit,coll) · mosfet(gate,drain,src) · opamp(inp,inn,vcc,vee,out) · voltage_reg(in,gnd,out)
LOADS: motor(pos=M+,neg=M-) · bulb(t1,t2) · buzzer(pos,neg) · speaker(pos,neg) · heater(t1,t2)
SWITCHES: switch_(in=A,out=B) · pushbtn(in=1,out=2) · spdt(com,no,nc) · dpdt(c1,c2,f1,f2,r1,r2) · relay(coil1=C+,coil2=C-,sw=SW)
PROTECTION: fuse(in,out) · breaker(in,out)
AC: transformer(p1,p2,s1,s2) · triac(a1,a2,gate) · bridge_rect(ac1,ac2,pos=DC+,neg=DC-) · scr(an,ca,gate)
MEASUREMENT: voltmeter(pos,neg — PARALLEL) · ammeter(pos,neg — SERIES)
LOGIC: and_gate(a,b,out) · or_gate(a,b,out) · not_gate(in,out)

## HOW TO ADD/REMOVE COMPONENTS
ADD: tap PARTS tab → pick category → tap component → tap GO → tap canvas to place
REMOVE: long-press component → tap ✕ button that appears
MOVE: drag component on canvas
WIRE: tap terminal dot → drag to another terminal dot → release
MULTI-SELECT: drag empty canvas area to draw selection box

## CIRCUIT GENERATION CHECKLIST
- Source → Protection → Control → Load order ALWAYS
- Fuse FIRST off every positive terminal (125% of max current)
- Flyback diode across every relay coil, motor, solenoid
- Current limiting resistor on every LED: R=(Vsupply-Vf)/If
- Gate resistor on every MOSFET gate
- Single point ground — all negatives to one bus
- Zero dangling terminals — every component minimum 2 wires

## CORE LAWS
V=IR · P=VI · P=I²R · P=V²/R · KCL · KVL · Q=CV · τ=RC · τ=L/R

## REAL-WORLD CIRCUIT PATTERNS
WINCH (12V automotive): battery→150A ANL fuse→4-relay H-bridge solenoid pack→motor.
HVAC: acsource(240V)→breaker→relay(contactor)→motor(compressor)+motor(fan). Control: transformer(240V→24V)→switch(HP)→switch(LP)→switch(thermostat)→relay coil.
EVACUATION ALARM: battery→breaker→pushbtn→relay coil. Relay SW→buzzer+bulb parallel. Green LED status through resistor.
MOTOR REVERSING: battery→fuse→dpdt→motor. OR 4-relay H-bridge with interlocks.
DC POWER SUPPLY: acsource→transformer→bridge_rect→capacitor→voltage_reg→load.

## RESPONSE RULES
- Direct answer FIRST before explanation
- Real numbers: actual V A Ω — never vague
- Use canvas labels: say "bat1" not "the battery"
- Warn before failure: explain WHY not just that it will fail
- Add missing protection automatically without being asked
- Bold component names · short sentences · mobile friendly`;

const QUICK_PROMPTS = [
  { label: '🚨 Evacuation Alarm', text: 'Build a complete 12V DC evacuation alarm: battery with 5A breaker, normally-open push button to relay coil, relay switched contact powering buzzer and red LED in parallel, green LED status through resistor. Use red for positive, black for ground, blue for control, green for status.' },
  { label: '💡 Parallel Bulbs', text: 'Build a 9V battery circuit with 3 bulbs wired in parallel, each with its own switch, and a fuse on the positive line. Use red for positive, black for ground.' },
  { label: '⚙️ Motor Reversing', text: 'Build a 12V DC motor reversing circuit using a DPDT switch with a battery, fuse, and motor. Wire it so the DPDT controls forward and reverse. Use red for positive, black for ground, yellow for reverse leg.' },
  { label: '🔋 LED + Resistor', text: 'Build a simple 9V battery circuit with a switch, a 220 ohm current-limiting resistor, and an LED. Include proper wire colors.' },
];

const MODE_CONFIG = {
  user:   { label: 'USER',         color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  admin:  { label: 'ADMIN',        color: '#ffd700', bg: 'rgba(255,215,0,0.12)' },
  master: { label: 'MASTER BUILD', color: '#ff6b35', bg: 'rgba(255,107,53,0.12)' },
};

export default function AIView({ snap, setAiHL, setView, bump, aiMsgs, setAiMsgs, onBuildComplete }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('user');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const authPendingRef = useRef(null);
  const chatEndRef = useRef(null);
  const modeRef = useRef('user');
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMsgs, loading]);

  const sendAI = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setAiMsgs(m => [...m, { role: 'user', content: text }]);
    setLoading(true);

    // ── Mode trigger detection
    const trimmedUpper = text.trim().toUpperCase();

    if (trimmedUpper === 'MASTER MODE ACTIVATE') {
      authPendingRef.current = 'master';
      setAiMsgs(m => [...m, { role: 'assistant', content: 'Master Build authentication required. Please provide your access code.' }]);
      setLoading(false); return;
    }
    if (trimmedUpper === 'ADMIN MODE ACTIVATE') {
      authPendingRef.current = 'admin';
      setAiMsgs(m => [...m, { role: 'assistant', content: 'Admin authentication required. Please provide your access code.' }]);
      setLoading(false); return;
    }
    if (trimmedUpper === 'VOLT-MASTER-9X') {
      if (authPendingRef.current === 'master') {
        authPendingRef.current = null; setMode('master'); modeRef.current = 'master';
        setAiMsgs(m => [...m, { role: 'assistant', content: '**[MASTER BUILD MODE ACTIVE]** — Combined learning + iterative refinement enabled. Every circuit will be validated, refined to ≥92% confidence, and patterns stored. Build quality is guaranteed.' }]);
      } else {
        setAiMsgs(m => [...m, { role: 'assistant', content: 'Invalid code.' }]);
        authPendingRef.current = null;
      }
      setLoading(false); return;
    }
    if (trimmedUpper === 'VOLT-ADMIN-7Z') {
      if (authPendingRef.current === 'admin') {
        authPendingRef.current = null; setMode('admin'); modeRef.current = 'admin';
        setAiMsgs(m => [...m, { role: 'assistant', content: '**[ADMIN MODE ACTIVE]** — Full system access granted. I can read, modify, and delete AgentMemory entries and view diagnostics. All responses will be prefixed with [ADMIN MODE].' }]);
      } else {
        setAiMsgs(m => [...m, { role: 'assistant', content: 'Invalid code.' }]);
        authPendingRef.current = null;
      }
      setLoading(false); return;
    }
    if (trimmedUpper === 'EXIT MODE' || trimmedUpper === 'USER MODE') {
      setMode('user'); modeRef.current = 'user'; authPendingRef.current = null;
      setAiMsgs(m => [...m, { role: 'assistant', content: 'Returned to **USER MODE**.' }]);
      setLoading(false); return;
    }

    const context = buildAIContext(G, snap);
    const compIds = [...G.components.values()].map(c => `${c.id}=${c.label}`).join(', ');
    const allDefs = Object.keys(DEFS).join(', ');
    const sysPrompt = buildSystemPrompt(modeRef.current);

    const prompt = `${sysPrompt}

BUILD FORMAT — use this EXACT JSON structure. ALWAYS include wires with every build. Space components 160px apart horizontally:
<build>{"action":"build","components":[{"type":"battery","label":"bat1","x":60,"y":200},{"type":"resistor","label":"res1","x":220,"y":200},{"type":"led","label":"led1","x":380,"y":200}],"wires":[{"from":"bat1:pos","to":"res1:t1","color":"#ff3333"},{"from":"res1:t2","to":"led1:an","color":"#ff3333"},{"from":"led1:ca","to":"bat1:neg","color":"#111111"}]}</build>

CRITICAL RULES FOR BUILD JSON:
- Every component MUST have a unique label (bat1, res1, led1, fuse1, etc.)
- Space components at least 160px apart (x values: 60, 220, 380, 540, 700...)
- Use multiple Y levels for complex circuits: y=100 for top rail, y=280 for bottom rail
- Wires use "label:terminalKey" format — keys MUST match exactly:
  battery(pos,neg) resistor(t1,t2) led(an,ca) diode(an,ca) switch_(in,out) pushbtn(in,out)
  fuse(in,out) breaker(in,out) bulb(t1,t2) motor(pos,neg) relay(coil1,coil2,sw)
  npn(base,coll,emit) mosfet(gate,drain,src) capacitor(t1,t2) inductor(t1,t2)
  buzzer(pos,neg) dc_source(pos,neg) solar(pos,neg) acsource(pos,neg)
  voltmeter(pos,neg) ammeter(pos,neg) spdt(com,no,nc) dpdt(c1,c2,f1,f2,r1,r2)
  bridge_rect(ac1,ac2,pos,neg) transformer(p1,p2,s1,s2) opamp(inp,inn,vcc,vee,out)
  voltage_reg(in,gnd,out) potmeter(t1,wiper,t2) scr(an,ca,gate) triac(a1,a2,gate)
  and_gate(a,b,out) or_gate(a,b,out) not_gate(in,out)

Component types available: ${allDefs}
Canvas components: ${compIds || 'none yet'}

LIVE CIRCUIT DATA:
${context}

USER QUESTION: ${text}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: modeRef.current === 'master' ? 'claude_sonnet_4_6' : 'gemini_3_flash',
      });

      const raw = typeof response === 'string' ? response : JSON.stringify(response);

      const buildMatch = raw.match(/<build>([\s\S]*?)<\/build>/);
      if (buildMatch) {
        try {
          const buildCmd = JSON.parse(buildMatch[1]);
          if (buildCmd.action === 'build') {
            const placedComps = new Map();

            // ── Smart placement: find clear space to the right of existing components
            const existingComps = [...G.components.values()];
            let baseOffsetX = 0;
            let baseOffsetY = 0;

            if (existingComps.length > 0) {
              const existingMaxX = Math.max(...existingComps.map(c => c.x + 80));
              const existingMinY = Math.min(...existingComps.map(c => c.y));
              const newMinX = buildCmd.components.length > 0
                ? Math.min(...buildCmd.components.map(c => c.x ?? 60))
                : 60;
              const newMinY = buildCmd.components.length > 0
                ? Math.min(...buildCmd.components.map(c => c.y ?? 200))
                : 200;
              baseOffsetX = existingMaxX + 140 - newMinX;
              // Align Y with existing circuit's top
              baseOffsetY = existingMinY - newMinY;
            }

            const gs = 20;
            buildCmd.components.forEach(compSpec => {
              const wx = Math.round(((compSpec.x ?? 60) + baseOffsetX) / gs) * gs;
              const wy = Math.round(((compSpec.y ?? 200) + baseOffsetY) / gs) * gs;
              const comp = G.addComponent(compSpec.type, wx, wy);
              if (comp) {
                if (compSpec.rotation) {
                  for (let i = 0; i < compSpec.rotation / 90; i++) {
                    G.rotateComponent(comp.id);
                  }
                }
                placedComps.set(compSpec.label || compSpec.type, comp);
              }
            });

            // ── Validated wire placement
            let validWires = 0;
            const failedWires = [];

            if (buildCmd.wires) {
              buildCmd.wires.forEach(wireSpec => {
                const [fromLabel, fromTerm] = (wireSpec.from || '').split(':');
                const [toLabel, toTerm] = (wireSpec.to || '').split(':');
                const fromComp = placedComps.get(fromLabel);
                const toComp = placedComps.get(toLabel);
                if (!fromComp || !toComp) {
                  failedWires.push(`${wireSpec.from}→${wireSpec.to} (component not found)`);
                  return;
                }
                const fromTermObj = fromComp.termIds.map(tid => G.terminals.get(tid)).find(t => t?.key === fromTerm);
                const toTermObj = toComp.termIds.map(tid => G.terminals.get(tid)).find(t => t?.key === toTerm);
                if (fromTermObj && toTermObj) {
                  G.addWire(fromTermObj.id, toTermObj.id, wireSpec.color || T.blue);
                  validWires++;
                } else {
                  failedWires.push(`${wireSpec.from}→${wireSpec.to} (terminal key mismatch: got "${fromTerm}"/"${toTerm}")`);
                }
              });
            }

            bump();

            let responseText = raw.replace(/<build>[\s\S]*?<\/build>/g, '').trim();
            const totalWires = buildCmd.wires?.length || 0;
            if (failedWires.length > 0) {
              responseText = (responseText || '') + `\n\n⚠️ **${validWires}/${totalWires} wires connected.** ${failedWires.length} skipped due to terminal key errors. You can manually draw the missing wires.`;
            } else if (!responseText) {
              responseText = `✓ Circuit built — ${buildCmd.components?.length || 0} components, ${validWires} wires connected.`;
            }

            setAiMsgs(m => [...m, { role: 'assistant', content: responseText }]);
            setView('canvas');
            if (onBuildComplete) onBuildComplete([...placedComps.values()]);
            setLoading(false);
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
      setAiMsgs(m => [...m, { role: 'assistant', content: clean, hl }]);

      if (hl?.compIds?.length) {
        setAiHL({ compIds: hl.compIds, type: hl.type || 'info' });
        setTimeout(() => setAiHL({ compIds: [], type: 'info' }), 7000);
      }
    } catch {
      const fb = snap?.status === 'running'
        ? `Circuit is active: ${snap.Vs?.toFixed(1)}V, ${(snap.I * 1000)?.toFixed(1)}mA.`
        : 'No simulation running — press ▶ RUN first.';
      setAiMsgs(m => [...m, { role: 'assistant', content: `_(offline)_ ${fb}` }]);
    }
    setLoading(false);
  }, [loading, snap, setAiHL, setAiMsgs, bump, setView]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Messages list */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PullToRefresh onRefresh={async () => {}} refreshKey={aiMsgs.length}>
          <div style={{ overflowY: 'auto', padding: '12px 12px 8px',
                        display: 'flex', flexDirection: 'column', gap: 10 }}>
            {aiMsgs.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column',
                                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    animation: 'popIn .2s ease' }}>
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                  background: 'linear-gradient(135deg,#00d4ff,#a855f7)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 10 }}>✦</div>
                    <span style={{ fontSize: 8, color: T.dim }}>VOLT·AI</span>
                  </div>
                )}
                <div style={{
                  maxWidth: '88%', padding: '9px 12px', wordBreak: 'break-word',
                  borderRadius: msg.role === 'user' ? '13px 13px 4px 13px' : '4px 13px 13px 13px',
                  background: msg.role === 'user' ? 'rgba(168,85,247,.13)' : T.card,
                  border: `1px solid ${msg.role === 'user' ? 'rgba(168,85,247,.3)' : T.b1}`,
                  fontSize: 13, lineHeight: 1.55, color: msg.role === 'user' ? T.purple : T.text,
                }} dangerouslySetInnerHTML={{ __html: mdRender(msg.content) }} />
                {msg.hl?.compIds?.length > 0 && (
                  <button
                    onClick={() => {
                      setAiHL({ compIds: msg.hl.compIds, type: msg.hl.type || 'info' });
                      setView('canvas');
                      setTimeout(() => setAiHL({ compIds: [], type: 'info' }), 7000);
                    }}
                    style={{ marginTop: 5, padding: '3px 10px', borderRadius: 10, cursor: 'pointer',
                             border: `1px solid ${T.blue}44`, background: `${T.blue}0a`,
                             color: T.blue, fontSize: 9, alignSelf: 'flex-start' }}>
                    ✦ Show on canvas
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg,#00d4ff,#a855f7)',
                                animation: 'pulse 0.7s ease-in-out infinite',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10 }}>✦</div>
                  <span style={{ fontSize: 8, color: T.dim }}>thinking…</span>
                </div>
                <div style={{ padding: '9px 14px', borderRadius: '4px 13px 13px 13px',
                              background: T.card, border: `1px solid ${T.b1}`,
                              display: 'flex', gap: 5, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.blue,
                                animation: 'pulse .6s ease-in-out infinite' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.cyan,
                                animation: 'pulse .6s ease-in-out .15s infinite' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.purple,
                                animation: 'pulse .6s ease-in-out .3s infinite' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </PullToRefresh>
      </div>

      {/* Quick prompts */}
      {showQuick && (
        <div style={{ flexShrink: 0, padding: '6px 10px', background: T.panel,
                      borderTop: `1px solid ${T.b1}`, display: 'flex', gap: 6,
                      overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {QUICK_PROMPTS.map((qp, i) => (
            <button key={i}
              onClick={() => { setInput(qp.text); setShowQuick(false); }}
              style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20,
                       border: `1px solid ${T.blue}44`, background: `${T.blue}0d`,
                       color: T.blue, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                       fontFamily: 'JetBrains Mono, monospace' }}>
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Mode indicator bar */}
      <div style={{ flexShrink: 0, padding: '4px 10px', background: T.panel,
                    borderTop: `1px solid ${T.b1}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%',
                        background: MODE_CONFIG[mode].color,
                        boxShadow: `0 0 6px ${MODE_CONFIG[mode].color}` }} />
          <span style={{ fontSize: 9, color: MODE_CONFIG[mode].color,
                         fontFamily: 'JetBrains Mono,monospace', letterSpacing: '.08em',
                         fontWeight: 700 }}>{MODE_CONFIG[mode].label}</span>
        </div>
        {mode !== 'user' && (
          <button
            onClick={() => {
              setMode('user'); modeRef.current = 'user'; authPendingRef.current = null;
              setAiMsgs(m => [...m, { role: 'assistant', content: 'Returned to **USER MODE**.' }]);
            }}
            style={{ padding: '2px 8px', borderRadius: 8, border: `1px solid ${T.red}44`,
                     background: `${T.red}0a`, color: T.red, fontSize: 8, cursor: 'pointer',
                     fontFamily: 'JetBrains Mono,monospace' }}>EXIT ✕</button>
        )}
      </div>

      {/* Input row */}
      <div style={{ flexShrink: 0, padding: '8px 10px', background: T.panel,
                    borderTop: `1px solid ${T.b1}`, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowQuick(v => !v)}
          style={{ padding: '0 12px', borderRadius: 10, border: `1px solid ${T.b2}`,
                   background: showQuick ? `${T.blue}22` : T.card,
                   color: showQuick ? T.blue : T.dim,
                   fontSize: 16, cursor: 'pointer', flexShrink: 0 }}
          title="Quick prompts">
          ⚡
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendAI(input); }}
          placeholder="Ask about your circuit…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10,
                   border: `1px solid ${T.b2}`, background: T.card, color: T.text,
                   fontSize: 12, outline: 'none', fontFamily: 'JetBrains Mono, monospace',
                   touchAction: 'auto' }} />
        <button
          onClick={() => sendAI(input)}
          disabled={loading || !input.trim()}
          style={{ padding: '0 18px', borderRadius: 10, border: 'none',
                   background: loading || !input.trim()
                     ? T.dim : 'linear-gradient(135deg,#00d4ff,#a855f7)',
                   color: loading || !input.trim() ? T.sub : '#000',
                   fontWeight: 700, fontSize: 11, cursor: loading ? 'wait' : 'pointer' }}>
          ✦
        </button>
      </div>
    </div>
  );
}