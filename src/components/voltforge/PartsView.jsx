import { T } from '@/lib/voltforge/theme';
import { DEFS, CATEGORIES } from '@/lib/voltforge/definitions';

export default function PartsView({ placing, setPlacing, activeCat, setActiveCat, setView }) {
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                  background:T.bg, overflow:'hidden' }}>

      <div style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none',
                    background:T.panel, borderBottom:`1px solid ${T.b1}`,
                    flexShrink:0, height:36 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            style={{ flexShrink:0, padding:'0 14px', border:'none',
                     borderBottom:`2.5px solid ${activeCat===cat.id?T.blue:'transparent'}`,
                     background:'transparent', color:activeCat===cat.id?T.blue:T.sub,
                     fontSize:9, letterSpacing:'.06em', whiteSpace:'nowrap',
                     transition:'color .15s' }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:12,
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10,
                    alignContent:'start' }}>
        {(CATEGORIES.find(c => c.id === activeCat)?.types ?? []).map(type => {
          const def = DEFS[type];
          if (!def) return null;
          const active = placing === type;
          return (
            <button key={type}
              onClick={() => { setPlacing(active ? null : type); if (!active) setView('canvas'); }}
              style={{ padding:'14px 8px', borderRadius:12,
                       border:`1.5px solid ${active ? def.color : T.b2}`,
                       background: active ? `${def.color}1c` : T.card,
                       display:'flex', flexDirection:'column',
                       alignItems:'center', gap:6, transition:'all .15s',
                       boxShadow: active ? `0 0 16px ${def.color}44` : '0 2px 6px rgba(0,0,0,.4)' }}>
              <span style={{ fontSize:26 }}>{def.emoji}</span>
              <span style={{ fontSize:9, color: active ? def.color : T.sub,
                             fontWeight: active ? 700 : 400, textAlign:'center',
                             lineHeight:1.3 }}>
                {def.label}
              </span>
            </button>
          );
        })}
      </div>

      {placing && (
        <div style={{ flexShrink:0, padding:'10px 14px', background:T.panel,
                      borderTop:`1px solid ${T.b1}`, display:'flex',
                      alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>{DEFS[placing]?.emoji}</span>
          <span style={{ flex:1, fontSize:10, color:T.blue }}>
            {DEFS[placing]?.label} selected — tap CANVAS to place
          </span>
          <button onClick={() => { setPlacing(null); setView('canvas'); }}
            style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${T.red}44`,
                     background:`${T.red}0a`, color:T.red, fontSize:9 }}>
            Cancel
          </button>
          <button onClick={() => setView('canvas')}
            style={{ padding:'6px 14px', borderRadius:8, border:'none',
                     background:'linear-gradient(135deg,#00d4ff,#39ff7a)',
                     color:'#000', fontSize:9, fontWeight:700 }}>
            Go →
          </button>
        </div>
      )}
    </div>
  );
}