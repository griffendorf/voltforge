export function buildAIContext(graph, simSnap) {
  const comps = [...graph.components.values()];
  const compLines = comps.map(c => {
    const terms = c.termIds.map(tid => graph.terminals.get(tid)).filter(Boolean);
    const conns = terms.flatMap(t =>
      [...t.wireIds].map(wid => {
        const w = graph.wires.get(wid);
        if (!w) return null;
        const ox = w.from === t.id ? w.to : w.from;
        const ot = graph.terminals.get(ox);
        const oc = ot ? graph.components.get(ot.compId) : null;
        return oc ? `${oc.label}(${ot.label})` : null;
      }).filter(Boolean)
    );
    return `• ${c.label} [${c.type}]: ${conns.join(', ') || 'unconnected'}`;
  }).join('\n');

  const issues = (simSnap?.issues || [])
    .map(i => `  [${i.severity.toUpperCase()}] ${i.msg}`).join('\n');

  const simLine = simSnap?.status === 'running'
    ? `ACTIVE — ${simSnap.Vs?.toFixed(2)}V  ${(simSnap.I * 1000)?.toFixed(1)}mA  ${(simSnap.P * 1000)?.toFixed(0)}mW`
    : (simSnap?.status || 'off').toUpperCase();

  return `CIRCUIT (${comps.length} components, ${graph.wires.size} wires):\n${compLines}\n\nSIMULATION: ${simLine}\n\nVALIDATION:\n${issues || '  No issues ✓'}`;
}