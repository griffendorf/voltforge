import { useState, useEffect, useRef } from 'react';

const COLORS = {
  bg: '#0a0f1a',
  panel: '#111827',
  border: '#1f2937',
  L1: '#ef4444',       // red
  L2: '#1d4ed8',       // black/blue
  ctrl: '#fbbf24',     // yellow 24V
  gnd: '#22c55e',      // green
  neutral: '#6b7280',
  text: '#e2e8f0',
  dim: '#4b5563',
  active: '#00d4ff',
};

const COMP_W = 110;
const COMP_H = 56;

function Block({ x, y, label, icon, badge, badgeColor, onClick, children, glowing }) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <rect
        x={0} y={0} width={COMP_W} height={COMP_H} rx={8}
        fill={COLORS.panel}
        stroke={glowing ? COLORS.active : COLORS.border}
        strokeWidth={glowing ? 2 : 1}
        filter={glowing ? 'url(#glow)' : undefined}
      />
      <text x={COMP_W / 2} y={18} textAnchor="middle" fontSize={16} fill={COLORS.text}>{icon}</text>
      <text x={COMP_W / 2} y={32} textAnchor="middle" fontSize={9} fill={COLORS.text} fontFamily="monospace">{label}</text>
      {badge && (
        <g>
          <rect x={COMP_W / 2 - 22} y={38} width={44} height={13} rx={4} fill={badgeColor || '#374151'} />
          <text x={COMP_W / 2} y={48} textAnchor="middle" fontSize={8} fill="#fff" fontFamily="monospace" fontWeight="bold">{badge}</text>
        </g>
      )}
      {children}
    </g>
  );
}

function Terminal({ x, y, label, color }) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill={color} stroke="#000" strokeWidth={1} />
      <text x={x} y={y - 7} textAnchor="middle" fontSize={7} fill={color} fontFamily="monospace">{label}</text>
    </g>
  );
}

