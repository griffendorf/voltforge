import { useState, useRef, useCallback } from 'react';
import { T } from '@/lib/voltforge/theme';
import { uid } from '@/lib/voltforge/graph';
import { G, STORE, HIST, SIM } from '@/lib/voltforge/instances';
import PullToRefresh from '@/components/voltforge/PullToRefresh';

export default function SaveView({ projName, setProjName, projId, setProjId, bump, setSimOn, setSimSnap, setVer, setView, setSelected }) {
  const [savedList, setSavedList] = useState(() => STORE.list());
  const [saveMsg, setSaveMsg] = useState(null);
  const fileRef = useRef(null);

  const flashMsg = useCallback((text, ok = true) => {
    setSaveMsg({ text, ok });
    setTimeout(() => setSaveMsg(null), 2500);
  }, []);

  const doSave = useCallback(() => {
    const r = STORE.save(G, { pid: projId, name: projName });
    if (r.ok) { setSavedList(STORE.list()); flashMsg(`💾 "${projName}" saved`); }
    else flashMsg(`✗ ${r.err}`, false);
  }, [projId, projName, flashMsg]);

  const doLoad = useCallback((pid) => {
    const { ok, data, err } = STORE.load(pid);
    if (!ok) { flashMsg(`✗ ${err}`, false); return; }
    STORE.unpack(data, G);
    setProjId(data.pid);
    setProjName(data.name);
    HIST.clear();
    SIM.stop(); setSimOn(false); setSimSnap(null);
    setVer(v => v + 1);
    flashMsg(`📂 "${data.name}" loaded`);
  }, [flashMsg, setProjId, setProjName, setSimOn, setSimSnap, setVer]);

  const doDelete = useCallback((pid, name) => {
    STORE.delete(pid);
    setSavedList(STORE.list());
    flashMsg(`🗑 "${name}" deleted`);
  }, [flashMsg]);

  const doNew = useCallback(() => {
    [...G.components.keys()].forEach(id => G.removeComponent(id));
    const newId = uid('p');
    setProjId(newId);
    setProjName('Untitled');
    HIST.clear();
    SIM.stop(); setSimOn(false); setSimSnap(null);
    setVer(v => v + 1);
    if (setSelected) setSelected(null);
    if (setView) setView('canvas');
    flashMsg('✦ New file created');
  }, [setProjId, setProjName, setSimOn, setSimSnap, setVer, setView, setSelected, flashMsg]);

  const doExport = useCallback(() => {
    STORE.export(G, { pid: projId, name: projName });
    flashMsg('⬇ Exported');
  }, [projId, projName, flashMsg]);

  const doImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        STORE.unpack(data, G);
        setProjId(data.pid || uid('p'));
        setProjName((data.name || 'Imported') + ' (imported)');
        HIST.clear();
        SIM.stop(); setSimOn(false); setSimSnap(null);
        setVer(v => v + 1);
        flashMsg(`📥 "${data.name}" imported`);
      } catch (err) { flashMsg(`✗ ${err.message}`, false); }
    };
    reader.readAsText(file);
  }, [flashMsg, setProjId, setProjName, setSimOn, setSimSnap, setVer]);

  const fmtDate = ts => {
    const d = new Date(ts), now = Date.now(), diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <PullToRefresh
      onRefresh={async () => {
        setSavedList(STORE.list());
      }}
      refreshKey={savedList.length}
    >
      <div style={{ width:'100%', height:'100%', padding:'14px 14px 20px', display:'flex', flexDirection:'column', gap:10 }}>

      <div style={{ fontSize:9, color:T.sub, letterSpacing:'.12em', fontWeight:600 }}>PROJECTS</div>

      {saveMsg && (
        <div style={{ padding:'8px 12px', borderRadius:8, fontSize:10,
                      background: saveMsg.ok ? `${T.green}14` : `${T.red}14`,
                      border: `1px solid ${saveMsg.ok ? T.green : T.red}44`,
                      color: saveMsg.ok ? T.green : T.red }}>
          {saveMsg.text}
        </div>
      )}

      <div style={{ padding:'12px', borderRadius:10, background:T.card, border:`1px solid ${T.b1}` }}>
        <div style={{ fontSize:9, color:T.sub, marginBottom:8 }}>PROJECT NAME</div>
        <input value={projName} onChange={e => setProjName(e.target.value)}
          style={{ width:'100%', padding:'8px 12px', borderRadius:8,
                   border:`1px solid ${T.b2}`, background:T.bg, color:T.text,
                   fontSize:11, outline:'none', fontFamily:'JetBrains Mono, monospace',
                   marginBottom:10 }}/>
        <button onClick={doNew}
          style={{ width:'100%', padding:'10px', borderRadius:9, marginBottom:8,
                   border:`1px solid ${T.red}44`, background:`${T.red}0a`,
                   color:T.red, fontSize:10, fontWeight:700 }}>
          ✕ Close File
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={doSave}
            style={{ flex:1, padding:'10px', borderRadius:9, border:'none',
                     background:'linear-gradient(135deg,#00d4ff,#39ff7a)',
                     color:'#000', fontWeight:700, fontSize:10 }}>
            💾 Save
          </button>
          <button onClick={doExport}
            style={{ flex:1, padding:'10px', borderRadius:9,
                     border:`1px solid ${T.blue}44`, background:`${T.blue}0a`,
                     color:T.blue, fontSize:10 }}>
            ⬇ Export
          </button>
          <button onClick={() => fileRef.current?.click()}
            style={{ flex:1, padding:'10px', borderRadius:9,
                     border:`1px solid ${T.purple}44`, background:`${T.purple}0a`,
                     color:T.purple, fontSize:10 }}>
            📥 Import
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={doImport}
            style={{ display:'none' }}/>
        </div>
      </div>

      {savedList.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          <div style={{ fontSize:9, color:T.sub, fontWeight:600 }}>SAVED PROJECTS</div>
          {savedList.map(p => (
            <div key={p.pid} style={{ padding:'10px 12px', borderRadius:10, background:T.card,
                                      border:`1px solid ${T.b1}`, display:'flex',
                                      alignItems:'center', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:T.text }}>{p.name}</div>
                <div style={{ fontSize:8, color:T.dim, marginTop:2 }}>
                  {p.stats?.c ?? 0} comp · {p.stats?.w ?? 0} wire · {fmtDate(p.saved)}
                </div>
              </div>
              <button onClick={() => doLoad(p.pid)}
                style={{ padding:'5px 10px', borderRadius:7, fontSize:9,
                         border:`1px solid ${T.blue}44`, background:`${T.blue}0a`, color:T.blue }}>
                Load
              </button>
              <button onClick={() => doDelete(p.pid, p.name)}
                style={{ padding:'5px 8px', borderRadius:7, fontSize:9,
                         border:`1px solid ${T.red}44`, background:`${T.red}0a`, color:T.red }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </PullToRefresh>
  );
}