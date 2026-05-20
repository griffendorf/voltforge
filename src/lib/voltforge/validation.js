import { DEFS } from './definitions';

export function validateGraph(graph) {
  const issues = [];
  const comps  = [...graph.components.values()];
  const wires  = [...graph.wires.values()];

  if (!comps.length) return issues;

  const sources = comps.filter(c => DEFS[c.type]?.terms.some(t => t.pol === 'source'));
  const loads   = comps.filter(c => ['led','motor','resistor','capacitor'].includes(c.type));

  if (!sources.length) {
    issues.push({ id:'NO_SOURCE', severity:'error',
      msg:'No power source — add a Battery or Solar panel',
      compIds:[], wireIds:[] });
  }

  comps.forEach(c => {
    const allOpen = c.termIds.every(tid => graph.terminals.get(tid)?.wireIds.size === 0);
    if (allOpen) {
      issues.push({ id:`ISOLATED_${c.id}`, severity:'warning',
        msg:`${c.label} is isolated — connect it to the circuit`,
        compIds:[c.id], wireIds:[] });
    }
  });

  comps.forEach(c => {
    const terms = c.termIds.map(tid => graph.terminals.get(tid)).filter(Boolean);
    const wiredCount = terms.filter(t => t.wireIds.size > 0).length;
    if (wiredCount > 0 && wiredCount < terms.length) {
      const openTerms = terms.filter(t => t.wireIds.size === 0).map(t => t.label);
      issues.push({ id:`DANGLING_${c.id}`, severity:'warning',
        msg:`${c.label} has open terminal${openTerms.length > 1 ? 's' : ''}: ${openTerms.join(', ')}`,
        compIds:[c.id], wireIds:[] });
    }
  });

  const ledComps = comps.filter(c => c.type === 'led');
  ledComps.forEach(led => {
    const visited = new Set();
    const queue   = [led.id];
    let hasResistor = false;
    while (queue.length) {
      const cid = queue.shift();
      if (visited.has(cid)) continue;
      visited.add(cid);
      const comp = graph.components.get(cid);
      if (!comp) continue;
      if (comp.type === 'resistor' && comp.id !== led.id) { hasResistor = true; break; }
      comp.termIds.forEach(tid => {
        const term = graph.terminals.get(tid);
        if (!term) return;
        term.wireIds.forEach(wid => {
          const w = graph.wires.get(wid);
          if (!w) return;
          const otherId = graph.terminals.get(w.from)?.compId === cid
            ? graph.terminals.get(w.to)?.compId
            : graph.terminals.get(w.from)?.compId;
          if (otherId && !visited.has(otherId)) queue.push(otherId);
        });
      });
    }
    if (!hasResistor && led.termIds.some(tid => graph.terminals.get(tid)?.wireIds.size > 0)) {
      issues.push({ id:`LED_NO_R_${led.id}`, severity:'warning',
        msg:`${led.label} has no current-limiting resistor — it may burn out`,
        compIds:[led.id], wireIds:[] });
    }
  });

  if (sources.length && loads.length) {
    const canReach = (startCompId) => {
      const visited = new Set();
      const queue   = [startCompId];
      while (queue.length) {
        const cid = queue.shift();
        if (visited.has(cid)) continue;
        visited.add(cid);
        const comp = graph.components.get(cid);
        if (!comp) continue;
        if (loads.some(l => l.id === cid)) return true;
        comp.termIds.forEach(tid => {
          const term = graph.terminals.get(tid);
          if (!term) return;
          term.wireIds.forEach(wid => {
            const w = graph.wires.get(wid);
            if (!w) return;
            const tA = graph.terminals.get(w.from);
            const tB = graph.terminals.get(w.to);
            const nextCid = tA?.compId === cid ? tB?.compId : tA?.compId;
            if (nextCid && !visited.has(nextCid)) queue.push(nextCid);
          });
        });
      }
      return false;
    };
    const anyPath = sources.some(src => canReach(src.id));
    if (!anyPath && wires.length > 0) {
      issues.push({ id:'OPEN_CIRCUIT', severity:'error',
        msg:'Circuit is open — no complete path from source to load',
        compIds: sources.map(s => s.id), wireIds:[] });
    }
  }

  sources.forEach(src => {
    const posTerms = src.termIds
      .map(tid => graph.terminals.get(tid))
      .filter(t => t?.polarity === 'source');
    const negTerms = src.termIds
      .map(tid => graph.terminals.get(tid))
      .filter(t => t?.polarity === 'sink');
    posTerms.forEach(pos => {
      negTerms.forEach(neg => {
        if (pos.nodeId && pos.nodeId === neg.nodeId) {
          issues.push({ id:`SHORT_${src.id}`, severity:'error',
            msg:`Short circuit on ${src.label} — positive and negative are connected directly`,
            compIds:[src.id], wireIds:[] });
        }
      });
    });
  });

  if (sources.length > 1) {
    const negNodes = sources.map(src => {
      const negTerm = src.termIds
        .map(tid => graph.terminals.get(tid))
        .find(t => t?.polarity === 'sink');
      return negTerm?.nodeId;
    }).filter(Boolean);
    const uniqueNegNodes = new Set(negNodes);
    if (uniqueNegNodes.size > 1) {
      issues.push({ id:'NO_COMMON_GND', severity:'warning',
        msg:`${sources.length} sources have separate grounds — connect negatives together`,
        compIds: sources.map(s => s.id), wireIds:[] });
    }
  }

  return issues;
}