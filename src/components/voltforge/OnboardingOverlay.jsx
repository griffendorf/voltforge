import { useState, useEffect } from 'react';
import { T } from '@/lib/voltforge/theme';

const STEPS = [
  { icon: '➕', tab: 'PARTS', color: '#00d4ff', title: 'Add Components', desc: 'Tap PARTS to browse resistors, batteries, LEDs and more. Tap a component, then tap the canvas to place it.' },
  { icon: '⚡', tab: 'CANVAS', color: '#39ff7a', title: 'Wire Them Up', desc: 'Tap a terminal dot on a component and drag to another terminal to connect them with a wire.' },
  { icon: '▶', tab: 'SIM', color: '#a855f7', title: 'Run Simulation', desc: 'Tap SIM then press ▶ RUN to simulate your circuit and see live voltage, current and power.' },
  { icon: '✦', tab: 'AI', color: '#ffd700', title: 'Ask Volt·AI', desc: 'Tap AI and describe a circuit (e.g. "Build a 9V LED circuit with a switch") — Volt·AI will build and wire it for you.' },
];

export default function OnboardingOverlay({ onDone }) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('vf_onboarded', '1');
      onDone();
    }
  };

  const s = STEPS[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5,12,22,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'popIn .2s ease',
    }}>
      <div style={{
        background: T.card, border: `1.5px solid ${s.color}44`,
        borderRadius: 20, padding: '32px 24px', maxWidth: 340, width: '100%',
        boxShadow: `0 0 40px ${s.color}22`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        textAlign: 'center',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 3,
              background: i === step ? s.color : T.b2,
              transition: 'all .2s',
            }} />
          ))}
        </div>

        <div style={{ fontSize: 48 }}>{s.icon}</div>

        <div style={{
          padding: '4px 14px', borderRadius: 20,
          background: `${s.color}18`, border: `1px solid ${s.color}44`,
          color: s.color, fontSize: 9, letterSpacing: '.1em', fontWeight: 700,
        }}>{s.tab}</div>

        <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{s.title}</div>
        <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{s.desc}</div>

        <button
          onClick={next}
          style={{
            marginTop: 8, width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${s.color}, ${s.color}99)`,
            color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
          {step < STEPS.length - 1 ? 'Next →' : 'Let\'s Build! ⚡'}
        </button>

        {step === 0 && (
          <button onClick={() => { localStorage.setItem('vf_onboarded', '1'); onDone(); }}
            style={{ background: 'none', border: 'none', color: T.dim, fontSize: 11, cursor: 'pointer' }}>
            Skip tutorial
          </button>
        )}
      </div>
    </div>
  );
}