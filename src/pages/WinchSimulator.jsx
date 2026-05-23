import { useState, useEffect, useRef } from 'react';

const C = {
  bg: '#080e18',
  panel: '#0f1926',
  border: '#1e2d3d',
  text: '#e2e8f0',
  dim: '#4b6272',
  red: '#ef4444',
  batPos: '#ff3333',
  batNeg: '#111827',
  negWire: '#555555',
  ctrl: '#fbbf24',
  fwd: '#22c55e',
  rev: '#3b82f6',
  fault: '#f97316',
  active: '#00d4ff',
};

const W = 980, H = 660;

// ── Animated wire component
function Wire({ points, color, active, flow }) {
  const [offset, setOffset] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active || !flow) { setOffset(0); return; }
    let o = 0;
    const tick = () => { o = (o - 1.5 + 40) % 40; setOffset(o); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, flow]);

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const wireColor = active ? color : C.dim;

  return (
    <g>
      {active && <path d={d} stroke={color} strokeWidth={8} fill="none" opacity={0.12} strokeLinecap="round" />}
      <path d={d} stroke={wireColor} strokeWidth={active ? 2.5 : 1.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={active && flow ? '10 6' : 'none'}
        strokeDashoffset={offset} />
    </g>
  );
}

// ── Component block
function Block({ x, y, w = 110, h = 60, label, sub, badge, badgeColor, glowing, onClick, children }) {
  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <rect x={0} y={0} width={w} height={h} rx={8}
        fill={C.panel} stroke={glowing ? C.active : C.border}
        strokeWidth={glowing ? 2 : 1}
        filter={glowing ? 'url(#glow)' : undefined} />
      <text x={w / 2} y={h / 2 - (sub ? 6 : 4)} textAnchor="middle" fontSize={10} fontWeight="600"
        fill={C.text} fontFamily="JetBrains Mono, monospace">{label}</text>
      {sub && <text x={w / 2} y={h / 2 + 7} textAnchor="middle" fontSize={8} fill={C.dim} fontFamily="monospace">{sub}</text>}
      {badge && (
        <g>
          <rect x={w / 2 - 28} y={h - 16} width={56} height={13} rx={4} fill={badgeColor || '#1e2d3d'} />
          <text x={w / 2} y={h - 6} textAnchor="middle" fontSize={7.5} fill="#fff"
            fontFamily="monospace" fontWeight="bold">{badge}</text>
        </g>
      )}
      {children}
    </g>
  );
}

function Term({ x, y, label, color, side = 'top' }) {
  const dy = side === 'top' ? -8 : 8;
  const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';
  const dx = side === 'left' ? -8 : side === 'right' ? 8 : 0;
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill={color} stroke="#000" strokeWidth={1} />
      <text x={x + dx} y={y + dy} textAnchor={anchor} fontSize={6.5} fill={color} fontFamily="monospace">{label}</text>
    </g>
  );
}

function Readout({ x, y, label, value, color = C.active }) {
  return (
    <g>
      <rect x={x - 36} y={y - 9} width={72} height={14} rx={3} fill="#060d18" stroke={color} strokeWidth={0.5} opacity={0.9} />
      <text x={x} y={y + 1} textAnchor="middle" fontSize={7.5} fill={color} fontFamily="monospace">{label}: {value}</text>
    </g>
  );
}

