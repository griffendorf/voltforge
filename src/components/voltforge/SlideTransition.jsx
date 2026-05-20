import { useState, useEffect } from 'react';

export default function SlideTransition({ activeView, children }) {
  const [prevView, setPrevView] = useState(activeView);
  const [direction, setDirection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (activeView !== prevView) {
      const views = ['canvas', 'parts', 'sim', 'ai', 'info', 'save'];
      const currIdx = views.indexOf(activeView);
      const prevIdx = views.indexOf(prevView);
      
      setDirection(currIdx > prevIdx ? 'forward' : 'backward');
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setPrevView(activeView);
        setIsTransitioning(false);
        setDirection(null);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [activeView, prevView]);

  const getTransform = (view) => {
    if (!isTransitioning) return 'translateX(0)';
    if (view === activeView) {
      return direction === 'forward' ? 'translateX(100%)' : 'translateX(-100%)';
    }
    if (view === prevView) {
      return direction === 'forward' ? 'translateX(-100%)' : 'translateX(100%)';
    }
    return 'translateX(0)';
  };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Previous view (sliding out) */}
      {isTransitioning && prevView !== activeView && (
        <div
          style={{
            position: 'absolute', inset: 0,
            transform: getTransform(prevView),
            transition: 'transform 0.25s ease-in-out',
          }}
        >
          {children(prevView)}
        </div>
      )}

      {/* Current view (sliding in) */}
      <div
        style={{
          position: 'absolute', inset: 0,
          transform: getTransform(activeView),
          transition: 'transform 0.25s ease-in-out',
        }}
      >
        {children(activeView)}
      </div>
    </div>
  );
}