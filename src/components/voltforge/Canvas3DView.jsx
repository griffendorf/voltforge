import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DEFS } from '@/lib/voltforge/definitions';
import { CW, CH } from '@/lib/voltforge/theme';
import { G } from '@/lib/voltforge/instances';

const S = 0.02;
const toW = (px) => px * S;

function buildResistor() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.9, 32),
    new THREE.MeshStandardMaterial({ color: 0xd9c9a3, roughness: 0.55, metalness: 0.05 })
  );
  body.rotation.z = Math.PI / 2; body.castShadow = true; g.add(body);
  const bandColors = [0x5a3a1a, 0x111111, 0xc02020, 0xc9a227];
  const bandX = [-0.30, -0.16, -0.02, 0.30];
  bandColors.forEach((c, i) => {
    const b = new THREE.Mesh(
      new THREE.CylinderGeometry(0.185, 0.185, 0.07, 32),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: i === 3 ? 0.7 : 0.1 })
    );
    b.rotation.z = Math.PI / 2; b.position.x = bandX[i]; g.add(b);
  });
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.25, metalness: 0.9 });
  [-1, 1].forEach((dir) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 16), leadMat);
    l.rotation.z = Math.PI / 2; l.position.x = dir * 0.72; g.add(l);
  });
  return g;
}


function buildBattery() {
  const g = new THREE.Group();
  // Cylindrical cell, vertical (terminals top/bottom)
  const can = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 1.1, 32),
    new THREE.MeshStandardMaterial({ color: 0x1b6f3a, roughness: 0.5, metalness: 0.3 })
  );
  can.castShadow = true; g.add(can);
  // Label band
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.305, 0.305, 0.35, 32),
    new THREE.MeshStandardMaterial({ color: 0xeeddaa, roughness: 0.6, metalness: 0.1 })
  );
  g.add(band);
  // + nub on top
  const nub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.25, metalness: 0.9 })
  );
  nub.position.y = 0.6; g.add(nub);
  return g;
}

function buildLED() {
  const g = new THREE.Group();
  // Dome (translucent colored)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x39ff7a, roughness: 0.15, metalness: 0.0,
      transparent: true, opacity: 0.85, emissive: 0x0a3318 })
  );
  dome.position.y = 0.18; dome.castShadow = true; g.add(dome);
  // Base cylinder
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.18, 24),
    new THREE.MeshStandardMaterial({ color: 0x2a8a4a, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.85 })
  );
  base.position.y = 0.09; g.add(base);
  // Rim
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: 0x39ff7a, roughness: 0.4, metalness: 0.1 })
  );
  g.add(rim);
  // Two leads (different lengths: anode longer)
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.25, metalness: 0.9 });
  [[-0.12, 0.5], [0.12, 0.36]].forEach(([x, len]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 12), leadMat);
    l.position.set(x, -len / 2, 0); g.add(l);
  });
  return g;
}

function buildCapacitor() {
  const g = new THREE.Group();
  // Electrolytic can, lying horizontal
  const can = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.7, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a2a55, roughness: 0.35, metalness: 0.55 })
  );
  can.rotation.x = Math.PI / 2; can.castShadow = true; g.add(can);
  // Top cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.285, 0.285, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0x0c1530, roughness: 0.4, metalness: 0.6 })
  );
  cap.rotation.x = Math.PI / 2; cap.position.z = 0.36; g.add(cap);
  // Stripe (negative marking)
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.5, 0.01),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 })
  );
  stripe.position.set(0, 0, 0.281); g.add(stripe);
  // Leads
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.25, metalness: 0.9 });
  [-0.1, 0.1].forEach((x) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12), leadMat);
    l.position.set(x, -0.45, 0); g.add(l);
  });
  return g;
}

function buildDiode() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.7, 32),
    new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.45, metalness: 0.2 })
  );
  body.rotation.z = Math.PI / 2; body.castShadow = true; g.add(body);
  // Cathode stripe
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.165, 0.165, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 })
  );
  stripe.rotation.z = Math.PI / 2; stripe.position.x = 0.22; g.add(stripe);
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.25, metalness: 0.9 });
  [-1, 1].forEach((d) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 16), leadMat);
    l.rotation.z = Math.PI / 2; l.position.x = d * 0.62; g.add(l);
  });
  return g;
}

const BUILDERS = { resistor: buildResistor, battery: buildBattery, led: buildLED, capacitor: buildCapacitor, diode: buildDiode };

function buildGeneric(type) {
  const def = DEFS[type] || {};
  const colHex = (def.color || '#7fd4ff').replace('#', '0x');
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.5, 0.6),
    new THREE.MeshStandardMaterial({ color: parseInt(colHex, 16) || 0x7fd4ff, roughness: 0.5, metalness: 0.2 })
  );
  box.castShadow = true; g.add(box);
  return g;
}

export default function Canvas3DView({ comps = [], wires = [], snap }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth || 360, h = mount.clientHeight || 480;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040709);
    const aspect = w / h, d = 6;
    const cam = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    cam.position.set(8, 8, 8); cam.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const fill = new THREE.DirectionalLight(0x00d4ff, 0.3); fill.position.set(-6, 4, -4); scene.add(fill);
    const grid = new THREE.GridHelper(20, 28, 0x0f2034, 0x0b1828); grid.position.y = -0.4; scene.add(grid);
    const world = new THREE.Group(); scene.add(world);
    stateRef.current = { scene, cam, renderer, world, mount, d };
    let raf;
    const loop = () => { renderer.render(scene, cam); raf = requestAnimationFrame(loop); };
    loop();
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight, a = nw / nh;
      cam.left = -d * a; cam.right = d * a; cam.top = d; cam.bottom = -d;
      cam.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const st = stateRef.current; if (!st) return;
    const { world } = st;
    while (world.children.length) world.remove(world.children[0]);
    if (!comps.length) return;
    const cx = comps.reduce((a, c) => a + c.x + CW / 2, 0) / comps.length;
    const cy = comps.reduce((a, c) => a + c.y + CH / 2, 0) / comps.length;
    comps.forEach((c) => {
      const mesh = (BUILDERS[c.type] || (() => buildGeneric(c.type)))();
      mesh.position.set(toW(c.x + CW / 2 - cx), 0, toW(c.y + CH / 2 - cy));
      world.add(mesh);
    });
    wires.forEach((wr) => {
      const ta = G.terminals.get(wr.from), tb = G.terminals.get(wr.to);
      if (!ta || !tb) return;
      const p1 = new THREE.Vector3(toW(ta.wx - cx), 0.05, toW(ta.wy - cy));
      const p2 = new THREE.Vector3(toW(tb.wx - cx), 0.05, toW(tb.wy - cy));
      const path = new THREE.CatmullRomCurve3([p1, p2]);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(path, 2, 0.02, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x39ff7a, roughness: 0.4, metalness: 0.3 })
      );
      world.add(tube);
    });
  }, [comps, wires, snap]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {comps.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#486880' }}>
          <div style={{ fontSize: 52, opacity: 0.12 }}>⬡</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Add components to see them in 3D</div>
        </div>
      )}
    </div>
  );
}
