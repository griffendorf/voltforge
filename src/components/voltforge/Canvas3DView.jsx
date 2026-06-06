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


function _axialBody(color, r=0.16, len=0.7) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, len, 32),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 })
  );
  body.rotation.z = Math.PI / 2; body.castShadow = true; g.add(body);
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.25, metalness: 0.9 });
  [-1, 1].forEach((d) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 16), leadMat);
    l.rotation.z = Math.PI / 2; l.position.x = d * 0.62; g.add(l);
  });
  return g;
}
function buildInductor() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.8,16),
    new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:0.7}));
  core.rotation.z=Math.PI/2; g.add(core);
  const wireMat=new THREE.MeshStandardMaterial({color:0xb87333,roughness:0.3,metalness:0.8});
  for(let i=0;i<7;i++){
    const t=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.035,8,20),wireMat);
    t.position.x=-0.36+i*0.12; t.rotation.y=Math.PI/2; g.add(t);
  }
  const leadMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.25,metalness:0.9});
  [-1,1].forEach(d=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.4,16),leadMat);
    l.rotation.z=Math.PI/2;l.position.x=d*0.6;g.add(l);});
  return g;
}
function buildThermistor(){ return _axialBody(0x1a5276,0.18,0.5); }
function buildLDR(){
  const g=new THREE.Group();
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.12,32),
    new THREE.MeshStandardMaterial({color:0xd4a017,roughness:0.4,metalness:0.3}));
  g.add(disc);
  // squiggle pattern on top
  const lineMat=new THREE.MeshStandardMaterial({color:0x222222,roughness:0.6});
  for(let i=-2;i<=2;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.02,0.5),lineMat);
    bar.position.set(i*0.09,0.07,0);g.add(bar);}
  const leadMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.25,metalness:0.9});
  [-0.12,0.12].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.45,12),leadMat);
    l.position.set(x,-0.28,0);g.add(l);});
  return g;
}
function buildZener(){ return _axialBody(0xec407a,0.16,0.65); }
function buildVaristor(){
  const g=new THREE.Group();
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.14,32),
    new THREE.MeshStandardMaterial({color:0x2a4d8a,roughness:0.5,metalness:0.2}));
  disc.rotation.x=Math.PI/2; disc.castShadow=true; g.add(disc);
  const leadMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.25,metalness:0.9});
  [-0.1,0.1].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.5,12),leadMat);
    l.position.set(x,-0.4,0);g.add(l);});
  return g;
}
function buildFuse(){
  const g=new THREE.Group();
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.7,32),
    new THREE.MeshStandardMaterial({color:0xaaccdd,roughness:0.1,metalness:0.1,transparent:true,opacity:0.4}));
  glass.rotation.z=Math.PI/2; g.add(glass);
  const capMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.25,metalness:0.9});
  [-1,1].forEach(d=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.14,32),capMat);
    c.rotation.z=Math.PI/2;c.position.x=d*0.35;g.add(c);
    const l=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.4,16),capMat);
    l.rotation.z=Math.PI/2;l.position.x=d*0.62;g.add(l);});
  const wire=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.6,8),
    new THREE.MeshStandardMaterial({color:0x888888,metalness:0.8}));
  wire.rotation.z=Math.PI/2; g.add(wire);
  return g;
}
function buildBreaker(){
  const g=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.9,0.4),
    new THREE.MeshStandardMaterial({color:0x222831,roughness:0.6}));
  box.castShadow=true; g.add(box);
  const lever=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.3,0.12),
    new THREE.MeshStandardMaterial({color:0xff3a3a,roughness:0.4}));
  lever.position.set(0,0.5,0.1);lever.rotation.x=0.4;g.add(lever);
  return g;
}
function buildSolar(){
  const g=new THREE.Group();
  const panel=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.06,0.8),
    new THREE.MeshStandardMaterial({color:0x0a1a4a,roughness:0.2,metalness:0.4}));
  panel.castShadow=true; g.add(panel);
  const gridMat=new THREE.MeshStandardMaterial({color:0x3a5a9a,roughness:0.3});
  for(let i=-1;i<=1;i++){const ln=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.07,0.8),gridMat);
    ln.position.x=i*0.3;g.add(ln);}
  return g;
}
function buildACSource(){
  const g=new THREE.Group();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.06,16,40),
    new THREE.MeshStandardMaterial({color:0xff9800,roughness:0.4,metalness:0.3}));
  g.add(ring);
  const sine=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.03,12,30,Math.PI),
    new THREE.MeshStandardMaterial({color:0xffcc66,emissive:0x442200}));
  sine.position.x=-0.15;g.add(sine);
  const sine2=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.03,12,30,Math.PI),
    new THREE.MeshStandardMaterial({color:0xffcc66,emissive:0x442200}));
  sine2.position.x=0.15;sine2.rotation.z=Math.PI;g.add(sine2);
  return g;
}


