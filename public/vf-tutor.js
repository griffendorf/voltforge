/* VoltForge Tutor Mode (Stage A). Open with ?learn=<script> or ?learn= for the picker. */
(function () {
  var qs = new URLSearchParams(location.search);
  if (!qs.has("learn")) return;
  var NAME = qs.get("learn") || "";
  var TITLES = { "led-circuit": "💡 LED circuit", "rc-filter": "🔋 RC charging", "555-blinker": "⏱ 555 blinker", "555-oneshot": "⏱ 555 one-shot" };
  var ORDER = ["led-circuit", "rc-filter", "555-blinker", "555-oneshot"];
  var UNIT = { _ohms: "Ω", _farads: "F", _voltage: "V", _fwdV: "V", _rating: "A" };
  var vf, steps = [], idx = 0, assign = {}, passedAt = 0, root, lastHtml = "", mini = false, done = false, voiceOn = true;
  try { voiceOn = localStorage.getItem("vf_tutor_voice") !== "0"; } catch (e) {}

  function waitVf(cb) {
    var n = 0, t = setInterval(function () {
      if (window.__vf && window.__vf.G && window.__vf.scripts) { clearInterval(t); cb(window.__vf); }
      else if (++n > 200) { clearInterval(t); console.warn("[tutor] window.__vf not found"); }
    }, 200);
  }
  function say(text) {
    if (!voiceOn || !text) return;
    try { var s = window.speechSynthesis; if (!s) return; s.cancel();
      var u = new SpeechSynthesisUtterance(String(text).slice(0, 600)); u.lang = "en-US"; u.rate = 1; s.speak(u); } catch (e) {}
  }
  function hush() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }
  function fmt(v, unit) {
    var P = [[1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
    for (var i = 0; i < P.length; i++) if (Math.abs(v) >= P[i][0] * 0.999) return +(v / P[i][0]).toPrecision(3) + P[i][1] + unit;
    return v + unit;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function kind(s) {
    if (s.components && s.components.length) return "parts";
    if (s.wires && s.wires.length) return "wires";
    if (s.sim) return "sim";
    if (s.press) return "press";
    if (s.zoom !== undefined && !s.say) return "view";
    return "info";
  }
  function valueOk(c, props) {
    for (var k in props || {}) {
      if (k.charAt(0) !== "_") continue;
      var v = Number(props[k]); if (!isFinite(v)) continue;
      var cv = Number(c[k]); if (!isFinite(cv) || Math.abs(cv - v) > Math.abs(v) * 0.05 + 1e-15) return false;
    }
    return true;
  }
  function comp(label) { var id = assign[label]; return id ? vf.G.components.get(id) || null : null; }
  function term(c, key) {
    if (!c) return null;
    for (var i = 0; i < c.termIds.length; i++) { var t = vf.G.terminals.get(c.termIds[i]); if (t && t.key === key) return t; }
    return null;
  }
  function split(ref) { var i = String(ref).lastIndexOf("."); return [ref.slice(0, i), ref.slice(i + 1)]; }

  function checkParts(s) {
    return s.components.map(function (spec) {
      var c = comp(spec.label);
      if (!c || c.type !== spec.type) {
        var used = {}; for (var l in assign) if (l !== spec.label) used[assign[l]] = 1;
        var best = null;
        vf.G.components.forEach(function (x) {
          if (x.type !== spec.type || used[x.id]) return;
          if (!best || (valueOk(x, spec.props) && !valueOk(best, spec.props))) best = x;
        });
        c = best;
        if (c) assign[spec.label] = c.id; else delete assign[spec.label];
      }
      return { spec: spec, c: c, ok: !!c && valueOk(c, spec.props) };
    });
  }
  function checkWires(s) {
    return s.wires.map(function (w) {
      var a = split(w.from), b = split(w.to), ca = comp(a[0]), cb = comp(b[0]);
      var ta = term(ca, a[1]), tb = term(cb, b[1]);
      return { w: w, na: (ca ? ca.label : a[0]) + "." + a[1], nb: (cb ? cb.label : b[0]) + "." + b[1],
        ok: !!(ta && tb && ta.nodeId && ta.nodeId === tb.nodeId), missing: !ca || !cb };
    });
  }
  function status(s) {
    var k = kind(s);
    if (k === "parts") { var r = checkParts(s); return { k: k, items: r, ok: r.every(function (x) { return x.ok; }) }; }
    if (k === "wires") { var w = checkWires(s); return { k: k, items: w, ok: w.every(function (x) { return x.ok; }) }; }
    if (k === "sim") return { k: k, ok: !!(vf.sim && vf.sim._running) };
    return { k: k, ok: false };
  }
  function view(s) {
    if (s.zoom === undefined) return;
    try { vf.setZoom && vf.setZoom(s.zoom);
      if (s.centerOn && vf.setPan) vf.setPan({ x: innerWidth / 2 - s.centerOn.x * s.zoom, y: innerHeight * 0.42 - s.centerOn.y * s.zoom }); } catch (e) {}
  }
  function bump() { try { vf.bump && vf.bump(); } catch (e) {} }

  function doIt() {
    var s = steps[idx]; if (!s) return; var k = kind(s);
    if (k === "parts") {
      checkParts(s).forEach(function (r) {
        if (r.ok) return;
        if (r.c) { for (var p in r.spec.props || {}) if (p.charAt(0) === "_") r.c[p] = r.spec.props[p]; return; }
        var m = new Map(); vf.place([r.spec], { offset: false, placed: m });
        var c = m.get(r.spec.label || r.spec.type); if (c) assign[r.spec.label] = c.id;
      });
    } else if (k === "wires") {
      var placed = new Map(); for (var l in assign) { var c = comp(l); if (c) placed.set(l, c); }
      var todo = checkWires(s).filter(function (x) { return !x.ok && !x.missing; }).map(function (x) { return x.w; });
      if (todo.length) { var res = vf.wire(todo, placed); if (res && res.failed) console.warn("[tutor] wires failed:", res.failed); }
    } else if (k === "sim") {
      try { vf.sim.start(); vf.setSimOn && vf.setSimOn(true); } catch (e) {}
    } else if (k === "press") {
      var b = comp(s.press); if (b) { b._closed = true; bump(); setTimeout(function () { b._closed = false; bump(); }, 300); }
    }
    bump(); lastHtml = ""; tick();
  }
  function enter(i) {
    idx = i; passedAt = 0; lastHtml = "";
    if (idx >= steps.length) { done = true; hush(); say("Nice work. Circuit complete."); render(); return; }
    var s = steps[idx]; view(s);
    if (kind(s) === "view") { enter(idx + 1); return; }
    say(s.say || s.caption); tick();
  }
  function hint(k) {
    if (k === "parts") return "Open PARTS, tap a part, then tap the canvas. To change a value, select the part and edit it in INFO.";
    if (k === "wires") return "Drag from one terminal dot to another. Any route works, as long as the right pins end up connected.";
    if (k === "sim") return "Open SIM and press ▶ RUN.";
    if (k === "press") return "Tap the push button on the canvas, or use Do it for me.";
    return "";
  }
  function render(st) {
    var title = TITLES[NAME] || NAME, h;
    var head = '<div data-drag style="display:flex;align-items:center;gap:4px;margin-bottom:' + (mini ? 0 : 8) + 'px;cursor:grab;touch-action:none;user-select:none">' +
      '<span style="color:#5a7a90;font-size:14px">⠿</span><b style="flex:1;font-size:11px;color:#00d4ff;line-height:1.3">' + (mini ? "" : "LEARN · " + esc(title)) + (done ? "" : (mini ? "" : "<br>") + (idx + 1) + "/" + steps.length) + "</b>" +
      '<button data-a="voice" style="' + B(0) + '">' + (voiceOn ? "🔊" : "🔇") + "</button>" +
      '<button data-a="mini" style="' + B(0) + '">' + (mini ? "▴" : "▾") + "</button>" +
      '<button data-a="exit" style="' + B(0) + '">✕</button></div>';
    if (done) {
      var nx = ORDER[ORDER.indexOf(NAME) + 1];
      h = head + (mini ? "" : '<div style="font-size:16px;font-weight:700;margin:4px 0 10px">🎉 Circuit complete!</div>' + capMeter() +
        '<div style="display:flex;gap:8px">' + (nx && vf.scripts[nx] ? '<button data-a="go:' + nx + '" style="' + B(1) + '">Next: ' + esc(TITLES[nx] || nx) + "</button>" : "") +
        '<button data-a="pick" style="' + B(0) + '">All tutorials</button></div>');
    } else if (!steps.length) {
      h = head + '<div style="font-size:13px;margin-bottom:8px">Pick a tutorial:</div><div style="display:flex;flex-wrap:wrap;gap:6px">' +
        ORDER.filter(function (n) { return vf.scripts[n]; }).map(function (n) { return '<button data-a="go:' + n + '" style="' + B(1) + '">' + esc(TITLES[n]) + "</button>"; }).join("") + "</div>";
    } else {
      var s = steps[idx], k = st.k, list = "";
      if (k === "parts") list = st.items.map(function (r) {
        var v = ""; for (var p in r.spec.props || {}) if (UNIT[p]) v += " " + fmt(Number(r.spec.props[p]), UNIT[p]);
        var why = r.ok ? "" : r.c ? " — change value" : "";
        return "<div>" + (r.ok ? "✅" : "⬜") + " " + esc(r.spec.type) + esc(v) + '<span style="color:#ffb347">' + why + "</span></div>";
      }).join("");
      if (k === "wires") list = '<div style="color:#9ab8c8;margin-bottom:2px">' + st.items.filter(function (x) { return x.ok; }).length + "/" + st.items.length + " connections</div>" +
        st.items.map(function (x) { return "<div>" + (x.ok ? "✅" : "⬜") + " " + esc(x.na) + " → " + esc(x.nb) + "</div>"; }).join("");
      var act = k === "info" || k === "press" ? '<button data-a="next" style="' + B(1) + '">Continue →</button>' : "";
      h = head + (mini ? "" :
        '<div style="font-size:15px;font-weight:700;margin-bottom:6px">' + (st.ok ? "✅ " : "") + esc(s.caption || "") + "</div>" +
        (s.say && s.say !== s.caption ? '<div style="font-size:12px;color:#9ab8c8;line-height:1.5;margin-bottom:6px">' + esc(s.say) + "</div>" : "") +
        (list ? '<div style="font-size:12px;line-height:1.7;max-height:120px;overflow:auto;margin-bottom:8px">' + list + "</div>" : "") + capMeter() +
        '<div data-hint style="display:none;font-size:12px;color:#ffd166;margin-bottom:8px">' + esc(hint(k)) + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + act +
        (k !== "info" ? '<button data-a="hint" style="' + B(0) + '">Hint</button><button data-a="doit" style="' + B(0) + '">Do it for me</button>' : "") +
        (idx > 0 ? '<button data-a="back" style="' + B(0) + '">←</button>' : "") + "</div>");
    }
    if (h !== lastHtml) { root.innerHTML = h; lastHtml = h; }
  }
  function capMeter() {
    if (!(vf.sim && vf.sim._running)) return "";
    var out = "", Vs = (vf.sim.snap && vf.sim.snap.Vs) || 0;
    vf.G.components.forEach(function (c) {
      if (c.type !== "capacitor") return;
      var vt = c._Vt || Vs, vc = Math.abs(c._Vc || 0); if (!vt) return;
      var p = Math.max(0, Math.min(1, vc / vt));
      out += '<div style="font-size:11px;margin:2px 0">⚡ ' + esc(c.label) + " " + vc.toFixed(2) + "V / " + vt.toFixed(1) + "V · " + Math.round(p * 100) + "%" +
        (c._tau ? " · τ " + fmt(c._tau, "s") : "") + '</div><div style="height:8px;border-radius:4px;background:#1c2a3a;overflow:hidden;margin-bottom:6px">' +
        '<div style="height:100%;width:' + (p * 100).toFixed(1) + '%;background:linear-gradient(90deg,#a855f7,#00d4ff)"></div></div>';
    });
    return out ? '<div style="margin:6px 0">' + out + "</div>" : "";
  }
  function place(x, y) {
    var w = root.offsetWidth || 210, h = root.offsetHeight || 60;
    x = Math.max(4, Math.min(innerWidth - w - 4, x)); y = Math.max(4, Math.min(innerHeight - h - 4, y));
    root.style.left = x + "px"; root.style.top = y + "px"; root.style.right = "auto";
  }
  function B(primary) {
    return "padding:6px 10px;border-radius:999px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation;" +
      (primary ? "border:none;background:linear-gradient(135deg,#00d4ff,#39ff7a);color:#000" : "border:1px solid #2a3245;background:transparent;color:#e6e9ef");
  }
  function tick() {
    if (done) return render();
    if (!steps.length) return render();
    var s = steps[idx], st = status(s);
    if (st.ok && (st.k === "parts" || st.k === "wires" || st.k === "sim")) {
      if (!passedAt) passedAt = Date.now();
      else if (Date.now() - passedAt > 900) { enter(idx + 1); return; }
    } else passedAt = 0;
    render(st);
  }
  function act(a) {
    if (a === "exit") { hush(); location.href = location.origin + "/"; return; }
    if (a === "pick") { location.search = "?learn="; return; }
    if (a.indexOf("go:") === 0) { location.search = "?learn=" + a.slice(3); return; }
    if (a === "mini") { mini = !mini; lastHtml = ""; return tick(); }
    if (a === "voice") { voiceOn = !voiceOn; try { localStorage.setItem("vf_tutor_voice", voiceOn ? "1" : "0"); } catch (e) {} if (!voiceOn) hush(); lastHtml = ""; return tick(); }
    if (a === "hint") { var e = root.querySelector("[data-hint]"); if (e) e.style.display = "block"; return; }
    if (a === "doit") return doIt();
    if (a === "next") return enter(idx + 1);
    if (a === "back") return enter(Math.max(0, idx - 1));
  }
  function start(v) {
    vf = v;
    root = document.createElement("div");
    root.id = "vf-tutor";
    root.style.cssText = "position:fixed;right:8px;top:90px;width:min(210px,46vw);max-height:62vh;overflow:auto;" +
      "z-index:9997;padding:10px;border-radius:14px;background:rgba(8,12,20,.92);border:1px solid #00d4ff55;box-shadow:0 4px 24px rgba(0,0,0,.5);" +
      "color:#e8f2ff;font-family:system-ui,sans-serif;font-size:13px";
    try { var sp = JSON.parse(localStorage.getItem("vf_tutor_pos") || "null"); if (sp) place(sp.x, sp.y); } catch (e) {}
    var drag = null;
    root.addEventListener("pointerdown", function (e) {
      if (!e.target.closest("[data-drag]") || e.target.closest("button")) return;
      var r = root.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      try { root.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault();
    });
    root.addEventListener("pointermove", function (e) { if (drag) place(e.clientX - drag.dx, e.clientY - drag.dy); });
    function endDrag() { if (!drag) return; drag = null; var r = root.getBoundingClientRect();
      try { localStorage.setItem("vf_tutor_pos", JSON.stringify({ x: r.left, y: r.top })); } catch (e) {} }
    root.addEventListener("pointerup", endDrag); root.addEventListener("pointercancel", endDrag);
    root.addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (b) act(b.getAttribute("data-a")); });
    document.body.appendChild(root);
    var script = vf.scripts[NAME];
    if (script) {
      steps = script.filter(function (s) { return !/voltforgeai\.com/i.test(s.caption || ""); });
      try { vf.setView && vf.setView("canvas"); } catch (e) {}
      if (vf.G.components.size && confirm("Start this tutorial on a clean canvas? Anything unsaved on the canvas will be cleared.")) {
        try { vf.G.clearAll(); } catch (e) {} bump();
      }
      enter(0);
    } else render();
    setInterval(tick, 250);
  }
  waitVf(start);
})();
