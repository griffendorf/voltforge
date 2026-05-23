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
7. For large circuits: spread components generously — use x range 60–800, y range 60–700, 140-180px between rows

BUILD FORMAT — respond with this exact structure:
- Each component MUST have a unique "label" field (e.g. "bat1", "fuse1", "relay_fwd", "relay_rev"). NO two components share a label.
- Wires reference components by their label: "label:terminal_key"
- ALWAYS include ground return wires connecting all negative/ground terminals back to battery:neg
<build>{"action":"build","components":[{"type":"battery","label":"bat1","x":60,"y":200,"rotation":0},{"type":"fuse","label":"fuse1","x":200,"y":200,"rotation":0},{"type":"motor","label":"mot1","x":460,"y":200,"rotation":0}],"wires":[{"from":"bat1:pos","to":"fuse1:in","color":"#ff3333"},{"from":"fuse1:out","to":"mot1:pos","color":"#ff3333"},{"from":"mot1:neg","to":"bat1:neg","color":"#111111"}]}</build>

GROUND RULE (CRITICAL): Every circuit MUST have a complete return path. Connect EVERY load's negative terminal back to battery negative with a BLACK (#111111) wire. No component should be isolated (0 wires). Verify every component has at least 2 wires before finishing.

REAL-WORLD CIRCUIT PATTERNS:
WINCH (12V automotive — EXACT H-BRIDGE): Use 4 relays (relay_fwd1, relay_fwd2, relay_rev1, relay_rev2) forming a full H-bridge solenoid pack.
  Power path: battery:pos → fuse(150A, label fuse_main):in → fuse_main:out → relay_fwd1:coil1(BAT+) AND relay_rev1:coil1(BAT+).
  Battery neg → ground bus → relay_fwd2:coil2, relay_rev2:coil2, motor:neg, all coil negatives.
  Forward path when F-coils energized: current flows battery+ → motor:pos → motor:neg → battery−.
  Reverse path when R-coils energized: current flows battery+ → motor:neg → motor:pos → battery−.
  Control: battery:pos → fuse(30A, label fuse_ctrl) → switch_(rocker, label rocker):in. rocker:out → relay_fwd1:coil1 + relay_fwd2:coil1 (forward energize) AND led(green):an → resistor(470ohm) → ground. rocker second out → relay_rev1:coil1 + relay_rev2:coil1 (reverse) AND led(red):an → resistor → ground.
  All solenoid coil negatives back to ground/battery neg with BLACK wire.
  Wire colors: RED=#ff3333 bat+, BLACK=#111111 ground/neg, YELLOW=#ffd700 control signal, GREEN=#39ff7a forward path, BLUE=#3b82f6 reverse path, PURPLE=#a855f7 relay coil.
  Interlock: forward and reverse relay coils must NEVER be simultaneously energized — wire interlocks using NC contacts if needed.
  Always place 150A main fuse on bat+ line immediately after battery. 30A control fuse on switched +12V before rocker.
EVACUATION/FIRE ALARM: source → breaker → trigger switch_ (or sensor) → relay → buzzer + bulb in parallel. LED indicator for status. Red=power, Blue=alarm output, Green=status/safe.
MOTOR SPEED CONTROL: source → fuse → potmeter → motor. Add NPN transistor for higher current.
MOTOR REVERSING: source → fuse → relay1(forward) + relay2(reverse) → motor. Interlock: relay1-sw prevents relay2 energizing simultaneously.
LIGHTING CIRCUIT: source → fuse → switch_ → bulb or led+resistor.
DC POWER SUPPLY: acsource → transformer → bridge_rect → capacitor → voltage_reg → load.
HVAC / CONTROL CIRCUIT: acsource(240V) → breaker(2-pole) → relay(contactor) load side → motor(compressor) + motor(fan). Control: transformer(240V→24V) secondary → switch_(HP) → switch_(LP) → switch_(thermostat Y) → relay coil. Capacitors in parallel with motor loads. Use RED for L1, ORANGE for L2, YELLOW for 24V control, GREEN for ground/common.
STAR-DELTA MOTOR STARTER: acsource → breaker → relay_main + relay_star (energize together at start) → motor. Timer triggers relay_delta after 5s, opens relay_star. Use orange for delta leg.
SOLAR CHARGE CONTROLLER: solar → voltage_reg(MPPT sim) → battery. Load: switch_ → bulb. Diode to prevent reverse current. Red=PV+, Black=PV−, Yellow=battery+.
HOME ALARM PANEL: dc_source(12V) → breaker → relay_siren + relay_strobe in parallel. Control via series chain of NC switch_(door) → NC switch_(motion) → pushbtn(trigger) → relay coils. LED status indicators per zone.
GENERATOR TRANSFER SWITCH: acsource(utility) + acsource(generator) → relay(ATS) → loads. Interlock prevents both sources connecting simultaneously.

