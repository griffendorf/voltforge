import { useState, useRef, useCallback, useEffect } from 'react';

const PULL_THRESHOLD = 100;
const RESISTANCE = 0.35;

export default function PullToRefresh({ onRefresh, children, refreshKey }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setPulling(true);
    setPullDistance(0);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling || e.touches.length !== 1) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      const pulled = diff * RESISTANCE;
      setPullDistance(Math.min(pulled, PULL_THRESHOLD * 1.5));
    }
  }, [pulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    
    setPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pulling, pullDistance, refreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const opacity = refreshing ? 1 : progress * 0.8;
  const rotation = refreshing ? 360 : progress * 180;

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%', overflowY: 'auto' }}>
      {/* Pull indicator */}
      {(pulling || refreshing) && (
        <div
          style={{
            position: 'absolute', top: -60, left: 0, right: 0,
            height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `translateY(${pullDistance}px)`,
            transition: pulling ? 'none' : 'transform 0.25s ease-out',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: `3px solid ${T.blue}33`,
              borderTopColor: T.blue,
              opacity,
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s linear',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ transform: `translateY(${pulling ? pullDistance : 0}px)`, transition: pulling ? 'none' : 'transform 0.25s ease-out' }}>
        {children}
      </div>
    </div>
  );
}

// Import T from theme
import { T } from '@/lib/voltforge/theme';