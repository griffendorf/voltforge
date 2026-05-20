import { useState, useEffect } from 'react';
import { T } from '@/lib/voltforge/theme';

const COLORS = [
  { label: 'Blue',   color: T.blue   },
  { label: 'Cyan',   color: T.cyan   },
  { label: 'Green',  color: T.green  },
  { label: 'Amber',  color: T.amber  },
  { label: 'Red',    color: T.red    },
  { label: 'Purple', color: T.purple },
];

export default function WireColorPicker({ wColor, setWColor, onClose }) {
  const cur = COLORS.find(t => t.color === wColor) || COLORS[0];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 998, backdropFilter: 'blur(2px)',
        }}
      />
      
      {/* Bottom Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: T.panel,
        borderTop: `1px solid ${T.b1}`,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
        zIndex: 999,
        animation: 'slideIn 0.25s ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>WIRE COLOR</span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.b2}`,
              background: T.card, color: T.sub, fontSize: 11, cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {COLORS.map(t => {
            const isSelected = t.color === cur.color;
            return (
              <button
                key={t.color}
                onClick={() => { setWColor(t.color); onClose(); }}
                style={{
                  padding: '14px 12px', borderRadius: 10,
                  border: `2px solid ${isSelected ? t.color : T.b2}`,
                  background: isSelected ? `${t.color}18` : T.card,
                  color: t.color,
                  fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: t.color,
                    boxShadow: `0 0 8px ${t.color}66`,
                  }}
                />
                <span style={{ color: isSelected ? t.color : T.sub }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}