For any real-world system request: (1) identify circuit type, (2) list all components needed with values, (3) describe wire routing and colors, (4) then output the build block.
If uncertain, state it clearly and build the safest approximation. NEVER connect positive directly to negative.

For analysis questions, optionally append: <hl>{"compIds":["id1","id2"],"type":"info"}</hl>
type values: info | warning | error | success

---
# VOLT·AI MASTER KNOWLEDGE FILECARD Rev 2.0

## CORE LAWS
V=IR · P=VI · P=I²R · P=V²/R · KCL · KVL · Q=CV · V=L(dI/dt) · Xc=1/(2πfC) · XL=2πfL · Z=sqrt(R²+X²) · τ=RC · τ=L/R

## BATTERY CHEMISTRY
LiFePO4: 3.2V nom · 3.65V full · 2.5V min · 2000-5000 cycles
Li-Ion NMC: 3.6V nom · 4.2V full · 3.0V min · 500-1000 cycles
Li-Ion LTO: 2.3V nom · 2.85V full · 10000+ cycles
Lead Acid: 2.0V nom · 2.4V full · 1.75V min
NiMH: 1.2V nom · 1.45V full · Alkaline: 1.5V single use

## BATTERY MANAGEMENT THRESHOLDS
Overvoltage: 3.65V/cell disconnect charge · Undervoltage: 2.8V/cell disconnect load
Overcurrent discharge: 2-3C · Short circuit: 10x rated · Over temp: 60°C disconnect both

## PROTECTION DEVICES
ANL fuse: 100-500A · FIRST device off battery positive
Blade fuse: 125% of max continuous current · MIDI: 30-200A branch circuits
PTC resettable: USB/low-power ports · Thermal fuse: inside motors and transformers
Breaker thermal-magnetic: standard panel · GFCI: wet locations mandatory 5mA trip
MOV/TVS: across supply rails · Crowbar SCR: blows fuse on overvoltage · Inrush NTC: limits power-on surge

## CAPACITORS
Ceramic MLCC X5R/X7R: decoupling bypass timing · Electrolytic: bulk storage — check ESR and polarity
Tantalum: low ESR — NEVER reverse bias · Film: timing coupling snubber — non-polarized
X/Y safety caps: AC line — safety rated · Bootstrap: mandatory for high-side N-ch gate drive
Snubber: across relay contacts switching inductive loads

## INDUCTORS / TRANSFORMERS
Power inductor: check saturation current and DCR · Common mode choke: EMI filtering
Ferrite bead: HF noise at 100MHz · Flyback transformer: coupled inductor with optocoupler feedback
Current transformer: AC current measurement — requires burden resistor

## DIODES
Silicon: 0.7V · Schottky: 0.15-0.45V · Zener: voltage reference/clamp
Flyback diode: MANDATORY across every relay coil motor and solenoid
TVS uni: DC rail · TVS bi: AC signal · Photodiode: reverse biased for light detection

