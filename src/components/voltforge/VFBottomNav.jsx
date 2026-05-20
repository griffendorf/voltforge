import { T } from '@/lib/voltforge/theme';

const NAV = [
  { id:'canvas', icon:'⬡', label:'CANVAS' },
  { id:'parts',  icon:'＋', label:'PARTS'  },
  { id:'sim',    icon:'⚡', label:'SIM'    },
  { id:'ai',     icon:'✦', label:'AI'     },
  { id:'info',   icon:'🔗', label:'INFO'   },
  { id:'save',   icon:'💾', label:'SAVE'   },
];

export default function VFBottomNav({ view, setView }) {
  return (
    <div style={{ height:54, flexShrink:0, display:'flex', background:T.panel,
                  borderTop:`1px solid ${T.b1}`,
                  boxShadow:'0 -2px 14px rgba(0,0,0,.7)' }}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => setView(n.id)}
          style={{ flex:1, display:'flex', flexDirection:'column',
                   alignItems:'center', justifyContent:'center', gap:3,
                   border:'none', background:'transparent',
                   color: view === n.id ? T.blue : T.dim,
                   fontSize:15, transition:'color .15s' }}>
          <span>{n.icon}</span>
          <span style={{ fontSize:7, letterSpacing:'.08em',
                         fontWeight: view === n.id ? 700 : 400 }}>{n.label}</span>
        </button>
      ))}
    </div>
  );
}