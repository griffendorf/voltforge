import { T, STATE_COL } from '@/lib/voltforge/theme';
import { DEFS } from '@/lib/voltforge/definitions';

export default function SimView({ simOn, simPaused, snap, simStatus, simCol, comps, toggleSim, togglePause, stepOnce, setSelected, setView }) {
  return (
    <div style={{ width:'100%', height:'100%', overflowY:'auto',
                  padding:'14px 14px 20px', display:'flex', flexDirection:'column', gap:10 }}>

      <div style={{ fontSize:9, color:T.sub, letterSpacing:'.12em', fontWeight:600 }}>SIMULATION</div>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={toggleSim}
          style={{ flex:2, padding:'11px', borderRadius:10, border:'none', cursor:'pointer',
                   fontFamily:"'Orbitron',sans-serif", fontSize:11, fontWeight:700,
                   background:simOn?'linear-gradient(135deg,#ff3a3a,#ff6b35)':'linear-gradient(135deg,#39ff7a,#00ffcc)',
                   color:'#000', boxShadow:simOn?'0 0 14px rgba(255,58,58,.4)':'0 0 14px rgba(57,255,122,.4)' }}>
          {simOn ? '⏹ STOP' : '▶ RUN'}
        </button>
        {simOn && (
          <button onClick={togglePause}
            style={{ flex:1, padding:'11px', borderRadius:10, cursor:'pointer',
                     border:`1px solid ${T.amber}44`, background:`${T.amber}0f`, color:T.amber, fontSize:11 }}>
            {simPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        )}
        {!simOn && (
          <button onClick={stepOnce}
            style={{ flex:1, padding:'11px', borderRadius:10, cursor:'pointer',
                     border:`1px solid ${T.blue}44`, background:`${T.blue}0f`, color:T.blue, fontSize:11 }}>
            ⏭ STEP
          </button>
        )}
      </div>

      {snap && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[['STATUS', simStatus.toUpperCase(), simCol],
            ['SOURCE', `${snap.Vs.toFixed(2)}V`, T.amber],
            ['CURRENT', `${(snap.I*1000).toFixed(1)}mA`, T.cyan],
            ['POWER', `${(snap.P*1000).toFixed(0)}mW`, T.green],
            ['TICK', snap.tick, T.sub],
          ].map(([l,v,c], i) => (
            <div key={i} style={{ padding:'9px 6px', borderRadius:9, background:T.card,
                                  border:`1px solid ${T.b1}`, textAlign:'center' }}>
              <div style={{ fontSize:7, color:T.dim, marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:13, color:c, fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {!snap && (
        <div style={{ padding:20, textAlign:'center', color:T.dim, fontSize:10,
                      lineHeight:1.9, borderRadius:10, background:T.card,
                      border:`1px solid ${T.b1}` }}>
          Press ▶ RUN to start the simulation
        </div>
      )}

      {snap && comps.map(comp => {
        const bh = snap.bh?.get(comp.id);
        if (!bh) return null;
        const sc = STATE_COL[bh.state] ?? T.sub;
        return (
          <div key={comp.id}
            onClick={() => { setSelected(comp.id); setView('info'); }}
            style={{ padding:'10px 12px', borderRadius:10, background:T.card,
                     border:`1px solid ${T.b1}`, borderLeft:`4px solid ${sc}`,
                     cursor:'pointer' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{DEFS[comp.type]?.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:T.text, overflow:'hidden',
                              textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {comp.label}
                </div>
              </div>
              <div style={{ padding:'2px 8px', borderRadius:5, fontSize:9,
                            fontWeight:700, background:sc, color:'#000' }}>
                {bh.state}
              </div>
            </div>
            <div style={{ display:'flex', gap:5 }}>
              {[['V',`${bh.V.toFixed(2)}V`,T.amber],
                ['I',`${(bh.I*1000).toFixed(1)}mA`,T.cyan],
                ['P%',`${Math.round(bh.powerLevel*100)}%`,T.green]
              ].map(([l,v,c]) => (
                <div key={l} style={{ flex:1, textAlign:'center', padding:'4px 0',
                                      borderRadius:6, background:`${c}0a` }}>
                  <div style={{ fontSize:7, color:T.dim }}>{l}</div>
                  <div style={{ fontSize:10, color:c, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            {bh.faults.map((f,i) => (
              <div key={i} style={{ marginTop:6, fontSize:8, color:T.amber,
                                    padding:'3px 8px', borderRadius:5,
                                    background:`${T.amber}0a`, border:`1px solid ${T.amber}33` }}>
                ⚠ {f}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}