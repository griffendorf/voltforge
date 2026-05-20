import { useState, useRef, useEffect, useCallback } from 'react';
import { T } from '@/lib/voltforge/theme';
import { G } from '@/lib/voltforge/instances';
import { buildAIContext } from '@/lib/voltforge/ai-context';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/voltforge/PullToRefresh';

const mdRender = text =>
  text.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
      .replace(/\*(.*?)\*/g,'<i>$1</i>')
      .replace(/`([^`]+)`/g,'<code style="background:rgba(0,212,255,.12);padding:0 3px;border-radius:3px">$1</code>')
      .replace(/\n/g,'<br/>');

export default function AIView({ snap, setAiHL, setView }) {
  const [msgs, setMsgs] = useState([{
    role:'assistant',
    content:"👋 I'm **Volt·AI**! Build a circuit, run the sim, then ask me anything — I can see your live graph and measurements.",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [msgs, loading]);

  const sendAI = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setMsgs(m => [...m, { role:'user', content:text }]);
    setLoading(true);

    const context = buildAIContext(G, snap);
    const compIds = [...G.components.values()].map(c => `${c.id}=${c.label}`).join(', ');

    const prompt = `You are Volt·AI, an expert electrical circuit assistant inside VoltForge.
You can see the user's live circuit data. Be concise (mobile screen). Use **bold** for component names.
Optionally append ONE highlight block: <hl>{"compIds":["id1","id2"],"type":"info"}</hl>
type can be: info | warning | error | success

Component IDs available: ${compIds || 'none yet'}

LIVE CIRCUIT DATA:
${context}

USER QUESTION: ${text}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gemini_3_flash',
      });
      
      const raw = typeof response === 'string' ? response : JSON.stringify(response);

      const hlMatch = raw.match(/<hl>([\s\S]*?)<\/hl>/);
      let hl = null;
      try { if (hlMatch) hl = JSON.parse(hlMatch[1]); } catch {}

      const clean = raw.replace(/<hl>[\s\S]*?<\/hl>/g, '').trim();
      setMsgs(m => [...m, { role:'assistant', content:clean, hl }]);

      if (hl?.compIds?.length) {
        setAiHL({ compIds: hl.compIds, type: hl.type || 'info' });
        setTimeout(() => setAiHL({ compIds:[], type:'info' }), 7000);
      }
    } catch {
      const fb = snap?.status === 'running'
        ? `Circuit is active: ${snap.Vs?.toFixed(1)}V, ${(snap.I*1000)?.toFixed(1)}mA.`
        : 'No simulation running — press ▶ RUN first.';
      setMsgs(m => [...m, { role:'assistant', content:`_(offline)_ ${fb}` }]);
    }
    setLoading(false);
  }, [loading, snap, setAiHL]);

  return (
    <div style={{ width:'100%', height:'100%', display:'flex',
                  flexDirection:'column', overflow:'hidden' }}>
    <PullToRefresh
      onRefresh={async () => {
        // Refresh chat context
      }}
      refreshKey={msgs.length}
    >
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 8px',
                    display:'flex', flexDirection:'column', gap:10 }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column',
                                alignItems: msg.role==='user' ? 'flex-end' : 'flex-start',
                                animation:'popIn .2s ease' }}>
            {msg.role === 'assistant' && (
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                              background:'linear-gradient(135deg,#00d4ff,#a855f7)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:10 }}>✦</div>
                <span style={{ fontSize:8, color:T.dim }}>VOLT·AI</span>
              </div>
            )}
            <div style={{
              maxWidth:'88%', padding:'9px 12px', wordBreak:'break-word',
              borderRadius: msg.role==='user' ? '13px 13px 4px 13px' : '4px 13px 13px 13px',
              background: msg.role==='user' ? 'rgba(168,85,247,.13)' : T.card,
              border:`1px solid ${msg.role==='user' ? 'rgba(168,85,247,.3)' : T.b1}`,
              fontSize:13, lineHeight:1.55, color: msg.role==='user' ? T.purple : T.text,
            }} dangerouslySetInnerHTML={{ __html: mdRender(msg.content) }}/>
            {msg.hl?.compIds?.length > 0 && (
              <button
                onClick={() => {
                  setAiHL({ compIds: msg.hl.compIds, type: msg.hl.type||'info' });
                  setView('canvas');
                  setTimeout(() => setAiHL({ compIds:[], type:'info' }), 7000);
                }}
                style={{ marginTop:5, padding:'3px 10px', borderRadius:10, cursor:'pointer',
                         border:`1px solid ${T.blue}44`, background:`${T.blue}0a`,
                         color:T.blue, fontSize:9, alignSelf:'flex-start' }}>
                ✦ Show on canvas
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                            background:'linear-gradient(135deg,#00d4ff,#a855f7)',
                            animation:'pulse 0.7s ease-in-out infinite',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10 }}>✦</div>
              <span style={{ fontSize:8, color:T.dim }}>thinking…</span>
            </div>
            <div style={{ padding:'9px 14px', borderRadius:'4px 13px 13px 13px',
                          background:T.card, border:`1px solid ${T.b1}`,
                          display:'flex', gap:5, alignItems:'center' }}>
              <div style={{ width:4, height:4, borderRadius:'50%', background:T.blue,
                            animation:'pulse .6s ease-in-out infinite' }}/>
              <div style={{ width:4, height:4, borderRadius:'50%', background:T.cyan,
                            animation:'pulse .6s ease-in-out .15s infinite' }}/>
              <div style={{ width:4, height:4, borderRadius:'50%', background:T.purple,
                            animation:'pulse .6s ease-in-out .3s infinite' }}/>
            </div>
          </div>
        )}
        <div ref={chatEndRef}/>
      </div>

      <div style={{ flexShrink:0, padding:'8px 10px', background:T.panel,
                    borderTop:`1px solid ${T.b1}`, display:'flex', gap:8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendAI(input); }}
          placeholder="Ask about your circuit…"
          style={{ flex:1, padding:'10px 14px', borderRadius:10,
                   border:`1px solid ${T.b2}`, background:T.card, color:T.text,
                   fontSize:12, outline:'none', fontFamily:'JetBrains Mono, monospace' }}/>
        <button onClick={() => sendAI(input)}
          disabled={loading || !input.trim()}
          style={{ padding:'0 18px', borderRadius:10, border:'none',
                   background: loading || !input.trim()
                     ? T.dim : 'linear-gradient(135deg,#00d4ff,#a855f7)',
                   color: loading || !input.trim() ? T.sub : '#000',
                   fontWeight:700, fontSize:11, cursor: loading ? 'wait' : 'pointer' }}>
          ✦
        </button>
      </div>
    </PullToRefresh>
    </div>
  );
}