import { useEffect, useRef, useState, useCallback } from 'react';

// 🎯 Performance monitoring utility
export const performanceMonitor = {
  fps: 0,
  lastTime: 0,
  frameCount: 0,
  
  update(currentTime) {
    this.frameCount++;
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    return this.fps;
  },
  
  reset() {
    this.fps = 0;
    this.lastTime = 0;
    this.frameCount = 0;
  }
};

// 🎯 Main game optimization hook
export const useGameOptimization = (gameName) => {
  const [fps, setFps] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [batterySaving, setBatterySaving] = useState(false);
  const lastTimeRef = useRef(0);
  const animationRef = useRef(null);

  // Initialize optimizations
  useEffect(() => {
    const initialize = () => {
      // Check if mobile
      const mobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);

      // Battery optimization
      if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
          if (battery.level < 0.2 || battery.charging === false) {
            setBatterySaving(true);
            document.documentElement.classList.add('battery-saver');
          }
        }).catch(() => {});
      }

      // Performance monitoring
      const updatePerformance = (currentTime) => {
        const currentFps = performanceMonitor.update(currentTime);
        setFps(currentFps);
        
        if (currentFps < 30 && !batterySaving) {
          setBatterySaving(true);
          document.documentElement.classList.add('performance-mode');
        }
        
        animationRef.current = requestAnimationFrame(updatePerformance);
      };
      
      animationRef.current = requestAnimationFrame(updatePerformance);
    };

    initialize();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      performanceMonitor.reset();
    };
  }, [batterySaving, gameName]);

  // Game analytics tracking
  const trackGameEvent = useCallback((event, data = {}) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', `${gameName}_${event}`, {
        ...data,
        timestamp: new Date().toISOString(),
        mobile: isMobile,
        battery_saving: batterySaving,
      });
    }
    
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${gameName}] Event:`, event, data);
    }
  }, [gameName, isMobile, batterySaving]);

  // Touch gesture support
  const startFishing = useCallback(() => {
    // This is a placeholder - implement based on game needs
    trackGameEvent('touch_gesture', { gesture: 'fishing' });
  }, [trackGameEvent]);

  return {
    fps,
    isMobile,
    batterySaving,
    trackGameEvent,
    startFishing,
  };
};

// 🎯 Hook for touch gestures
export const useTouchGestures = (elementRef, handlers) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    };

    const onTouchMove = (e) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distanceX = touchStart.x - touchEnd.x;
      const distanceY = touchStart.y - touchEnd.y;
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;
      const isUpSwipe = distanceY > minSwipeDistance;
      const isDownSwipe = distanceY < -minSwipeDistance;

      if (isLeftSwipe && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
      if (isRightSwipe && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      }
      if (isUpSwipe && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
      if (isDownSwipe && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      }
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [elementRef, touchStart, touchEnd, handlers]);

  return null;
};

// 🎯 Hook for game state persistence
export const usePersistentGameState = (gameName, initialState) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(`${gameName}_state`);
      return saved ? JSON.parse(saved) : initialState;
    } catch (error) {
      console.error('Error loading saved state:', error);
      return initialState;
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Debounced save
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`${gameName}_state`, JSON.stringify(state));
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving state:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state, gameName]);

  const updateState = useCallback((newState) => {
    setState(newState);
    setHasUnsavedChanges(true);
  }, []);

  const clearState = useCallback(() => {
    localStorage.removeItem(`${gameName}_state`);
    setState(initialState);
    setHasUnsavedChanges(false);
  }, [gameName, initialState]);

  return {
    state,
    updateState,
    clearState,
    hasUnsavedChanges
  };
};

// 🎯 Hook for responsive game design
export const useResponsiveGame = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const handleResize = useCallback(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setIsPortrait(window.innerHeight > window.innerWidth);
    }, []);

    const debouncedResize = debounce(handleResize, 250);
    
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  const getGameScale = useCallback((baseWidth = 800, baseHeight = 600) => {
    const scaleX = dimensions.width / baseWidth;
    const scaleY = dimensions.height / baseHeight;
    return Math.min(scaleX, scaleY, 1); // Don't scale up
  }, [dimensions]);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isPortrait,
    getGameScale
  };
};

// Helper: Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Default export
export default useGameOptimization;

