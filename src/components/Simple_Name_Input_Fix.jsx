// Simple Name Input Component untuk mengatasi masalah stuck di name holder
import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, CircularProgress } from '@mui/material';

export const SimpleNameInput = ({ onNameSubmit, gameName }) => {
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    // Coba ambil nama dari localStorage
    const savedName = localStorage.getItem('xe4_player_name');
    if (savedName) {
      setPlayerName(savedName);
      // Auto submit jika nama sudah ada
      setTimeout(() => {
        handleSubmit(savedName);
      }, 500);
    }
  }, []);

  const handleSubmit = (name = playerName) => {
    if (name.trim()) {
      setIsLoading(true);
      // Simpan nama di localStorage
      localStorage.setItem('xe4_player_name', name.trim());
      
      // Panggil callback parent
      setTimeout(() => {
        onNameSubmit(name.trim());
        setShowInput(false);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!showInput) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <Typography variant="h4" className="text-white font-bold mb-2">
          {gameName}
        </Typography>
        <Typography variant="body1" className="text-gray-300 mb-6">
          Siapa nama kamu?
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Masukkan nama kamu..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8a2be2',
              },
            },
            marginBottom: 3
          }}
        />
        
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleSubmit()}
          disabled={isLoading || !playerName.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Mulai Bermain'
          )}
        </Button>
        
        <Typography variant="caption" className="text-gray-400 mt-4 block">
          Nama akan disimpan untuk game lainnya
        </Typography>
      </div>
    </div>
  );
};

// Hook untuk mengelola nama player
export const usePlayerName = () => {
  const [playerName, setPlayerName] = useState("");
  const [nameLoaded, setNameLoaded] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('xe4_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
    setNameLoaded(true);
  }, []);

  const saveName = (name) => {
    setPlayerName(name);
    localStorage.setItem('xe4_player_name', name);
  };

  return { playerName, saveName, nameLoaded };
};
