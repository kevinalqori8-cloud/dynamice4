// src/components/MobileGameController.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const MobileGameController = ({ 
  onUp, onDown, onLeft, onRight, onAction, 
  showAction = true, actionText = "Action" 
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 lg:hidden">
      <div className="flex justify-between items-end">
        
        {/* D-Pad Controller */}
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <motion.button
            onClick={onUp}
            className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center text-white text-2xl border border-white/30"
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
          <div></div>
          
          <motion.button
            onClick={onLeft}
            className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center text-white text-2xl border border-white/30"
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
          <motion.button
            onClick={onDown}
            className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center text-white text-2xl border border-white/30"
            whileTap={{ scale: 0.9 }}
          >
            ↓
          </motion.button>
          <motion.button
            onClick={onRight}
            className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center text-white text-2xl border border-white/30"
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>

        {/* Action Button */}
        {showAction && (
          <motion.button
            onClick={onAction}
            className="w-20 h-20 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-purple-400"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            {actionText}
          </motion.button>
        )}
      </div>
    </div>
  );
};

// Touch/Swipe Handler Hook
export const useTouchControls = (onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

    if (isLeftSwipe) onSwipeLeft?.();
    if (isRightSwipe) onSwipeRight?.();
    if (isUpSwipe) onSwipeUp?.();
    if (isDownSwipe) onSwipeDown?.();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

