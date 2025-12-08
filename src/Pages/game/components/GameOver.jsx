// src/Pages/game/components/GameOver.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Target, Clock, Star } from 'lucide-react';
import './GameOver.css';

const GameOver = ({ show, score, level, combo, wave, towers, onRestart, gameType = 'general' }) => {
  if (!show) return null;

  const getGameIcon = () => {
    switch(gameType) {
      case 'space': return '🚀';
      case 'snake': return '🐍';
      case 'dino': return '🦕';
      case 'fish': return '🎣';
      case 'tower': return '🏰';
      case 'block': return '🧩';
      case 'quiz': return '🧠';
      default: return '🎮';
    }
  };

  const getTitle = () => {
    switch(gameType) {
      case 'space': return 'Mission Complete!';
      case 'snake': return 'Snake Game Over!';
      case 'dino': return 'Dino Crashed!';
      case 'fish': return 'Fishing Complete!';
      case 'tower': return 'Base Destroyed!';
      case 'block': return 'Grid Full!';
      case 'quiz': return 'Quiz Complete!';
      default: return 'Game Over!';
    }
  };

  const getSubtitle = () => {
    switch(gameType) {
      case 'space': return 'Your spaceship survived the battle!';
      case 'snake': return 'The snake hit something!';
      case 'dino': return 'The dino couldn\'t jump in time!';
      case 'fish': return 'Your fishing adventure ends here!';
      case 'tower': return 'The enemies broke through your defenses!';
      case 'block': return 'No more moves available!';
      case 'quiz': return 'Great job completing the quiz!';
      default: return 'Thanks for playing!';
    }
  };

  return (
    <motion.div
      className="game-over-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="game-over-content"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Animated Game Icon */}
        <motion.div
          className="game-icon"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {getGameIcon()}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="game-over-title"
        >
          {getTitle()}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="game-over-subtitle"
        >
          {getSubtitle()}
        </motion.p>

        {/* Stats */}
        <motion.div
          className="final-stats"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <motion.div 
            className="stat-item"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Trophy className="stat-icon" />
            <span>Final Score: {score.toLocaleString()}</span>
          </motion.div>

          {level && (
            <motion.div 
              className="stat-item"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Target className="stat-icon" />
              <span>Level Reached: {level}</span>
            </motion.div>
          )}

          {wave && (
            <motion.div 
              className="stat-item"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <Star className="stat-icon" />
              <span>Wave Completed: {wave}</span>
            </motion.div>
          )}

          {towers && (
            <motion.div 
              className="stat-item"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Target className="stat-icon" />
              <span>Towers Built: {towers}</span>
            </motion.div>
          )}

          {combo > 0 && (
            <motion.div 
              className="stat-item"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              <Star className="stat-icon" />
              <span>Best Combo: {combo}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Restart Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="restart-button"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <RotateCcw className="icon" />
          Play Again
        </motion.button>

        {/* Motivational Message */}
        <motion.div
          className="motivation-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {score > 1000 ? "🌟 Outstanding performance!" : 
           score > 500 ? "🔥 Great job!" : 
           "💪 Keep practicing!"}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameOver;

