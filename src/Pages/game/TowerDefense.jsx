import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useFirebaseData';
import { userService } from '../../service/firebaseService';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

// 🏰 Tower Defense - Defend Kelas XE-4!
const TowerDefense = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const gameAreaRef = useRef(null);
  
  // Game States
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, completed, failed
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(100);
  const [gold, setGold] = useState(200);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [selectedTowerType, setSelectedTowerType] = useState('basic');
  const [showVictory, setShowVictory] = useState(false);
  const [gameTime, setGameTime] = useState(0);

  // Tower types
  const towerTypes = {
    basic: {
      name: 'Basic Tower',
      cost: 50,
      damage: 20,
      range: 3,
      fireRate: 1000,
      emoji: '🏹',
      color: 'from-gray-400 to-gray-600',
      projectileEmoji: '➡️'
    },
    cannon: {
      name: 'Cannon Tower',
      cost: 100,
      damage: 50,
      range: 2.5,
      fireRate: 2000,
      emoji: '💣',
      color: 'from-red-400 to-red-600',
      projectileEmoji: '💥'
    },
    ice: {
      name: 'Ice Tower',
      cost: 75,
      damage: 10,
      range: 3.5,
      fireRate: 1500,
      emoji: '❄️',
      color: 'from-blue-400 to-cyan-600',
      projectileEmoji: '🧊',
      slowEffect: 0.5
    },
    laser: {
      name: 'Laser Tower',
      cost: 150,
      damage: 30,
      range: 4,
      fireRate: 500,
      emoji: '⚡',
      color: 'from-purple-400 to-pink-600',
      projectileEmoji: '🔥'
    }
  };

  // Enemy types
  const enemyTypes = {
    basic: {
      name: 'Tugas Matematika',
      health: 100,
      speed: 1,
      reward: 10,
      emoji: '📐',
      color: 'bg-red-500'
    },
    fast: {
      name: 'PR Bahasa',
      health: 60,
      speed: 2,
      reward: 15,
      emoji: '📝',
      color: 'bg-yellow-500'
    },
    tank: {
      name: 'Laporan IPA',
      health: 200,
      speed: 0.5,
      reward: 25,
      emoji: '🧪',
      color: 'bg-blue-500'
    },
    boss: {
      name: 'Ujian Akhir',
      health: 500,
      speed: 0.3,
      reward: 100,
      emoji: '📚',
      color: 'bg-purple-500'
    }
  };

  // Game grid
  const gridSize = 12;
  const cellSize = 40;
  const path = [
    {x: 0, y: 6}, {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6},
    {x: 4, y: 5}, {x: 4, y: 4}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 6, y: 3},
    {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}, {x: 7, y: 7},
    {x: 7, y: 8}, {x: 8, y: 8}, {x: 9, y: 8}, {x: 10, y: 8}, {x: 11, y: 8}
  ];

  // Wave configurations
  const waveConfigs = {
    1: [{type: 'basic', count: 5, interval: 1000}],
    2: [
      {type: 'basic', count: 8, interval: 800},
      {type: 'fast', count: 3, interval: 1200}
    ],
    3: [
      {type: 'basic', count: 10, interval: 600},
      {type: 'fast', count: 5, interval: 1000},
      {type: 'tank', count: 2, interval: 2000}
    ],
    4: [
      {type: 'fast', count: 8, interval: 500},
      {type: 'tank', count: 4, interval: 1500},
      {type: 'boss', count: 1, interval: 3000}
    ],
    5: [
      {type: 'basic', count: 15, interval: 400},
      {type: 'fast', count: 10, interval: 600},
      {type: 'tank', count: 6, interval: 1200},
      {type: 'boss', count: 2, interval: 2500}
    ]
  };

  // Initialize game
  const initializeGame = useCallback((selectedLevel = 1) => {
    setLevel(selectedLevel);
    setHealth(100);
    setGold(200);
    setWave(1);
    setScore(0);
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setGameState('playing');
    setShowVictory(false);
    setGameTime(0);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameTime(prev => prev + 50);
      
      // Move enemies
      setEnemies(prev => prev.map(enemy => {
        if (enemy.pathIndex < path.length - 1) {
          const currentPos = path[enemy.pathIndex];
          const nextPos = path[enemy.pathIndex + 1];
          const dx = nextPos.x - currentPos.x;
          const dy = nextPos.y - currentPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          return {
            ...enemy,
            x: enemy.x + (dx / distance) * enemy.speed * 0.05,
            y: enemy.y + (dy / distance) * enemy.speed * 0.05,
            pathProgress: enemy.pathProgress + (enemy.speed * 0.05) / distance
          };
        } else {
          // Enemy reached the end
          setHealth(h => Math.max(0, h - 10));
          return null;
        }
      }).filter(Boolean));

      // Move projectiles
      setProjectiles(prev => prev.map(proj => ({
        ...proj,
        x: proj.x + proj.dx * 5,
        y: proj.y + proj.dy * 5,
        life: proj.life - 1
      })).filter(proj => proj.life > 0));

      // Tower shooting
      setTowers(prev => prev.map(tower => {
        const towerType = towerTypes[tower.type];
        if (gameTime - tower.lastShot > towerType.fireRate) {
          const enemiesInRange = enemies.filter(enemy => {
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= towerType.range;
          });

          if (enemiesInRange.length > 0) {
            const target = enemiesInRange[0];
            const dx = target.x - tower.x;
            const dy = target.y - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            setProjectiles(projectiles => [...projectiles, {
              id: Date.now() + Math.random(),
              x: tower.x,
              y: tower.y,
              dx: dx / distance,
              dy: dy / distance,
              damage: towerType.damage,
              emoji: towerType.projectileEmoji,
              life: 100,
              targetId: target.id
            }]);

            return { ...tower, lastShot: gameTime };
          }
        }
        return tower;
      }));

      // Check projectile hits
      setProjectiles(prev => {
        const remainingProjectiles = [];
        
        prev.forEach(proj => {
          let hit = false;
          setEnemies(enemies => enemies.map(enemy => {
            if (enemy.id === proj.targetId) {
              const dx = enemy.x - proj.x;
              const dy = enemy.y - proj.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 0.5) {
                hit = true;
                const newHealth = enemy.health - proj.damage;
                if (newHealth <= 0) {
                  setGold(g => g + enemy.reward);
                  setScore(s => s + enemy.reward * 10);
                  return null;
                }
                return { ...enemy, health: newHealth };
              }
            }
            return enemy;
          }).filter(Boolean));
          
          if (!hit) {
            remainingProjectiles.push(proj);
          }
        });
        
        return remainingProjectiles;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, gameTime, enemies, projectiles, towers]);

  // Spawn enemies
  useEffect(() => {
    if (gameState !== 'playing' || !waveConfigs[wave]) return;

    const spawnEnemies = async () => {
      const waveConfig = waveConfigs[wave];
      
      for (const config of waveConfig) {
        for (let i = 0; i < config.count; i++) {
          await new Promise(resolve => setTimeout(resolve, config.interval));
          
          const enemyType = enemyTypes[config.type];
          setEnemies(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: config.type,
            x: path[0].x,
            y: path[0].y,
            health: enemyType.health,
            maxHealth: enemyType.health,
            speed: enemyType.speed,
            pathIndex: 0,
            pathProgress: 0,
            ...enemyType
          }]);
        }
      }
    };

    spawnEnemies();
  }, [gameState, wave]);

  // Check wave completion
  useEffect(() => {
    if (gameState === 'playing' && enemies.length === 0 && wave > 1) {
      // Check if all enemies from current wave are spawned
      const waveConfig = waveConfigs[wave];
      const totalEnemies = waveConfig?.reduce((sum, config) => sum + config.count, 0) || 0;
      
      setTimeout(() => {
        if (enemies.length === 0) {
          if (wave < Object.keys(waveConfigs).length) {
            setWave(prev => prev + 1);
            setGold(prev => prev + 50); // Wave completion bonus
          } else {
            setGameState('completed');
            setShowVictory(true);
            
            // Save to leaderboard
            if (userData?.uid) {
              userService.addScore(userData.uid, 'towerdefense', score);
            }
          }
        }
      }, 2000);
    }
  }, [enemies, wave, gameState, score, userData]);

  // Check game over
  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
      setGameState('failed');
    }
  }, [health, gameState]);

  // Place tower
  const placeTower = (gridX, gridY) => {
    const towerType = towerTypes[selectedTowerType];
    
    // Check if position is valid
    const isPath = path.some(p => p.x === gridX && p.y === gridY);
    const isOccupied = towers.some(t => t.gridX === gridX && t.gridY === gridY);
    
    if (!isPath && !isOccupied && gold >= towerType.cost) {
      setTowers(prev => [...prev, {
        id: Date.now(),
        type: selectedTowerType,
        x: gridX + 0.5,
        y: gridY + 0.5,
        gridX,
        gridY,
        lastShot: 0,
        ...towerType
      }]);
      setGold(prev => prev - towerType.cost);
    }
  };

  // Upgrade tower
  const upgradeTower = (towerId) => {
    setTowers(prev => prev.map(tower => {
      if (tower.id === towerId && gold >= tower.cost * 0.5) {
        setGold(g => g - tower.cost * 0.5);
        return {
          ...tower,
          damage: tower.damage * 1.5,
          range: tower.range * 1.1,
          level: (tower.level || 1) + 1
        };
      }
      return tower;
    }));
  };

  // Sell tower
  const sellTower = (towerId) => {
    const tower = towers.find(t => t.id === towerId);
    if (tower) {
      setGold(prev => prev + Math.floor(tower.cost * 0.7));
      setTowers(prev => prev.filter(t => t.id !== towerId));
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setShowVictory(false);
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🏰 Tower Defense
            </motion.h1>
            <p className="text-xl text-gray-300">Defend kelas XE-4 dari serangan tugas dan PR!</p>
          </div>

          {/* Game Stats */}
          {userData && (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
              <Typography variant="h6" className="mb-4 text-center">📊 Statistik Kamu</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-purple-400">{userData.gameStats?.towerdefense?.gamesPlayed || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Games Played</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-blue-400">{userData.gameStats?.towerdefense?.highestLevel || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">Highest Level</Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="text-center">
                    <Typography variant="h4" className="text-green-400">{userData.gameStats?.towerdefense?.highScore || 0}</Typography>
                    <Typography variant="body2" className="text-gray-400">High Score</Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}

          {/* Level Selection */}
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <motion.div
                key={lvl}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Paper 
                  className="bg-black/30 backdrop-blur-lg p-6 cursor-pointer hover:bg-black/50 transition-all duration-300 h-full text-center"
                  onClick={() => initializeGame(lvl)}
                >
                  <div className="text-4xl mb-4">{lvl <= 3 ? '📚' : lvl <= 4 ? '📝' : '🧪'}</div>
                  <Typography variant="h6" className="text-white font-bold mb-2">
                    Level {lvl}
                  </Typography>
                  <Typography variant="body2" className="text-gray-300">
                    {lvl === 1 && 'Belajar dasar'}
                    {lvl === 2 && 'PR bertubi-tubi'}
                    {lvl === 3 && 'Ujian tengah semester'}
                    {lvl === 4 && 'Ujian akhir'}
                    {lvl === 5 && 'Tugas kelompok!'}
                  </Typography>
                  <Chip 
                    label={`${lvl * 2} Waves`} 
                    className="mt-4"
                    color={lvl <= 2 ? 'success' : lvl <= 4 ? 'warning' : 'error'}
                  />
                </Paper>
              </motion.div>
            ))}
          </div>

          {/* Tower Types Preview */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <Typography variant="h6" className="text-white text-center mb-4">🗼 Jenis Tower</Typography>
            <Grid container spacing={3}>
              {Object.entries(towerTypes).map(([key, tower]) => (
                <Grid item xs={6} md={3} key={key}>
                  <Paper className="bg-black/50 p-4 text-center">
                    <div className="text-3xl mb-2">{tower.emoji}</div>
                    <Typography variant="body1" className="text-white font-semibold">
                      {tower.name}
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                      Cost: {tower.cost} gold
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      Damage: {tower.damage} | Range: {tower.range}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Button
              variant="outlined"
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-purple-900"
            >
              ← Kembali ke Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render game
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outlined"
                onClick={resetGame}
                className="text-white border-white hover:bg-white hover:text-purple-900"
                startIcon={<RefreshIcon />}
              >
                Menu
              </Button>
              <Typography variant="h6" className="text-white">
                Level {level} - Wave {wave}
              </Typography>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <WarningIcon className="text-red-400" />
                <Typography className="text-white">
                  {health} HP
                </Typography>
              </div>
              
              <div className="flex items-center gap-2">
                <LocalFireDepartmentIcon className="text-yellow-400" />
                <Typography className="text-white">
                  {gold} Gold
                </Typography>
              </div>
              
              <div className="flex items-center gap-2">
                <EmojiEventsIcon className="text-purple-400" />
                <Typography className="text-white font-bold">
                  {score}
                </Typography>
              </div>
              
              <Chip 
                label={`${enemies.length} Enemies`} 
                color="error"
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <Paper className="bg-black/30 backdrop-blur-lg rounded-2xl p-4">
              <div 
                ref={gameAreaRef}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                style={{ 
                  width: gridSize * cellSize,
                  height: gridSize * cellSize,
                  backgroundImage: `
                    linear-gradient(45deg, #1f2937 25%, transparent 25%),
                    linear-gradient(-45deg, #1f2937 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #1f2937 75%),
                    linear-gradient(-45deg, transparent 75%, #1f2937 75%)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                {/* Path */}
                {path.map((pos, index) => (
                  <div
                    key={index}
                    className="absolute bg-gray-600 opacity-30"
                    style={{
                      left: pos.x * cellSize,
                      top: pos.y * cellSize,
                      width: cellSize,
                      height: cellSize
                    }}
                  />
                ))}

                {/* Towers */}
                {towers.map(tower => (
                  <motion.div
                    key={tower.id}
                    className={`absolute rounded-full bg-gradient-to-br ${tower.color} flex items-center justify-center cursor-pointer`}
                    style={{
                      left: tower.gridX * cellSize + 5,
                      top: tower.gridY * cellSize + 5,
                      width: cellSize - 10,
                      height: cellSize - 10
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => upgradeTower(tower.id)}
                    title={`${tower.name} (Level ${tower.level || 1}) - Click to upgrade`}
                  >
                    <span className="text-lg">{tower.emoji}</span>
                    {(tower.level || 1) > 1 && (
                      <span className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center">
                        {tower.level || 1}
                      </span>
                    )}
                  </motion.div>
                ))}

                {/* Enemies */}
                {enemies.map(enemy => (
                  <motion.div
                    key={enemy.id}
                    className={`absolute rounded-full ${enemy.color} flex items-center justify-center`}
                    style={{
                      left: enemy.x * cellSize + 10,
                      top: enemy.y * cellSize + 10,
                      width: cellSize - 20,
                      height: cellSize - 20
                    }}
                  >
                    <span className="text-sm">{enemy.emoji}</span>
                    {/* Health bar */}
                    <div className="absolute -top-2 left-0 w-full h-1 bg-gray-700 rounded">
                      <div 
                        className="h-full bg-green-500 rounded"
                        style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Projectiles */}
                {projectiles.map(proj => (
                  <motion.div
                    key={proj.id}
                    className="absolute text-xs"
                    style={{
                      left: proj.x * cellSize + cellSize/2 - 6,
                      top: proj.y * cellSize + cellSize/2 - 6
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {proj.emoji}
                  </motion.div>
                ))}

                {/* Grid overlay for tower placement */}
                {Array.from({ length: gridSize }).map((_, y) => 
                  Array.from({ length: gridSize }).map((_, x) => {
                    const isPathCell = path.some(p => p.x === x && p.y === y);
                    const hasTower = towers.some(t => t.gridX === x && t.gridY === y);
                    const canPlace = !isPathCell && !hasTower && gold >= towerTypes[selectedTowerType].cost;
                    
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`absolute border border-gray-700/30 ${canPlace ? 'hover:bg-white/10 cursor-pointer' : ''}`}
                        style={{
                          left: x * cellSize,
                          top: y * cellSize,
                          width: cellSize,
                          height: cellSize
                        }}
                        onClick={() => canPlace && placeTower(x, y)}
                      />
                    );
                  })
                )}
              </div>
            </Paper>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Paper className="bg-black/30 backdrop-blur-lg rounded-2xl p-4">
              <Typography variant="h6" className="text-white mb-4 text-center">
                🗼 Tower Shop
              </Typography>
              
              <div className="space-y-3">
                {Object.entries(towerTypes).map(([key, tower]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paper
                      className={`p-3 cursor-pointer transition-all duration-300 ${
                        selectedTowerType === key 
                          ? 'bg-purple-600/50 border-2 border-purple-400' 
                          : 'bg-black/30 hover:bg-black/50'
                      }`}
                      onClick={() => setSelectedTowerType(key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tower.emoji}</span>
                        <div className="flex-1">
                          <Typography variant="body2" className="text-white font-semibold">
                            {tower.name}
                          </Typography>
                          <Typography variant="caption" className="text-gray-400">
                            Cost: {tower.cost} gold
                          </Typography>
                        </div>
                      </div>
                    </Paper>
                  </motion.div>
                ))}
              </div>

              {/* Tower Info */}
              <div className="mt-6 p-3 bg-black/30 rounded-lg">
                <Typography variant="body2" className="text-white mb-2">
                  🎯 Selected: {towerTypes[selectedTowerType].name}
                </Typography>
                <Typography variant="caption" className="text-gray-400 block">
                  Damage: {towerTypes[selectedTowerType].damage}
                </Typography>
                <Typography variant="caption" className="text-gray-400 block">
                  Range: {towerTypes[selectedTowerType].range}
                </Typography>
                <Typography variant="caption" className="text-gray-400 block">
                  Fire Rate: {towerTypes[selectedTowerType].fireRate}ms
                </Typography>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-3 bg-black/30 rounded-lg">
                <Typography variant="body2" className="text-white mb-2">
                  🎮 Controls
                </Typography>
                <Typography variant="caption" className="text-gray-400 block">
                  • Click empty cells to place towers
                </Typography>
                <Typography variant="caption" className="text-gray-400 block">
                  • Click towers to upgrade
                </Typography>
                <Typography variant="caption" className="text-gray-400 block">
                  • Defend against enemy waves
                </Typography>
              </div>
            </Paper>
          </div>
        </div>
      </div>

      {/* Victory Dialog */}
      <Dialog open={showVictory} onClose={() => setShowVictory(false)} maxWidth="sm" fullWidth>
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <DialogTitle className="text-white text-center">
            <div className="text-6xl mb-4">🎉</div>
            <Typography variant="h4" className="font-bold">
              Kelas XE-4 Terselamatkan!
            </Typography>
          </DialogTitle>
          <DialogContent className="text-white">
            <div className="text-center space-y-4">
              <Typography variant="h6">
                Kamu berhasil menahan serangan tugas dan PR!
              </Typography>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-purple-400">{score}</Typography>
                  <Typography variant="body2" className="text-gray-400">Total Score</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-blue-400">{level}</Typography>
                  <Typography variant="body2" className="text-gray-400">Level</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-green-400">{wave}</Typography>
                  <Typography variant="body2" className="text-gray-400">Waves</Typography>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <Typography variant="h5" className="text-yellow-400">
                    {Math.floor(gameTime / 1000)}s
                  </Typography>
                  <Typography variant="body2" className="text-gray-400">Time</Typography>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="justify-center pb-6">
            <Button 
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              startIcon={<RefreshIcon />}
            >
              Main Lagi
            </Button>
            <Button 
              onClick={() => navigate('/game')}
              className="text-white border-white hover:bg-white hover:text-purple-900"
            >
              Lainnya Games
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={gameState === 'failed'} onClose={() => setGameState('menu')} maxWidth="sm" fullWidth>
        <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-700">
          <DialogTitle className="text-white text-center">
            <div className="text-6xl mb-4">💥</div>
            <Typography variant="h4" className="font-bold">
              Kelas Kalah!
            </Typography>
          </DialogTitle>
          <DialogContent className="text-white text-center">
            <Typography variant="h6" className="mb-4">
              Tugas dan PR menyerbu kelas! 
            </Typography>
            <Typography variant="body1" className="text-gray-300">
              Jangan menyerah, coba lagi dan pertahankan kelas XE-4!
            </Typography>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black/30 rounded-lg p-4">
                <Typography variant="h5" className="text-red-400">{score}</Typography>
                <Typography variant="body2" className="text-gray-400">Score</Typography>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <Typography variant="h5" className="text-orange-400">{wave}</Typography>
                <Typography variant="body2" className="text-gray-400">Wave Reached</Typography>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="justify-center pb-6">
            <Button 
              onClick={() => initializeGame(level)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              startIcon={<RefreshIcon />}
            >
              Coba Lagi
            </Button>
            <Button 
              onClick={resetGame}
              className="text-white border-white hover:bg-white hover:text-red-900"
            >
              Menu Utama
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default TowerDefense;
