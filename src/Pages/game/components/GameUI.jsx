// src/Pages/game/components/GameUI.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import './GameUI.css';

const GameUI = ({ 
  score, 
  level, 
  gameStarted, 
  gameOver, 
  isPaused,
  onStart, 
  onRestart, 
  onPause,
  onResume,
  onSettings,
  lives,
  money,
  wave,
  showWave = false,
  showMoney = false,
  showLives = false
}) => {
  return (
    <div className="game-ui-container">
      {/* Score Display */}
      <motion.div 
        className="score-display"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.span 
          key={score}
          initial={{ scale: 1.5, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="score-number"
        >
          💎 {score.toLocaleString()}
        </motion.span>
        
        {showWave && (
          <motion.div 
            className="level-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Wave {wave}
          </motion.div>
        )}
        
        {showMoney && (
          <motion.div 
            className="money-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            💰 {money}
          </motion.div>
        )}
        
        {showLives && (
          <motion.div 
            className="lives-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            ❤️ {lives}
          </motion.div>
        )}
        
        {!showWave && level && (
          <motion.div 
            className="level-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Level {level}
          </motion.div>
        )}
      </motion.div>

      {/* Control Buttons */}
      <div className="control-buttons">
        {!gameStarted && !gameOver && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onStart}
            className="control-btn start"
          >
            <Play className="icon" />
          </motion.button>
        )}

        {gameStarted && !gameOver && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={isPaused ? onResume : onPause}
            className="control-btn pause"
          >
            {isPaused ? <Play className="icon" /> : <Pause className="icon" />}
          </motion.button>
        )}

        {(gameOver || isPaused) && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRestart}
            className="control-btn restart"
          >
            <RotateCcw className="icon" />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onSettings}
          className="control-btn settings"
        >
          <Settings className="icon" />
        </motion.button>
      </div>

      {/* Progress Bar */}
      {showWave && (
        <motion.div 
          className="wave-progress"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}
        >
          <div className="wave-info">
            <span>Wave {wave}</span>
          </div>
          <div className="wave-bar">
            <motion.div 
              className="wave-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (score / 1000) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameUI;

