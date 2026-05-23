import { T } from '@/lib/voltforge/theme';
import { useNavigate } from 'react-router-dom';

const NAV = [
  { id:'canvas', icon:'⬡', label:'CANVAS' },
  { id:'parts',  icon:'＋', label:'PARTS'  },
  { id:'sim',    icon:'⚡', label:'SIM'    },
  { id:'ai',     icon:'✦', label:'AI'     },
  { id:'info',   icon:'🔗', label:'INFO'   },
  { id:'save',   icon:'💾', label:'SAVE'   },
];

const EXTERNAL = [
  { id:'plans',  icon:'★', label:'PLANS',  href:'/pricing' },
  { id:'account',icon:'⚙', label:'ACCOUNT',href:'/account' },
];

export default function VFBottomNav({ view, setView, onTabReset, isLandscape }) {
  const navigate = useNavigate();
  const handleTabClick = (tabId) => {
    if (view === tabId && onTabReset) {
      onTabReset(tabId);
    } else {
      setView(tabId);
    }
  };
  const containerStyle = isLandscape
    ? { width: 58, flexShrink: 0, display: 'flex', flexDirection: 'column', background: T.panel,
        borderLeft: `1px solid ${T.b1}`, boxShadow: '-2px 0 14px rgba(0,0,0,.7)',
        overflowY: 'auto' }
    : { height: 54, flexShrink: 0, display: 'flex', background: T.panel,
        borderTop: `1px solid ${T.b1}`, boxShadow: '0 -2px 14px rgba(0,0,0,.7)' };

  const btnStyle = (active) => isLandscape
    ? { width: '100%', minHeight: 52, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        border: 'none', background: 'transparent',
        color: active ? T.blue : T.dim, fontSize: 15, transition: 'color .15s' }
    : { flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        border: 'none', background: 'transparent',
        color: active ? T.blue : T.dim, fontSize: 15, transition: 'color .15s' };

  return (
    <div style={containerStyle}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => handleTabClick(n.id)} style={btnStyle(view === n.id)}>
          <span>{n.icon}</span>
          <span style={{ fontSize: 8, letterSpacing: '.08em', fontWeight: view === n.id ? 700 : 400 }}>{n.label}</span>
        </button>
      ))}
      {EXTERNAL.map(e => (
        <a key={e.id} href={e.href}
          style={{ ...(isLandscape
            ? { width: '100%', minHeight: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }
            : { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }),
            border: 'none', background: 'transparent', color: T.green, textDecoration: 'none',
            fontSize: 15, transition: 'color .15s' }}>
          <span>{e.icon}</span>
          <span style={{ fontSize: 8, letterSpacing: '.08em', fontWeight: 400 }}>{e.label}</span>
        </a>
      ))}
    </div>
  );
}