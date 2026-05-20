import { T, STATE_COL } from '@/lib/voltforge/theme';
import { DEFS } from '@/lib/voltforge/definitions';
import { G } from '@/lib/voltforge/instances';

export default function InfoView({ issues, errors, warnings, comps, stats, selComp, snap, selected, setSelected, wColor, setWColor, bump }) {
  return (
    <div style={{ width:'100%', height:'100%', overflowY:'auto',
                  padding:'14px 14px 20px', display:'flex', flexDirection:'column', gap:10 }}>

      <div style={{ fontSize:9, color:T.sub, letterSpacing:'.12em', fontWeight:600 }}>CIRCUIT INFO</div>

      {issues.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          <div style={{ fontSize:9, color:T.sub, fontWeight:600, letterSpacing:'.1em' }}>
            VALIDATION — {errors.length} error{errors.length!==1?'s':''}, {warnings.length} warning{warnings.length!==1?'s':''}
          </div>
          {issues.map(iss => {
            const col = iss.severity==='error' ? T.red : iss.severity==='warning' ? T.amber : T.blue;
            const icon = iss.severity==='error' ? '✕' : iss.severity==='warning' ? '⚠' : 'ℹ';
            return (
              <div key={iss.id} style={{ padding:'9px 11px', borderRadius:9, background:T.card,
                                         border:`1px solid ${col}28`, borderLeft:`3px solid ${col}` }}>
                <div style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                  <span style={{ color:col, fontSize:11, flexShrink:0 }}>{icon}</span>
                  <span style={{ fontSize:10, color:T.text, lineHeight:1.5 }}>{iss.msg}</span>
                </div>
                {iss.compIds.length > 0 && (
                  <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:5 }}>
                    {iss.compIds.map(cid => {
                      const c = G.components.get(cid);
                      return c ? (
                        <button key={cid} onClick={() => setSelected(cid)}
                          style={{ padding:'2px 8px', borderRadius:6, fontSize:8,
                                   border:`1px solid ${col}44`, background:`${col}10`, color:col }}>
                          {c.label}
                        </button>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : comps.length > 0 ? (
        <div style={{ padding:'9px 12px', borderRadius:9, background:T.card,
                      border:`1px solid ${T.green}33`, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16, color:T.green }}>✓</span>
          <span style={{ fontSize:10, color:T.green }}>No issues detected</span>
        </div>
      ) : null}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {[['Components',stats.c,T.blue],['Wires',stats.w,T.cyan],['Nodes',stats.n,T.purple]].map(([l,v,c]) => (
          <div key={l} style={{ padding:'9px 6px', borderRadius:9, background:T.card,
                                border:`1px solid ${T.b1}`, textAlign:'center' }}>
            <div style={{ fontSize:8, color:T.dim, marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:16, color:c, fontWeight:700 }}>{v}</div>
          </div>
        ))}
      </div>

      {selComp ? (
        <div style={{ padding:'12px 14px', borderRadius:10, background:T.card,
                      border:`1px solid ${T.blue}44` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:26 }}>{DEFS[selComp.type]?.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:T.blue, fontWeight:600 }}>{selComp.label}</div>
              <div style={{ fontSize:9, color:T.dim, marginTop:1 }}>{selComp.type}</div>
            </div>
            {(() => { const bh=snap?.bh?.get(selComp.id); return bh ? (
              <div style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:700,
                            background:STATE_COL[bh.state]??T.sub, color:'#000' }}>{bh.state}</div>
            ) : null; })()}
          </div>
          {(() => {
            const bh = snap?.bh?.get(selComp.id);
            return bh ? (
              <div style={{ marginBottom:10 }}>
                {[['Voltage',`${bh.V.toFixed(3)} V`,T.amber],
                  ['Current',`${(bh.I*1000).toFixed(2)} mA`,T.cyan],
                  ['Power',`${(bh.P*1000).toFixed(2)} mW`,T.green],
                  ['Temp',`${bh.thermalC.toFixed(1)} °C`,bh.thermalC>80?T.red:T.sub],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between',
                                       padding:'6px 0', borderBottom:`1px solid ${T.b1}`, fontSize:10 }}>
                    <span style={{ color:T.sub }}>{l}</span>
                    <span style={{ color:c, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                {bh.faults.map((f,i) => (
                  <div key={i} style={{ marginTop:7, fontSize:9, color:T.amber,
                                        padding:'5px 9px', borderRadius:6,
                                        background:`${T.amber}0a`, border:`1px solid ${T.amber}33` }}>
                    ⚠ {f}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize:9, color:T.dim, marginBottom:8 }}>Press ▶ RUN for live values</div>;
          })()}
          {selComp.termIds.map(tid => {
            const t = G.terminals.get(tid);
            if (!t) return null;
            const tv = snap?.termV?.get(tid);
            return (
              <div key={tid} style={{ display:'flex', justifyContent:'space-between',
                                     padding:'5px 0', borderBottom:`1px solid ${T.b1}`, fontSize:9 }}>
                <span style={{ color:T.sub }}>{t.label}</span>
                <span style={{ color:t.wireIds.size>0?T.green:T.dim }}>
                  {tv!=null ? `${tv.toFixed(2)}V` : t.wireIds.size>0 ? `${t.wireIds.size} wire${t.wireIds.size>1?'s':''}` : 'open'}
                </span>
              </div>
            );
          })}
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => { G.rotateComponent(selComp.id); bump(); }}
              style={{ flex:1, padding:'8px', borderRadius:9, cursor:'pointer',
                       border:`1px solid ${T.purple}44`, background:`${T.purple}0a`, color:T.purple, fontSize:10 }}>
              ↻ Rotate
            </button>
            <button onClick={() => { G.removeComponent(selComp.id); setSelected(null); bump(); }}
              style={{ flex:1, padding:'8px', borderRadius:9, cursor:'pointer',
                       border:`1px solid ${T.red}44`, background:`${T.red}0a`, color:T.red, fontSize:10 }}>
              ✕ Delete
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding:14, textAlign:'center', color:T.dim, fontSize:10,
                      lineHeight:1.9, borderRadius:10, background:T.card, border:`1px solid ${T.b1}` }}>
          Tap any component on the canvas to inspect it
        </div>
      )}

      <div style={{ padding:'12px 14px', borderRadius:10, background:T.card, border:`1px solid ${T.b1}` }}>
        <div style={{ fontSize:9, color:T.sub, letterSpacing:'.1em', marginBottom:11, fontWeight:600 }}>
          WIRE COLOR
        </div>
        <div style={{ display:'flex', gap:10, marginBottom:14 }}>
          {[T.blue,T.cyan,T.green,T.amber,T.red,T.purple].map(c => (
            <div key={c} onClick={() => setWColor(c)}
              style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                       border:`3px solid ${wColor===c?'#fff':'transparent'}`,
                       transform:wColor===c?'scale(1.2)':'scale(1)', transition:'all .15s',
                       boxShadow:wColor===c?`0 0 9px ${c}`:'none' }}/>
          ))}
        </div>
        <button onClick={() => { G.clearAll(); setSelected(null); bump(); }}
          style={{ width:'100%', padding:'10px', borderRadius:9, cursor:'pointer',
                   border:`1px solid ${T.red}44`, background:`${T.red}08`, color:T.red, fontSize:10 }}>
          🗑  Clear all components
        </button>
      </div>
    </div>
  );
}