export default function WinchSimulator() {
  const [simOn, setSimOn] = useState(false);
  const [rockerPos, setRockerPos] = useState('off'); // 'fwd' | 'off' | 'rev'
  const [mainFuseBlown, setMainFuseBlown] = useState(false);
  const [ctrlFuseBlown, setCtrlFuseBlown] = useState(false);
  const [forceFault, setForceFault] = useState(false);

  // Reset fuses when sim stops
  useEffect(() => { if (!simOn) { setMainFuseBlown(false); setCtrlFuseBlown(false); setForceFault(false); setRockerPos('off'); } }, [simOn]);

  // Derived logic
  const mainPower = simOn && !mainFuseBlown;
  const ctrlPower = mainPower && !ctrlFuseBlown;
  const fwdSignal = ctrlPower && rockerPos === 'fwd';
  const revSignal = ctrlPower && rockerPos === 'rev';
  const fault = forceFault || (fwdSignal && revSignal);
  const fwdActive = mainPower && fwdSignal && !fault;
  const revActive = mainPower && revSignal && !fault;
  const motorRunning = fwdActive || revActive;
  const motorDir = fwdActive ? 'FORWARD' : revActive ? 'REVERSE' : 'STOPPED';
  const motorV = motorRunning ? '11.8V' : '0V';
  const motorA = fwdActive ? '42A' : revActive ? '44A' : '0A';
  const motorW = fwdActive ? '496W' : revActive ? '519W' : '0W';

  const cycleRocker = () => {
    if (!simOn) return;
    setRockerPos(p => p === 'off' ? 'fwd' : p === 'fwd' ? 'rev' : 'off');
  };

  // Layout
  // Battery
  const batX = 30, batY = 280;
  // Main fuse 150A
  const mfX = 175, mfY = 280;
  // Solenoid pack
  const solX = 360, solY = 160, solW = 150, solH = 220;
  // Winch motor
  const motX = 620, motY = 280;
  // Control fuse 30A
  const cfX = 175, cfY = 100;
  // Rocker switch
  const rkX = 355, rkY = 80;
  // Green LED
  const gLedX = 580, gLedY = 80;
  // Red LED  
  const rLedX = 580, rLedY = 140;
  // Ground bus
  const gndY = 560;
  // Resistors (inline with LEDs)
  const gResX = 710, gResY = 80;
  const rResX = 710, rResY = 140;

  // Terminal absolute coords
  const t = (bx, by, rx, ry) => [bx + rx, by + ry];

  // Battery terminals
  const batPos = t(batX, batY, 110, 20);
  const batNeg = t(batX, batY, 110, 45);
  // Main fuse
  const mfIn = t(mfX, mfY, 0, 30);
  const mfOut = t(mfX, mfY, 110, 30);
  // Solenoid pack terminals
  const solBatPos = t(solX, solY, 0, 30);
  const solBatNeg = t(solX, solY, 0, 80);
  const solMotA = t(solX, solY, solW, 40);
  const solMotB = t(solX, solY, solW, 90);
  const solFcoil1 = t(solX, solY, 0, 130); // F-coil+
  const solFcoil2 = t(solX, solY, 0, 155); // F-coil−
  const solRcoil1 = t(solX, solY, 0, 180); // R-coil+
  const solRcoil2 = t(solX, solY, 0, 205); // R-coil−
  // Motor
  const motA = t(motX, motY, 0, 20);
  const motB = t(motX, motY, 0, 45);
  const motGnd = t(motX, motY, 110, 60);
  // Control fuse
  const cfIn = t(cfX, cfY, 0, 20);
  const cfOut = t(cfX, cfY, 110, 20);
  // Rocker switch
  const rkCom = t(rkX, rkY, 0, 30);
  const rkFwd = t(rkX, rkY, 110, 20);
  const rkRev = t(rkX, rkY, 110, 45);
  // LEDs
  const gLedAn = t(gLedX, gLedY, 0, 15);
  const gLedCa = t(gLedX, gLedY, 60, 15);
  const rLedAn = t(rLedX, rLedY, 0, 15);
  const rLedCa = t(rLedX, rLedY, 60, 15);
  // Resistors
  const gResIn = t(gResX, gResY, 0, 15);
  const gResOut = t(gResX, gResY, 70, 15);
  const rResIn = t(rResX, rResY, 0, 15);
  const rResOut = t(rResX, rResY, 70, 15);

  const rockerLabel = rockerPos === 'fwd' ? 'F' : rockerPos === 'rev' ? 'R' : 'O';
  const rockerBadgeColor = rockerPos === 'fwd' ? '#16a34a' : rockerPos === 'rev' ? '#1d4ed8' : '#374151';

  return (
    <div style={{
      background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '16px 8px', fontFamily: 'JetBrains Mono, monospace',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, width: '100%', maxWidth: 1000 }}>
        <div>
          <div style={{ color: C.active, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>⚡ 12V DC WINCH CIRCUIT</div>
          <div style={{ color: C.dim, fontSize: 11 }}>H-Bridge Solenoid Pack · Rocker Switch Control · Interlock Protection</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setSimOn(v => !v)}
            style={{ padding: '6px 18px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700,
              background: simOn ? '#dc2626' : '#16a34a', color: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
            {simOn ? '■ STOP' : '▶ RUN SIM'}
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', width: '100%', maxWidth: 1000 }}>
        {[
          { label: `Rocker [${rockerLabel}]`, action: cycleRocker, color: rockerPos === 'fwd' ? C.fwd : rockerPos === 'rev' ? C.rev : C.dim, active: rockerPos !== 'off' },
          { label: mainFuseBlown ? '150A FUSE: BLOWN' : '150A Fuse OK', action: () => simOn && setMainFuseBlown(v => !v), color: mainFuseBlown ? C.fault : C.dim, active: mainFuseBlown },
          { label: ctrlFuseBlown ? '30A FUSE: BLOWN' : '30A Fuse OK', action: () => simOn && setCtrlFuseBlown(v => !v), color: ctrlFuseBlown ? C.fault : C.dim, active: ctrlFuseBlown },
          { label: forceFault ? '⚠ FORCE FAULT' : 'Force Fault', action: () => simOn && setForceFault(v => !v), color: forceFault ? C.fault : C.dim, active: forceFault },
        ].map(({ label, action, color, active }) => (
          <button key={label} onClick={action}
            style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${color}44`,
              background: active ? `${color}22` : '#1a2535', color: active ? color : C.dim,
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', color: C.dim, fontSize: 10, alignSelf: 'center' }}>
          Tap Rocker to cycle F → O → R
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
        {[['Bat+', C.batPos], ['Bat−', '#888'], ['Control', C.ctrl], ['Forward', C.fwd], ['Reverse', C.rev]].map(([lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.text }}>
            <div style={{ width: 22, height: 3, background: col, borderRadius: 2 }} />{lbl}
          </div>
        ))}
      </div>

      {/* SVG */}
      <div style={{ width: '100%', maxWidth: 1000, overflowX: 'auto', background: '#050b14', borderRadius: 12, border: `1px solid ${C.border}` }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 700 }}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── GROUND BUS ── */}
          <line x1={30} y1={gndY} x2={940} y2={gndY} stroke="#444" strokeWidth={3} strokeLinecap="round" />
          <text x={50} y={gndY - 6} fontSize={9} fill={C.dim} fontFamily="monospace">⏚ CHASSIS GROUND BUS (−12V)</text>

          {/* ── POWER WIRES ── */}
          {/* Battery+ → 150A fuse in */}
          <Wire points={[batPos, [batPos[0]+20, batPos[1]], [mfIn[0]-10, mfIn[1]], mfIn]} color={C.batPos} active={mainPower} flow={motorRunning} />
          {/* 150A fuse out → Solenoid BAT+ */}
          <Wire points={[mfOut, [mfOut[0]+15, mfOut[1]], [mfOut[0]+15, solBatPos[1]], solBatPos]} color={C.batPos} active={mainPower} flow={motorRunning} />
          {/* Battery− → Ground bus */}
          <Wire points={[batNeg, [batNeg[0]+20, batNeg[1]], [batNeg[0]+20, gndY]]} color={'#666'} active={simOn} flow={false} />
          {/* Solenoid BAT− → Ground bus */}
          <Wire points={[solBatNeg, [solBatNeg[0]-20, solBatNeg[1]], [solBatNeg[0]-20, gndY]]} color={'#666'} active={simOn} flow={false} />

          {/* ── MOTOR POWER WIRES ── */}
          {/* Solenoid Motor A → Motor A */}
          <Wire points={[solMotA, [solMotA[0]+20, solMotA[1]], [motA[0]-10, motA[1]], motA]}
            color={fwdActive ? C.fwd : revActive ? C.rev : C.dim} active={motorRunning} flow={motorRunning} />
          {/* Solenoid Motor B → Motor B */}
          <Wire points={[solMotB, [solMotB[0]+30, solMotB[1]], [motB[0]-10, motB[1]], motB]}
            color={fwdActive ? C.rev : revActive ? C.fwd : C.dim} active={motorRunning} flow={motorRunning} />
          {/* Motor frame ground → Ground bus */}
          <Wire points={[motGnd, [motGnd[0]+30, motGnd[1]], [motGnd[0]+30, gndY]]} color={'#666'} active={simOn} flow={false} />

          {/* ── CONTROL WIRES ── */}
          {/* Battery+ tap → 30A control fuse */}
          <Wire points={[[batPos[0], batPos[1]], [batPos[0], cfIn[1]], cfIn]} color={C.batPos} active={ctrlPower} flow={false} />
          {/* 30A fuse out → Rocker common */}
          <Wire points={[cfOut, [cfOut[0]+20, cfOut[1]], [rkCom[0]-10, rkCom[1]], rkCom]} color={C.ctrl} active={ctrlPower} flow={false} />
          {/* Rocker Fwd-out → Sol F-coil+ */}
          <Wire points={[rkFwd, [rkFwd[0]+20, rkFwd[1]], [rkFwd[0]+20, solFcoil1[1]], solFcoil1]}
            color={C.ctrl} active={fwdSignal} flow={false} />
          {/* Rocker Fwd-out → Green LED anode (tap from F-coil line) */}
          <Wire points={[[rkFwd[0]+20, rkFwd[1]], gLedAn]} color={C.fwd} active={fwdSignal} flow={false} />
          {/* Rocker Rev-out → Sol R-coil+ */}
          <Wire points={[rkRev, [rkRev[0]+30, rkRev[1]], [rkRev[0]+30, solRcoil1[1]], solRcoil1]}
            color={C.ctrl} active={revSignal} flow={false} />
          {/* Rocker Rev-out → Red LED anode */}
          <Wire points={[[rkRev[0]+30, rkRev[1]], rLedAn]} color={C.rev} active={revSignal} flow={false} />

          {/* Sol F-coil− → Ground bus */}
          <Wire points={[solFcoil2, [solFcoil2[0]-30, solFcoil2[1]], [solFcoil2[0]-30, gndY]]} color={'#666'} active={simOn} flow={false} />
          {/* Sol R-coil− → Ground bus */}
          <Wire points={[solRcoil2, [solRcoil2[0]-40, solRcoil2[1]], [solRcoil2[0]-40, gndY]]} color={'#666'} active={simOn} flow={false} />

          {/* LED cathode → resistor → Ground bus */}
          <Wire points={[gLedCa, gResIn]} color={C.fwd} active={fwdSignal} flow={false} />
          <Wire points={[gResOut, [gResOut[0]+10, gResOut[1]], [gResOut[0]+10, gndY]]} color={'#666'} active={fwdSignal} flow={false} />
          <Wire points={[rLedCa, rResIn]} color={C.rev} active={revSignal} flow={false} />
          <Wire points={[rResOut, [rResOut[0]+10, rResOut[1]], [rResOut[0]+10, gndY]]} color={'#666'} active={revSignal} flow={false} />

          {/* ── COMPONENTS ── */}

          {/* 12V Battery */}
          <Block x={batX} y={batY} label="12V Battery" sub="Main Power" w={110} h={70}
            badge={mainPower ? 'LIVE' : simOn ? 'FAULT' : 'OFF'}
            badgeColor={mainPower ? '#16a34a' : simOn ? '#dc2626' : '#374151'}
            glowing={mainPower}>
            <Term x={110} y={20} label="BAT+" color={C.batPos} side="right" />
            <Term x={110} y={45} label="BAT−" color={'#888'} side="right" />
          </Block>

          {/* 150A Main Fuse */}
          <Block x={mfX} y={mfY} label="150A FUSE" sub="Main Inline" w={110} h={60}
            badge={mainFuseBlown ? '⚠ BLOWN' : mainPower ? 'OK' : 'OFF'}
            badgeColor={mainFuseBlown ? '#dc2626' : mainPower ? '#16a34a' : '#374151'}
            glowing={mainPower && !mainFuseBlown}
            onClick={() => simOn && setMainFuseBlown(v => !v)}>
            <Term x={0} y={30} label="IN" color={C.batPos} side="left" />
            <Term x={110} y={30} label="OUT" color={C.batPos} side="right" />
          </Block>

          {/* 30A Control Fuse */}
          <Block x={cfX} y={cfY} label="30A FUSE" sub="Control Line" w={110} h={45}
            badge={ctrlFuseBlown ? '⚠ BLOWN' : ctrlPower ? 'OK' : 'OFF'}
            badgeColor={ctrlFuseBlown ? '#dc2626' : ctrlPower ? '#d97706' : '#374151'}
            glowing={ctrlPower}
            onClick={() => simOn && !mainFuseBlown && setCtrlFuseBlown(v => !v)}>
            <Term x={0} y={20} label="IN" color={C.batPos} side="left" />
            <Term x={110} y={20} label="OUT" color={C.ctrl} side="right" />
          </Block>

          {/* Rocker Switch */}
          <Block x={rkX} y={rkY} label="ROCKER SW" sub="3-pos F/O/R" w={110} h={65}
            badge={rockerPos === 'off' ? 'OFF' : rockerPos === 'fwd' ? 'FORWARD' : 'REVERSE'}
            badgeColor={rockerPos === 'fwd' ? '#16a34a' : rockerPos === 'rev' ? '#1d4ed8' : '#374151'}
            glowing={ctrlPower && rockerPos !== 'off'}
            onClick={cycleRocker}>
            <Term x={0} y={30} label="COM" color={C.ctrl} side="left" />
            <Term x={110} y={20} label="FWD" color={C.fwd} side="right" />
            <Term x={110} y={45} label="REV" color={C.rev} side="right" />
            {/* Position indicator */}
            <text x={55} y={28} textAnchor="middle" fontSize={14} fill={rockerPos === 'fwd' ? C.fwd : rockerPos === 'rev' ? C.rev : C.dim}>
              {rockerPos === 'fwd' ? '← F' : rockerPos === 'rev' ? 'R →' : '  O  '}
            </text>
          </Block>

          {/* Solenoid Pack */}
          <g transform={`translate(${solX},${solY})`}>
            <rect x={0} y={0} width={solW} height={solH} rx={10}
              fill={C.panel} stroke={motorRunning ? C.active : fault ? C.fault : C.border}
              strokeWidth={motorRunning || fault ? 2 : 1}
              filter={motorRunning ? 'url(#glow)' : undefined} />
            <text x={solW / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="700"
              fill={C.text} fontFamily="monospace">SOLENOID PACK</text>
            <text x={solW / 2} y={32} textAnchor="middle" fontSize={8} fill={C.dim} fontFamily="monospace">4-Sol H-Bridge</text>
            {/* F-solenoid state */}
            <rect x={10} y={38} width={60} height={13} rx={3}
              fill={fwdActive ? '#16a34a' : '#1e2d3d'} />
            <text x={40} y={48} textAnchor="middle" fontSize={7.5} fill="#fff" fontFamily="monospace" fontWeight="bold">
              {fwdActive ? 'F-SOL: ON' : 'F-SOL: OFF'}
            </text>
            {/* R-solenoid state */}
            <rect x={80} y={38} width={60} height={13} rx={3}
              fill={revActive ? '#1d4ed8' : '#1e2d3d'} />
            <text x={110} y={48} textAnchor="middle" fontSize={7.5} fill="#fff" fontFamily="monospace" fontWeight="bold">
              {revActive ? 'R-SOL: ON' : 'R-SOL: OFF'}
            </text>
            {/* Fault */}
            {fault && (
              <g>
                <rect x={10} y={56} width={130} height={14} rx={3} fill="#7f1d1d" />
                <text x={75} y={66} textAnchor="middle" fontSize={8} fill="#fca5a5" fontFamily="monospace" fontWeight="bold">⚠ INTERLOCK FAULT</text>
              </g>
            )}
            {/* Motor path label */}
            <text x={solW / 2} y={90} textAnchor="middle" fontSize={8} fill={motorRunning ? C.active : C.dim} fontFamily="monospace">
              {fwdActive ? 'PATH: BAT+→ A→B→BAT−' : revActive ? 'PATH: BAT+→ B→A→BAT−' : 'PATH: OPEN'}
            </text>
            {/* Terminals */}
            <Term x={0} y={30} label="BAT+" color={C.batPos} side="left" />
            <Term x={0} y={80} label="BAT−" color={'#888'} side="left" />
            <Term x={solW} y={40} label="MOT-A" color={fwdActive ? C.fwd : C.dim} side="right" />
            <Term x={solW} y={90} label="MOT-B" color={revActive ? C.fwd : C.dim} side="right" />
            <Term x={0} y={130} label="F-C+" color={C.fwd} side="left" />
            <Term x={0} y={155} label="F-C−" color={'#666'} side="left" />
            <Term x={0} y={180} label="R-C+" color={C.rev} side="left" />
            <Term x={0} y={205} label="R-C−" color={'#666'} side="left" />
          </g>

          {/* Winch Motor */}
          <Block x={motX} y={motY} label="WINCH MOTOR" sub="12V DC PM" w={120} h={75}
            badge={motorRunning ? motorDir : 'STOPPED'}
            badgeColor={fwdActive ? '#16a34a' : revActive ? '#1d4ed8' : '#374151'}
            glowing={motorRunning}>
            <Term x={0} y={20} label="A" color={C.fwd} side="left" />
            <Term x={0} y={45} label="B" color={C.rev} side="left" />
            <Term x={120} y={60} label="GND" color={'#666'} side="right" />
            {motorRunning && (
              <text x={60} y={35} textAnchor="middle" fontSize={18} fill={C.active}
                style={{ animation: fwdActive ? 'spin 0.5s linear infinite' : 'none',
                  display: 'inline-block', transformOrigin: '60px 35px' }}>⚙</text>
            )}
          </Block>

          {/* Green LED (Forward) */}
          <g transform={`translate(${gLedX},${gLedY})`}>
            <rect x={0} y={0} width={60} height={30} rx={5}
              fill={C.panel} stroke={fwdActive ? C.fwd : C.border} strokeWidth={fwdActive ? 2 : 1}
              filter={fwdActive ? 'url(#glow)' : undefined} />
            <text x={30} y={13} textAnchor="middle" fontSize={10} fill={fwdActive ? C.fwd : C.dim}>●</text>
            <text x={30} y={24} textAnchor="middle" fontSize={7} fill={C.dim} fontFamily="monospace">FWD LED</text>
            <Term x={0} y={15} label="A+" color={C.fwd} side="left" />
            <Term x={60} y={15} label="K−" color={C.dim} side="right" />
          </g>

          {/* Red LED (Reverse) */}
          <g transform={`translate(${rLedX},${rLedY})`}>
            <rect x={0} y={0} width={60} height={30} rx={5}
              fill={C.panel} stroke={revActive ? C.rev : C.border} strokeWidth={revActive ? 2 : 1}
              filter={revActive ? 'url(#glow)' : undefined} />
            <text x={30} y={13} textAnchor="middle" fontSize={10} fill={revActive ? C.rev : C.dim}>●</text>
            <text x={30} y={24} textAnchor="middle" fontSize={7} fill={C.dim} fontFamily="monospace">REV LED</text>
            <Term x={0} y={15} label="A+" color={C.rev} side="left" />
            <Term x={60} y={15} label="K−" color={C.dim} side="right" />
          </g>

          {/* Green LED resistor */}
          <g transform={`translate(${gResX},${gResY})`}>
            <rect x={0} y={0} width={70} height={30} rx={5} fill={C.panel} stroke={C.border} />
            <text x={35} y={13} textAnchor="middle" fontSize={8} fill={C.dim} fontFamily="monospace">470Ω</text>
            <text x={35} y={24} textAnchor="middle" fontSize={7} fill={C.dim} fontFamily="monospace">R-limit</text>
            <Term x={0} y={15} label="" color={C.dim} side="left" />
            <Term x={70} y={15} label="" color={C.dim} side="right" />
          </g>

          {/* Red LED resistor */}
          <g transform={`translate(${rResX},${rResY})`}>
            <rect x={0} y={0} width={70} height={30} rx={5} fill={C.panel} stroke={C.border} />
            <text x={35} y={13} textAnchor="middle" fontSize={8} fill={C.dim} fontFamily="monospace">470Ω</text>
            <text x={35} y={24} textAnchor="middle" fontSize={7} fill={C.dim} fontFamily="monospace">R-limit</text>
            <Term x={0} y={15} label="" color={C.dim} side="left" />
            <Term x={70} y={15} label="" color={C.dim} side="right" />
          </g>

          {/* Ground bus tie points */}
          {[[120, gndY], [solBatNeg[0]-20, gndY], [solFcoil2[0]-30, gndY], [solRcoil2[0]-40, gndY], [motGnd[0]+30, gndY], [gResOut[0]+10, gndY], [rResOut[0]+10, gndY]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4} fill={C.dim} />
          ))}

          {/* ── LIVE READOUTS ── */}
          <Readout x={motX + 60} y={motY - 18} label="V" value={motorV} color={motorRunning ? C.active : C.dim} />
          <Readout x={motX + 60} y={motY - 4} label="I" value={motorA} color={motorRunning ? C.fwd : C.dim} />
          <Readout x={motX + 60} y={motY + 10} label="W" value={motorW} color={motorRunning ? C.fault : C.dim} />
          <Readout x={solX + solW / 2} y={solY + solH + 18} label="DIR"
            value={fault ? 'FAULT' : motorDir}
            color={fault ? C.fault : fwdActive ? C.fwd : revActive ? C.rev : C.dim} />

          {/* Fault flash overlay */}
          {fault && (
            <g style={{ animation: 'stateBlink 0.4s ease-in-out infinite' }}>
              <rect x={solX - 5} y={solY - 5} width={solW + 10} height={solH + 10} rx={12}
                fill="none" stroke={C.fault} strokeWidth={3} opacity={0.7} />
              <text x={solX + solW / 2} y={solY + solH / 2 + 4} textAnchor="middle" fontSize={28} fill={C.fault} opacity={0.5}>⚠</text>
            </g>
          )}

          {/* Section labels */}
          <text x={30} y={260} fontSize={8} fill={C.dim} fontFamily="monospace">── POWER (12V) ──</text>
          <text x={150} y={80} fontSize={8} fill={C.dim} fontFamily="monospace">── CONTROL CIRCUIT ──</text>
          <text x={610} y={260} fontSize={8} fill={C.dim} fontFamily="monospace">── LOAD ──</text>
        </svg>
      </div>

      {/* Status bar */}
      <div style={{ width: '100%', maxWidth: 1000, marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'SIM', val: simOn ? 'RUNNING' : 'STOPPED', color: simOn ? '#22c55e' : C.dim },
          { label: 'MAIN FUSE', val: mainFuseBlown ? '⚠ BLOWN' : mainPower ? 'OK' : 'OFF', color: mainFuseBlown ? C.fault : mainPower ? '#22c55e' : C.dim },
          { label: 'CTRL FUSE', val: ctrlFuseBlown ? '⚠ BLOWN' : ctrlPower ? 'OK' : 'OFF', color: ctrlFuseBlown ? C.fault : ctrlPower ? '#d97706' : C.dim },
          { label: 'ROCKER', val: rockerPos.toUpperCase(), color: rockerPos === 'fwd' ? C.fwd : rockerPos === 'rev' ? C.rev : C.dim },
          { label: 'F-SOL', val: fwdActive ? 'ENERGIZED' : 'OFF', color: fwdActive ? C.fwd : C.dim },
          { label: 'R-SOL', val: revActive ? 'ENERGIZED' : 'OFF', color: revActive ? C.rev : C.dim },
          { label: 'MOTOR', val: fault ? '⚠ FAULT' : motorDir, color: fault ? C.fault : motorRunning ? C.active : C.dim },
          { label: 'INTERLOCK', val: fault ? '⚠ VIOLATED' : 'OK', color: fault ? C.fault : '#22c55e' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ padding: '4px 10px', borderRadius: 5, background: '#0f1926',
            border: `1px solid ${color}44`, fontSize: 10, fontFamily: 'monospace' }}>
            <span style={{ color: C.dim }}>{label}: </span>
            <span style={{ color, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ color: C.dim, fontSize: 10, marginTop: 8, textAlign: 'center' }}>
        Tap Rocker Switch to cycle Forward → OFF → Reverse · Tap Fuse blocks to blow/reset · Force Fault to test interlock
      </div>
    </div>
  );
}