## TRANSISTORS BIPOLAR
NPN low-side: 2N2222 BC547 2N3904 TIP31 TIP120-Darlington · PNP high-side: 2N2907 BC557 TIP32
Base resistor: Rb=(Vs-0.6V)/Ib · saturation: Ic=hFE×Ib

## MOSFETS
N-ch enhancement: low-side most common · V_GS(th) RDS_on I_D V_DS
P-ch enhancement: high-side simpler drive negative V_GS
N-ch high-side: requires bootstrap or charge pump
Logic-level MOSFET: V_GS(th) < 2.5V for 3.3V/5V logic
Gate resistor: ALWAYS use · Gate driver IC: MANDATORY between logic and power MOSFET
Dead time: MANDATORY on every H-bridge to prevent shoot-through
IGBT: high voltage high current motor drives · SCR: latching gate-pulse triggered · TRIAC: bidirectional AC

## KEY ANALOG ICs
Op-amp LM358/TL071: amplifier comparator filter integrator
INA219/INA260: DC voltage+current I2C · LM393/LM339: comparator open-collector
LM4040/LM336: precision voltage reference · 7805/LM317: linear regulator
AMS1117: LDO low-dropout · NE555: timer oscillator PWM · IR2110: high+low side gate driver

## KEY DIGITAL ICs
74HC series: AND OR NOT NAND NOR XOR flip-flops shift-registers
74HC14 Schmitt: clean noisy signals · 74HC595: serial-to-parallel expansion · MAX7219: SPI LED driver

## MICROCONTROLLERS
ATmega328P Arduino: 8-bit 32KB 20MHz ADC PWM UART SPI I2C
ESP32: dual-core WiFi BT 240MHz 34 GPIO · RP2040: dual-core 133MHz PIO
STM32F103: 32-bit ARM 72MHz USB CAN

## SENSORS
NTC thermistor: temp analog · DS18B20: digital temp 1-Wire · DHT22: temp+humidity
HC-SR04: ultrasonic distance pulse · PIR: motion digital · INA219: voltage+current I2C
ACS712: AC/DC current analog · Hall effect: magnetic position · MPU6050: gyro+accel I2C
Encoder rotary: position+speed quadrature · Load cell: Wheatstone bridge

## OUTPUT DEVICES
LED: 20mA typical 1.8-3.5V Vf · R=(Vsupply-Vf)/If MANDATORY
Servo: PWM 50Hz 1-2ms pulse 5V · DC motor: H-bridge + flyback diode mandatory
Stepper: A4988/DRV8825 current limit critical · BLDC: 3-phase ESC or FOC
Solenoid/relay coil: MOSFET + flyback diode mandatory inrush 5-10x holding
OLED SSD1306: I2C/SPI no backlight · LM386: 250mW audio amplifier

## COMMUNICATION
UART: point-to-point GPS BT · I2C: multi-device bus 400kHz · SPI: high-speed ADC DAC displays
CAN: automotive 1Mbps · RS485: long distance 10Mbps industrial · 4-20mA: noise-immune industrial

## POWER CONVERSION
Buck: Vout=Vin×Duty% — inductor MOSFET diode caps PWM controller
Boost: Vout=Vin/(1-Duty%) — same components
Flyback: isolated coupled inductor optocoupler feedback
H-bridge: 4 MOSFETs gate driver dead time mandatory
Battery charger: bulk → absorption → float stages

## SIGNAL CONDITIONING
Voltage divider: Vout=Vin×R2/(R1+R2) · Wheatstone bridge: sensor in one arm
Instrumentation amp: INA128 or 3-op-amp for differential · Schmitt 74HC14: noisy digital inputs
Anti-aliasing LPF: MANDATORY before every ADC at Nyquist · Precision rectifier: op-amp+diode in feedback