function AnimatedWire({ points, color, active, dashed }) {
  const offset = useRef(0);
  const [dash, setDash] = useState(0);

  useEffect(() => {
    if (!active) { setDash(0); return; }
    const id = setInterval(() => setDash(d => (d - 2 + 40) % 40), 50);
    return () => clearInterval(id);
  }, [active]);

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');

  return (
    <g>
      {/* Glow layer */}
      {active && (
        <path d={d} stroke={color} strokeWidth={6} fill="none" opacity={0.15} strokeLinecap="round" />
      )}
      <path
        d={d}
        stroke={active ? color : COLORS.dim}
        strokeWidth={active ? 2.5 : 1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={active ? '8 5' : dashed ? '4 4' : 'none'}
        strokeDashoffset={active ? dash : 0}
      />
    </g>
  );
}

function Readout({ x, y, label, value, unit, active }) {
  if (!active) return null;
  return (
    <g>
      <rect x={x - 28} y={y - 9} width={56} height={13} rx={3} fill="#0f172a" stroke={COLORS.active} strokeWidth={0.5} opacity={0.9} />
      <text x={x} y={y} textAnchor="middle" fontSize={7.5} fill={COLORS.active} fontFamily="monospace">
        {label}: {value}{unit}
      </text>
    </g>
  );
}

export default function HVACSimulator() {
  const [simOn, setSimOn] = useState(false);
  const [thermoY, setThermoY] = useState(false);
  const [hpOk, setHpOk] = useState(true);   // NC = closed = OK
  const [lpOk, setLpOk] = useState(true);   // NC = closed = OK
  const [manualContactor, setManualContactor] = useState(null); // null = auto

  // Derived states
  const controlActive = simOn && thermoY && hpOk && lpOk;
  const contactorEnergized = manualContactor !== null ? manualContactor : controlActive;
  const powerActive = simOn && contactorEnergized;
  const hpFault = simOn && !hpOk;
  const lpFault = simOn && !lpOk;

  const toggleContactor = () => {
    if (!simOn) return;
    setManualContactor(v => v === null ? !contactorEnergized : (v === contactorEnergized ? null : !v));
  };

  // Reset manual override when sim stops
  useEffect(() => { if (!simOn) setManualContactor(null); }, [simOn]);

  // Layout constants
  const W = 900, H = 620;

  // Key X positions
  const srcX = 30, srcY = 60;
  const brkX = 200, brkY = 60;
  const ctcX = 380, ctcY = 60;
  const cmpX = 560, cmpY = 60;
  const capX = 560, capY = 180;
  const fanX = 720, fanY = 60;
  const xfmrX = 200, xfmrY = 280;
  const hpX = 340, hpY = 280;
  const lpX = 460, lpY = 280;
  const thermoX = 580, thermoY_pos = 280;
  const coilX = 700, coilY = 280;
  const gndBusY = 540;

  // Terminal positions (relative to block origin → absolute)
  const t = (bx, by, rx, ry) => [bx + rx, by + ry];

  const srcL1out = t(srcX, srcY, COMP_W, 15);
  const srcL2out = t(srcX, srcY, COMP_W, 40);
  const brkL1in = t(brkX, brkY, 0, 15);
  const brkL1out = t(brkX, brkY, COMP_W, 15);
  const brkL2in = t(brkX, brkY, 0, 40);
  const brkL2out = t(brkX, brkY, COMP_W, 40);
  const ctcL1in = t(ctcX, ctcY, 0, 15);
  const ctcL1out = t(ctcX, ctcY, COMP_W, 15);
  const ctcL2in = t(ctcX, ctcY, 0, 40);
  const ctcL2out = t(ctcX, ctcY, COMP_W, 40);
  const cmpL1 = t(cmpX, cmpY, 0, 15);
  const cmpL2 = t(cmpX, cmpY, 0, 40);
  const capHerm = t(capX, capY, 0, 15);
  const capFan = t(capX, capY, 0, 40);
  const capCom = t(capX, capY, COMP_W, 28);
  const fanL1 = t(fanX, fanY, 0, 15);
  const fanL2 = t(fanX, fanY, 0, 40);

  const xfmrPri1 = t(xfmrX, xfmrY, 0, 15);
  const xfmrPri2 = t(xfmrX, xfmrY, 0, 40);
  const xfmrSec = t(xfmrX, xfmrY, COMP_W, 15);
  const xfmrCom = t(xfmrX, xfmrY, COMP_W, 40);
  const hpIn = t(hpX, hpY, 0, 28);
  const hpOut = t(hpX, hpY, COMP_W, 28);
  const lpIn = t(lpX, lpY, 0, 28);
  const lpOut = t(lpX, lpY, COMP_W, 28);
  const thermoIn = t(thermoX, thermoY_pos, 0, 28);
  const thermoOut = t(thermoX, thermoY_pos, COMP_W, 28);
  const coilIn = t(coilX, coilY, 0, 28);
  const coilOut = t(coilX, coilY, COMP_W, 28);

  return (
    <div style={{
      background: COLORS.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '16px 8px', fontFamily: 'JetBrains Mono, monospace',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, width: '100%', maxWidth: 920 }}>
        <div>
          <div style={{ color: COLORS.active, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>⚡ 240V HVAC CIRCUIT</div>
          <div style={{ color: COLORS.dim, fontSize: 11 }}>Split-phase AC — Compressor / Condenser Fan / Control Circuit</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSimOn(v => !v)}
            style={{
              padding: '6px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: simOn ? '#dc2626' : '#16a34a', color: '#fff', fontFamily: 'inherit',
            }}
          >{simOn ? '■ STOP SIM' : '▶ RUN SIM'}</button>
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', width: '100%', maxWidth: 920 }}>
        {[
          { label: 'Thermostat Y', val: thermoY, set: setThermoY, color: COLORS.ctrl },
          { label: 'HP Switch (NC)', val: hpOk, set: setHpOk, color: hpFault ? '#ef4444' : COLORS.gnd },
          { label: 'LP Switch (NC)', val: lpOk, set: setLpOk, color: lpFault ? '#ef4444' : COLORS.gnd },
        ].map(({ label, val, set, color }) => (
          <button
            key={label}
            onClick={() => set(v => !v)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: `1px solid ${color}33`,
              background: val ? `${color}22` : '#1f2937', color: val ? color : COLORS.dim,
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            {val ? '● ' : '○ '}{label}: {val ? 'ON' : 'OFF'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', color: COLORS.dim, fontSize: 10, alignSelf: 'center' }}>
          Tap contactor on diagram to toggle manually
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        {[['L1 (Hot)', COLORS.L1], ['L2 (Hot)', COLORS.L2], ['24V Control', COLORS.ctrl], ['Ground', COLORS.gnd]].map(([lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: COLORS.text }}>
            <div style={{ width: 22, height: 3, background: col, borderRadius: 2 }} />
            {lbl}
          </div>
        ))}
      </div>

      {/* SVG Circuit Diagram */}
      <div style={{ width: '100%', maxWidth: 920, overflowX: 'auto', background: '#060d18', borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 700 }}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── POWER WIRES (L1 = red, L2 = blue) ── */}

          {/* Source → Breaker */}
          <AnimatedWire points={[srcL1out, brkL1in]} color={COLORS.L1} active={simOn} />
          <AnimatedWire points={[srcL2out, brkL2in]} color={COLORS.L2} active={simOn} />

          {/* Breaker → Contactor */}
          <AnimatedWire points={[brkL1out, ctcL1in]} color={COLORS.L1} active={simOn} />
          <AnimatedWire points={[brkL2out, ctcL2in]} color={COLORS.L2} active={simOn} />

          {/* Contactor → Compressor L1 */}
          <AnimatedWire
            points={[ctcL1out, [ctcL1out[0] + 20, ctcL1out[1]], [cmpL1[0] - 20, cmpL1[1]], cmpL1]}
            color={COLORS.L1} active={powerActive} />

          {/* Contactor → Compressor L2 */}
          <AnimatedWire
            points={[ctcL2out, [ctcL2out[0] + 30, ctcL2out[1]], [cmpL2[0] - 20, cmpL2[1]], cmpL2]}
            color={COLORS.L2} active={powerActive} />

          {/* L1 tap → Capacitor HERM */}
          <AnimatedWire
            points={[[cmpL1[0], cmpL1[1]], [cmpL1[0], cmpL1[1] + 30], [capHerm[0] - 10, cmpL1[1] + 30], [capHerm[0] - 10, capHerm[1]], capHerm]}
            color={COLORS.L1} active={powerActive} />

          {/* Capacitor FAN → Fan motor L1 */}
          <AnimatedWire
            points={[capFan, [capFan[0] - 15, capFan[1]], [capFan[0] - 15, fanL1[1]], fanL1]}
            color={COLORS.L1} active={powerActive} />

          {/* Contactor L2 → Fan motor L2 (shared) */}
          <AnimatedWire
            points={[[cmpL2[0], cmpL2[1]], [cmpL2[0], cmpL2[1] + 10], [fanL2[0] - 10, cmpL2[1] + 10], [fanL2[0] - 10, fanL2[1]], fanL2]}
            color={COLORS.L2} active={powerActive} />

          {/* Capacitor COM → L2 common */}
          <AnimatedWire
            points={[capCom, [capCom[0] + 15, capCom[1]], [capCom[0] + 15, cmpL2[1] + 10]]}
            color={COLORS.L2} active={powerActive} />

          {/* ── CONTROL CIRCUIT (24V = yellow) ── */}

          {/* L1 tap → Transformer primary */}
          <AnimatedWire
            points={[[brkL1out[0], brkL1out[1]], [brkL1out[0], brkL1out[1] + 60], [xfmrPri1[0] - 10, brkL1out[1] + 60], [xfmrPri1[0] - 10, xfmrPri1[1]], xfmrPri1]}
            color={COLORS.L1} active={simOn} />
          <AnimatedWire
            points={[[brkL2out[0], brkL2out[1]], [brkL2out[0], brkL2out[1] + 80], [xfmrPri2[0] - 20, brkL2out[1] + 80], [xfmrPri2[0] - 20, xfmrPri2[1]], xfmrPri2]}
            color={COLORS.L2} active={simOn} />

          {/* Transformer secondary → HP switch */}
          <AnimatedWire points={[xfmrSec, hpIn]} color={COLORS.ctrl} active={simOn} />

          {/* HP → LP */}
          <AnimatedWire points={[hpOut, lpIn]} color={COLORS.ctrl} active={simOn && hpOk} />

          {/* LP → Thermostat Y */}
          <AnimatedWire points={[lpOut, thermoIn]} color={COLORS.ctrl} active={simOn && hpOk && lpOk} />

          {/* Thermostat Y → Contactor coil */}
          <AnimatedWire points={[thermoOut, coilIn]} color={COLORS.ctrl} active={controlActive} />

          {/* Contactor coil return → Transformer common */}
          <AnimatedWire
            points={[coilOut, [coilOut[0] + 20, coilOut[1]], [coilOut[0] + 20, xfmrCom[1] - 20], [xfmrCom[0] + 30, xfmrCom[1] - 20], [xfmrCom[0] + 30, xfmrCom[1]], xfmrCom]}
            color={COLORS.ctrl} active={controlActive} />

          {/* ── GROUND BUS ── */}
          <line x1={30} y1={gndBusY} x2={860} y2={gndBusY} stroke={COLORS.gnd} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          <text x={50} y={gndBusY - 6} fontSize={9} fill={COLORS.gnd} fontFamily="monospace">⏚ GROUND BUS</text>

          {/* Ground drops */}
          {[[srcX + 55, srcY + COMP_H], [cmpX + 55, cmpY + COMP_H], [fanX + 55, fanY + COMP_H], [xfmrX + 55, xfmrY + COMP_H]].map(([gx, gy], i) => (
            <AnimatedWire key={i} points={[[gx, gy], [gx, gndBusY]]} color={COLORS.gnd} active={simOn} />
          ))}

          {/* ── COMPONENT BLOCKS ── */}

          {/* Power Source */}
          <Block x={srcX} y={srcY} label="L1/L2 240V AC" icon="⚡" badge={simOn ? 'LIVE' : 'OFF'} badgeColor={simOn ? '#16a34a' : '#374151'} glowing={simOn}>
            <Terminal x={COMP_W} y={15} label="L1" color={COLORS.L1} />
            <Terminal x={COMP_W} y={40} label="L2" color={COLORS.L2} />
          </Block>

          {/* Main Breaker */}
          <Block x={brkX} y={brkY} label="60A 2-pole Breaker" icon="🔌" badge={simOn ? 'CLOSED' : 'OFF'} badgeColor={simOn ? '#16a34a' : '#374151'} glowing={simOn}>
            <Terminal x={0} y={15} label="L1-in" color={COLORS.L1} />
            <Terminal x={COMP_W} y={15} label="L1-out" color={COLORS.L1} />
            <Terminal x={0} y={40} label="L2-in" color={COLORS.L2} />
            <Terminal x={COMP_W} y={40} label="L2-out" color={COLORS.L2} />
          </Block>

          {/* Contactor */}
          <Block x={ctcX} y={ctcY} label="Contactor 2-pole" icon="🔁"
            badge={contactorEnergized ? 'CLOSED' : 'OPEN'}
            badgeColor={contactorEnergized ? '#16a34a' : '#374151'}
            glowing={contactorEnergized}
            onClick={toggleContactor}>
            <Terminal x={0} y={15} label="L1" color={COLORS.L1} />
            <Terminal x={COMP_W} y={15} label="T1" color={COLORS.L1} />
            <Terminal x={0} y={40} label="L2" color={COLORS.L2} />
            <Terminal x={COMP_W} y={40} label="T2" color={COLORS.L2} />
          </Block>

          {/* Compressor */}
          <Block x={cmpX} y={cmpY} label="Compressor 240V" icon="🏭"
            badge={powerActive ? 'RUNNING' : 'OFF'}
            badgeColor={powerActive ? '#0ea5e9' : '#374151'}
            glowing={powerActive}>
            <Terminal x={0} y={15} label="L1" color={COLORS.L1} />
            <Terminal x={0} y={40} label="L2/COM" color={COLORS.L2} />
          </Block>

          {/* Run Capacitor */}
          <Block x={capX} y={capY} label="Cap 45/5µF Dual" icon="🔋"
            badge={powerActive ? 'ACTIVE' : 'OFF'}
            badgeColor={powerActive ? '#7c3aed' : '#374151'}
            glowing={powerActive}>
            <Terminal x={0} y={15} label="HERM" color={COLORS.L1} />
            <Terminal x={0} y={40} label="FAN" color={COLORS.L1} />
            <Terminal x={COMP_W} y={28} label="COM" color={COLORS.L2} />
          </Block>

          {/* Condenser Fan */}
          <Block x={fanX} y={fanY} label="Condenser Fan" icon="🌀"
            badge={powerActive ? 'RUNNING' : 'OFF'}
            badgeColor={powerActive ? '#0ea5e9' : '#374151'}
            glowing={powerActive}>
            <Terminal x={0} y={15} label="Start" color={COLORS.L1} />
            <Terminal x={0} y={40} label="COM" color={COLORS.L2} />
          </Block>

          {/* Transformer */}
          <Block x={xfmrX} y={xfmrY} label="24V Xfmr" icon="🔧"
            badge={simOn ? '24V' : 'OFF'}
            badgeColor={simOn ? '#d97706' : '#374151'}
            glowing={simOn}>
            <Terminal x={0} y={15} label="H1" color={COLORS.L1} />
            <Terminal x={0} y={40} label="H2" color={COLORS.L2} />
            <Terminal x={COMP_W} y={15} label="R(24V)" color={COLORS.ctrl} />
            <Terminal x={COMP_W} y={40} label="C(COM)" color={COLORS.ctrl} />
          </Block>

          {/* HP Switch */}
          <Block x={hpX} y={hpY} label="HP Switch NC" icon="📊"
            badge={hpFault ? 'FAULT' : hpOk ? 'CLOSED' : 'OPEN'}
            badgeColor={hpFault ? '#dc2626' : hpOk ? '#16a34a' : '#374151'}
            glowing={simOn && hpOk}
            onClick={() => setHpOk(v => !v)}>
            <Terminal x={0} y={28} label="in" color={COLORS.ctrl} />
            <Terminal x={COMP_W} y={28} label="out" color={COLORS.ctrl} />
          </Block>

          {/* LP Switch */}
          <Block x={lpX} y={lpY} label="LP Switch NC" icon="📉"
            badge={lpFault ? 'FAULT' : lpOk ? 'CLOSED' : 'OPEN'}
            badgeColor={lpFault ? '#dc2626' : lpOk ? '#16a34a' : '#374151'}
            glowing={simOn && lpOk}
            onClick={() => setLpOk(v => !v)}>
            <Terminal x={0} y={28} label="in" color={COLORS.ctrl} />
            <Terminal x={COMP_W} y={28} label="out" color={COLORS.ctrl} />
          </Block>

          {/* Thermostat */}
          <Block x={thermoX} y={thermoY_pos} label="Thermostat Y" icon="🌡️"
            badge={thermoY ? 'CALLING' : 'IDLE'}
            badgeColor={thermoY ? '#0ea5e9' : '#374151'}
            glowing={thermoY && simOn}
            onClick={() => setThermoY(v => !v)}>
            <Terminal x={0} y={28} label="R" color={COLORS.ctrl} />
            <Terminal x={COMP_W} y={28} label="Y" color={COLORS.ctrl} />
          </Block>

          {/* Contactor Coil */}
          <Block x={coilX} y={coilY} label="Coil 24V" icon="🧲"
            badge={contactorEnergized ? 'ENERGIZED' : 'OFF'}
            badgeColor={contactorEnergized ? '#7c3aed' : '#374151'}
            glowing={contactorEnergized}>
            <Terminal x={0} y={28} label="A1" color={COLORS.ctrl} />
            <Terminal x={COMP_W} y={28} label="A2" color={COLORS.ctrl} />
          </Block>

          {/* Voltage/current readouts */}
          <Readout x={cmpX + 55} y={cmpY - 12} label="V" value="240" unit="V" active={powerActive} />
          <Readout x={cmpX + 55} y={cmpY - 2} label="I" value="12.5" unit="A" active={powerActive} />
          <Readout x={fanX + 55} y={fanY - 12} label="V" value="240" unit="V" active={powerActive} />
          <Readout x={fanX + 55} y={fanY - 2} label="I" value="2.1" unit="A" active={powerActive} />
          <Readout x={capX + 55} y={capY - 8} label="µF" value="45/5" unit="" active={powerActive} />
          <Readout x={coilX + 55} y={coilY - 8} label="V" value="24" unit="V" active={contactorEnergized} />

          {/* Section labels */}
          <text x={30} y={50} fontSize={9} fill={COLORS.dim} fontFamily="monospace" fontWeight="bold">── POWER CIRCUIT (240V) ──</text>
          <text x={200} y={268} fontSize={9} fill={COLORS.dim} fontFamily="monospace" fontWeight="bold">── CONTROL CIRCUIT (24V) ──</text>

          {/* Fault overlays */}
          {hpFault && (
            <g>
              <rect x={hpX} y={hpY} width={COMP_W} height={COMP_H} rx={8} fill="#ef444422" stroke="#ef4444" strokeWidth={2} />
              <text x={hpX + COMP_W / 2} y={hpY + COMP_H / 2 - 5} textAnchor="middle" fontSize={20} fill="#ef4444">⚠</text>
            </g>
          )}
          {lpFault && (
            <g>
              <rect x={lpX} y={lpY} width={COMP_W} height={COMP_H} rx={8} fill="#ef444422" stroke="#ef4444" strokeWidth={2} />
              <text x={lpX + COMP_W / 2} y={lpY + COMP_H / 2 - 5} textAnchor="middle" fontSize={20} fill="#ef4444">⚠</text>
            </g>
          )}
        </svg>
      </div>

      {/* Status bar */}
      <div style={{
        width: '100%', maxWidth: 920, marginTop: 10,
        display: 'flex', gap: 10, flexWrap: 'wrap',
      }}>
        {[
          { label: 'SIM', val: simOn ? 'RUNNING' : 'STOPPED', color: simOn ? COLORS.gnd : COLORS.dim },
          { label: 'CONTROL', val: controlActive ? 'ACTIVE' : 'OPEN', color: controlActive ? COLORS.ctrl : COLORS.dim },
          { label: 'CONTACTOR', val: contactorEnergized ? 'CLOSED' : 'OPEN', color: contactorEnergized ? COLORS.active : COLORS.dim },
          { label: 'COMPRESSOR', val: powerActive ? 'RUNNING' : 'OFF', color: powerActive ? '#0ea5e9' : COLORS.dim },
          { label: 'FAN', val: powerActive ? 'RUNNING' : 'OFF', color: powerActive ? '#0ea5e9' : COLORS.dim },
          { label: 'HP SW', val: hpOk ? 'OK' : '⚠ FAULT', color: hpOk ? COLORS.gnd : '#ef4444' },
          { label: 'LP SW', val: lpOk ? 'OK' : '⚠ FAULT', color: lpOk ? COLORS.gnd : '#ef4444' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{
            padding: '4px 10px', borderRadius: 5, background: '#111827',
            border: `1px solid ${color}44`, fontSize: 10, fontFamily: 'monospace',
          }}>
            <span style={{ color: COLORS.dim }}>{label}: </span>
            <span style={{ color, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ color: COLORS.dim, fontSize: 10, marginTop: 8 }}>
        Click HP/LP switches or Thermostat to toggle • Click Contactor to manually override • RUN SIM to animate wires
      </div>
    </div>
  );
}