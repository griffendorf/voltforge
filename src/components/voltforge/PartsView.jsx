import { useState } from 'react';
import { T } from '@/lib/voltforge/theme';
import { DEFS, CATEGORIES } from '@/lib/voltforge/definitions';
import PullToRefresh from '@/components/voltforge/PullToRefresh';

export default function PartsView({ placing, setPlacing, activeCat, setActiveCat, setView }) {
  const [search, setSearch] = useState('');

  const allTypes = CATEGORIES.flatMap(c => c.types);
  const filteredTypes = search.trim()
    ? allTypes.filter(type => {
        const def = DEFS[type];
        if (!def) return false;
        const q = search.toLowerCase();
        const cat = CATEGORIES.find(c => c.types.includes(type))?.label?.toLowerCase() ?? '';
        return def.label.toLowerCase().includes(q) || cat.includes(q);
      })
    : (CATEGORIES.find(c => c.id === activeCat)?.types ?? []);

  return (
    <PullToRefresh onRefresh={async () => {}} refreshKey={activeCat}>
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                    background:T.bg, overflow:'hidden' }}>

        {/* Search bar */}
        <div style={{ padding:'8px 10px', background:T.panel,
                      borderBottom:`1px solid ${T.b1}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8,
                        background:T.card, border:`1px solid ${search ? T.blue : T.b2}`,
                        borderRadius:10, padding:'0 10px', transition:'border-color .15s' }}>
            <span style={{ fontSize:12, color:T.dim }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search components…"
              style={{ flex:1, background:'transparent', border:'none', outline:'none',
                       color:T.text, fontSize:11, padding:'8px 0',
                       fontFamily:'JetBrains Mono,monospace' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background:'none', border:'none', color:T.dim,
                         fontSize:14, cursor:'pointer', padding:0,
                         minHeight:0, minWidth:0, lineHeight:1 }}>✕</button>
            )}
          </div>
        </div>

        {/* Category tabs — hidden during search */}
        {!search && (
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
        )}

        {/* Search result label */}
        {search && (
          <div style={{ padding:'6px 12px', fontSize:9, color:T.dim, flexShrink:0 }}>
            {filteredTypes.length} result{filteredTypes.length !== 1 ? 's' : ''} for "{search}"
          </div>
        )}

        <div style={{ flex:1, overflowY:'auto', padding:12,
                      display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10,
                      alignContent:'start' }}>
          {filteredTypes.map(type => {
            const def = DEFS[type];
            if (!def) return null;
            const active = placing === type;
            return (
              <button key={type}
                onClick={() => { setPlacing(active ? null : type); setSearch(''); if (!active) setView('canvas'); }}
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

          {search && filteredTypes.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px 0',
                          color:T.dim, fontSize:11 }}>
              No components found for "{search}"
            </div>
          )}
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
    </PullToRefresh>
  );
}