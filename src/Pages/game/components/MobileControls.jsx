// src/Pages/game/components/MobileControls.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Target } from 'lucide-react';
import './MobileControls.css';

const MobileControls = ({ 
  onMove, 
  onAction, 
  gameStarted, 
  gameOver, 
  showPause = true,
  onPause,
  isPaused,
  controlType = 'directional' // 'directional', 'swipe', 'buttons'
}) => {
  if (!gameStarted || gameOver) return null;

  const handleDirection = (direction) => {
    onMove(direction);
  };

  const handleAction = () => {
    onAction();
  };

  if (controlType === 'swipe') {
    return (
      <div className="mobile-controls-swipe">
        <div className="swipe-instructions">
          <p>👆 Swipe to move</p>
          <p>👆👇👈👉 Directional swipes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-controls-directional">
      {/* Directional Pad */}
      <div className="direction-pad">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDirection('up')}
          className="control-arrow up"
        >
          <ChevronUp className="arrow-icon" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDirection('left')}
          className="control-arrow left"
        >
          <ChevronLeft className="arrow-icon" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDirection('right')}
          className="control-arrow right"
        >
          <ChevronRight className="arrow-icon" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDirection('down')}
          className="control-arrow down"
        >
          <ChevronDown className="arrow-icon" />
        </motion.button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAction}
          className="action-btn primary"
        >
          <Zap className="action-icon" />
          <span>Action</span>
        </motion.button>

        {showPause && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPause}
            className="action-btn secondary"
          >
            <Target className="action-icon" />
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default MobileControls;