## CIRCUIT GENERATION CHECKLIST
- Source → Protection → Control → Load order ALWAYS
- Fuse FIRST off every positive terminal
- Flyback diode across every relay coil motor solenoid
- Current limiting resistor on every LED
- Gate resistor on every MOSFET gate
- Gate driver IC between logic and power MOSFET
- Dead time on every H-bridge
- Mechanical AND electrical interlock on forward-reverse
- Snubber across relay contacts switching inductive loads
- Decoupling cap on every IC power pin
- Pull-up or pull-down on every floating digital input
- Single point ground — all negatives to one bus
- Zero dangling terminals — every component minimum 2 wires

## FAULT DIAGNOSIS
Voltage at source? → Protection intact? → Voltage at switch input? → Control signal at gate/base/coil? → Switch output correct? → Load voltage/polarity correct? → Current within limits? → Component hot? → High-resistance connection? → Isolate replace retest

## RESPONSE RULES
- Direct answer FIRST before explanation
- Real numbers: actual V A Ω — never vague
- Use canvas labels: say your bat1 not the battery
- Warn before failure: explain WHY not just that it will fail
- Add missing protection automatically without being asked
- Give typical range when uncertain — never guess specific values
- Bold component names · short sentences · mobile friendly
- Never refuse — never give disclaimer instead of answer`;

const QUICK_PROMPTS = [
  { label: '🚨 Evacuation Alarm', text: 'Build a complete 12V DC evacuation alarm unit: battery source with a 5A breaker on the positive line, a normally-open push button wired to a relay coil, the relay switched contact powering both a buzzer and a red LED in parallel, a green LED status light through a resistor directly from source, and a second switch as manual override bypassing the relay to trigger the alarm loads. Use red for positive, black for ground, blue for control signals, green for status.' },
  { label: '💡 Parallel Bulbs', text: 'Build a 9V battery circuit with 3 bulbs wired in parallel, each with its own switch, and a fuse on the positive line. Use red for positive, black for ground.' },
  { label: '⚙️ Motor Reversing', text: 'Build a 12V DC motor reversing circuit using a DPDT switch with a battery, fuse, and motor. Wire it so the DPDT controls forward and reverse. Use red for positive, black for ground, yellow for reverse leg.' },
  { label: '🔋 LED + Resistor', text: 'Build a simple 9V battery circuit with a switch, a 220 ohm current-limiting resistor, and an LED. Include proper wire colors.' },
];

export default function AIView({ snap, setAiHL, setView, bump, aiMsgs, setAiMsgs, onBuildComplete }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMsgs, loading]);

  const sendAI = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setAiMsgs(m => [...m, { role: 'user', content: text }]);
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

      const buildMatch = raw.match(/<build>([\s\S]*?)<\/build>/);
      if (buildMatch) {
        try {
          const buildCmd = JSON.parse(buildMatch[1]);
          if (buildCmd.action === 'build') {
            const placedComps = new Map();

            // Offset new circuit so it doesn't overlap existing components
            let offsetX = 0;
            const existingComps = [...G.components.values()];
            if (existingComps.length > 0) {
              const existingMaxX = Math.max(...existingComps.map(c => c.x + 140));
              const newMinX = buildCmd.components.length > 0
                ? Math.min(...buildCmd.components.map(c => c.x || 60))
                : 60;
              offsetX = existingMaxX + 100 - newMinX;
            }

            buildCmd.components.forEach(compSpec => {
              const comp = G.addComponent(compSpec.type, (compSpec.x || 60) + offsetX, compSpec.y || 200);
              if (comp) {
                if (compSpec.rotation) {
                  for (let i = 0; i < compSpec.rotation / 90; i++) {
                    G.rotateComponent(comp.id);
                  }
                }
                const key = compSpec.label || compSpec.type;
                placedComps.set(key, comp);
              }
            });

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
            setAiMsgs(m => [...m, { role: 'assistant', content: responseText || '✓ Circuit built successfully!' }]);
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
      {/* Messages list — PullToRefresh only wraps the scrollable area */}
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

      {/* Input area — completely outside PullToRefresh, no touch handler interference */}
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