function _to92(color){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.5,32,1,false,0,Math.PI),
    new THREE.MeshStandardMaterial({color,roughness:0.55,metalness:0.1}));
  body.position.y=0.1; body.castShadow=true; g.add(body);
  const flat=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.02),
    new THREE.MeshStandardMaterial({color,roughness:0.55}));
  flat.position.set(0,0.1,0); g.add(flat);
  const leadMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.25,metalness:0.9});
  [-0.18,0,0.18].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.5,12),leadMat);
    l.position.set(x,-0.32,0.05);g.add(l);});
  return g;
}
function buildNPN(){ return _to92(0x222222); }
function buildPNP(){ return _to92(0x2a2a3a); }
function buildMOSFET(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.7,0.25),
    new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.5}));
  body.position.y=0.05; body.castShadow=true; g.add(body);
  const tab=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.25,0.06),
    new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.3,metalness:0.85}));
  tab.position.y=0.45; g.add(tab);
  const hole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.1,16),
    new THREE.MeshStandardMaterial({color:0x000000}));
  hole.rotation.x=Math.PI/2; hole.position.set(0,0.45,0); g.add(hole);
  const leadMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,roughness:0.25,metalness:0.9});
  [-0.18,0,0.18].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.5,12),leadMat);
    l.position.set(x,-0.45,0);g.add(l);});
  return g;
}
function buildMotor(){
  const g=new THREE.Group();
  const can=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.8,32),
    new THREE.MeshStandardMaterial({color:0x9aa3ad,roughness:0.3,metalness:0.7}));
  can.rotation.z=Math.PI/2; can.castShadow=true; g.add(can);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.3,16),
    new THREE.MeshStandardMaterial({color:0xcfd4d8,metalness:0.9,roughness:0.2}));
  shaft.rotation.z=Math.PI/2; shaft.position.x=0.55; g.add(shaft);
  return g;
}
function buildBulb(){
  const g=new THREE.Group();
  const glass=new THREE.Mesh(new THREE.SphereGeometry(0.35,24,24),
    new THREE.MeshStandardMaterial({color:0xffe066,roughness:0.1,transparent:true,opacity:0.5,emissive:0x332200}));
  glass.position.y=0.15; g.add(glass);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.25,24),
    new THREE.MeshStandardMaterial({color:0xb0b0b0,metalness:0.8,roughness:0.3}));
  base.position.y=-0.2; g.add(base);
  return g;
}
function buildBuzzer(){
  const g=new THREE.Group();
  const can=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.4,32),
    new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.6}));
  can.castShadow=true; g.add(can);
  const hole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.42,16),
    new THREE.MeshStandardMaterial({color:0x000000}));
  hole.position.y=0.01; g.add(hole);
  return g;
}
function buildSpeaker(){
  const g=new THREE.Group();
  const frame=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.45,0.25,32),
    new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:0.6,metalness:0.3}));
  frame.rotation.x=Math.PI/2; g.add(frame);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(0.35,0.2,32,1,true),
    new THREE.MeshStandardMaterial({color:0x553311,roughness:0.7,side:THREE.DoubleSide}));
  cone.rotation.x=-Math.PI/2; cone.position.z=0.05; g.add(cone);
  return g;
}
function buildHeater(){
  const g=new THREE.Group();
  const coilMat=new THREE.MeshStandardMaterial({color:0xff5722,emissive:0x551100,roughness:0.5,metalness:0.4});
  for(let i=0;i<6;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(0.18,0.04,8,20),coilMat);
    t.position.x=-0.4+i*0.16;t.rotation.y=Math.PI/2;g.add(t);}
  return g;
}
function _switchBody(closed){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.15,0.4),
    new THREE.MeshStandardMaterial({color:0x222831,roughness:0.6}));
  g.add(base);
  const post=new THREE.MeshStandardMaterial({color:0xcfd4d8,metalness:0.9,roughness:0.2});
  [-0.3,0.3].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.2,12),post);
    p.position.set(x,0.12,0);g.add(p);});
  const lever=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.7,12),post);
  lever.position.set(0,0.2,0); lever.rotation.z=closed?Math.PI/2:Math.PI/3; g.add(lever);
  return g;
}
function buildPushbtn(){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.3,0.6),
    new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:0.6})); g.add(base);
  const btn=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.2,24),
    new THREE.MeshStandardMaterial({color:0xff3a3a,roughness:0.4}));
  btn.position.y=0.22; g.add(btn);
  return g;
}
function buildSPDT(){ return _switchBody(false); }
function buildDPDT(){
  const g=_switchBody(false);
  const g2=_switchBody(false); g2.position.z=0.3; g.position.z=-0.15; 
  const wrap=new THREE.Group(); wrap.add(g); wrap.add(g2); return wrap;
}
function buildRelay(){
  const g=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.5),
    new THREE.MeshStandardMaterial({color:0x2a4d8a,roughness:0.4,transparent:true,opacity:0.7}));
  box.castShadow=true; g.add(box);
  const coil=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.4,16),
    new THREE.MeshStandardMaterial({color:0xb87333,roughness:0.4,metalness:0.7}));
  coil.position.x=-0.15; g.add(coil);
  return g;
}
function buildTransformer(){
  const g=new THREE.Group();
  const core=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.4),
    new THREE.MeshStandardMaterial({color:0x444444,roughness:0.6,metalness:0.5}));
  g.add(core);
  const wMat=new THREE.MeshStandardMaterial({color:0xb87333,roughness:0.4,metalness:0.7});
  [-0.22,0.22].forEach(x=>{for(let i=0;i<4;i++){
    const t=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.03,8,20),wMat);
    t.position.set(x,-0.18+i*0.12,0);g.add(t);}});
  return g;
}
function buildTriac(){ return buildMOSFET(); }
function buildSCR(){ return _to92(0x3a1a1a); }
function buildOpamp(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.25,0.5),
    new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.5}));
  body.castShadow=true; g.add(body);
  const notch=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.26,16),
    new THREE.MeshStandardMaterial({color:0x000000}));
  notch.rotation.x=Math.PI/2; notch.position.set(-0.3,0.13,0); g.add(notch);
  const pinMat=new THREE.MeshStandardMaterial({color:0xcfd4d8,metalness:0.9,roughness:0.2});
  [-0.2,0,0.2].forEach(x=>{[-1,1].forEach(z=>{
    const p=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.15,0.06),pinMat);
    p.position.set(x,-0.18,z*0.28);g.add(p);});});
  return g;
}
function _meter(color){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.2,32),
    new THREE.MeshStandardMaterial({color:0xf0f0f0,roughness:0.4}));
  body.rotation.x=Math.PI/2; g.add(body);
  const face=new THREE.Mesh(new THREE.CircleGeometry(0.34,32),
    new THREE.MeshStandardMaterial({color,roughness:0.3}));
  face.position.z=0.11; g.add(face);
  const needle=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.28,0.01),
    new THREE.MeshStandardMaterial({color:0x111111}));
  needle.position.set(0,0.05,0.12); needle.rotation.z=0.5; g.add(needle);
  return g;
}
function buildVoltmeter(){ return _meter(0x42a5f5); }
function buildAmmeter(){ return _meter(0x66bb6a); }

const BUILDERS = { resistor: buildResistor, battery: buildBattery, led: buildLED, capacitor: buildCapacitor, diode: buildDiode, inductor: buildInductor, thermistor: buildThermistor, ldr: buildLDR, zener: buildZener, varistor: buildVaristor, fuse: buildFuse, breaker: buildBreaker, solar: buildSolar, acsource: buildACSource, npn: buildNPN, pnp: buildPNP, mosfet: buildMOSFET, motor: buildMotor, bulb: buildBulb, buzzer: buildBuzzer, speaker: buildSpeaker, heater: buildHeater, pushbtn: buildPushbtn, spdt: buildSPDT, dpdt: buildDPDT, relay: buildRelay, transformer: buildTransformer, triac: buildTriac, scr: buildSCR, opamp: buildOpamp, voltmeter: buildVoltmeter, ammeter: buildAmmeter };

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
