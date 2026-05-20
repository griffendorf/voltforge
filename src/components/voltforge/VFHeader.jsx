import { T } from '@/lib/voltforge/theme';

export default function VFHeader({ simOn, simPaused, simSnap, simStatus, simCol, comps, wires, errors, warnings, toggleSim, togglePause }) {
  const snap = simSnap;
  
  return (
    <div style={{ height:44, flexShrink:0, display:'flex', alignItems:'center',
                  padding:'0 10px', gap:8, background:T.panel,
                  borderBottom:`1px solid ${T.b1}`,
                  boxShadow:'0 2px 14px rgba(0,0,0,.8)' }}>

      <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, fontWeight:700,
                     background:'linear-gradient(90deg,#00d4ff,#39ff7a)',
                     WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                     flexShrink:0 }}>
        VOLTFORGE
      </span>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {simOn && snap && (
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px',
                        borderRadius:14, border:`1px solid ${simCol}44`,
                        background:`${simCol}0e`, fontSize:9, color:simCol }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:simCol,
                          animation:'pulse 1.8s ease-in-out infinite' }}/>
            {simStatus === 'running'
              ? `${snap.Vs.toFixed(1)}V  ${(snap.I*1000).toFixed(1)}mA  ${(snap.P*1000).toFixed(0)}mW`
              : simStatus.toUpperCase()}
          </div>
        )}
        {!simOn && (
          <span style={{ fontSize:8, color:T.dim }}>
            {comps.length} comp · {wires.length} wire
            {errors.length > 0 && <span style={{ color:T.red }}> · ✕{errors.length}</span>}
            {warnings.length > 0 && <span style={{ color:T.amber }}> · ⚠{warnings.length}</span>}
          </span>
        )}
      </div>

      <button onClick={toggleSim}
        style={{ height:34, padding:'0 16px', borderRadius:9, border:'none', flexShrink:0,
                 fontFamily:"'Orbitron',sans-serif", fontSize:10, fontWeight:700,
                 background: simOn
                   ? 'linear-gradient(135deg,#ff3a3a,#ff6b35)'
                   : 'linear-gradient(135deg,#39ff7a,#00ffcc)',
                 color:'#000',
                 boxShadow: simOn ? '0 0 12px rgba(255,58,58,.5)' : '0 0 14px rgba(57,255,122,.5)' }}>
        {simOn ? '⏹ STOP' : '▶ RUN'}
      </button>

      {simOn && (
        <button onClick={togglePause}
          style={{ width:34, height:34, borderRadius:9, flexShrink:0,
                   border:`1px solid ${T.amber}55`, background:`${T.amber}12`,
                   color:T.amber, fontSize:17 }}>
          {simPaused ? '▶' : '⏸'}
        </button>
      )}
    </div>
  );
}