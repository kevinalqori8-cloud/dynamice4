import { useState, useEffect } from 'react';
import { userService, gameService, globalStatsService } from '../service/firebaseService';

// Hook untuk user data
export const useUserData = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await userService.getUserData(userId);
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const updateData = async (newData) => {
    const result = await userService.saveUserData(userId, newData);
    if (result.success) {
      setData(newData);
    }
    return result;
  };

  const updateMoney = async (amount) => {
    const result = await userService.updateMoney(userId, amount);
    if (result.success && data) {
      setData({ ...data, money: amount });
    }
    return result;
  };

  return { data, loading, error, updateData, updateMoney };
};

// Hook untuk game data
export const useGameData = (userId, gameType) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !gameType) return;

    const loadGameData = async () => {
      const result = await gameService.getGameState(userId, gameType);
      if (result.success) {
        setGameState(result.data);
      }
      setLoading(false);
    };

    loadGameData();
  }, [userId, gameType]);

  const saveGameState = async (newState) => {
    const result = await gameService.saveGameState(userId, gameType, newState);
    if (result.success) {
      setGameState(newState);
    }
    return result;
  };

  return { gameState, loading, saveGameState };
};

// Hook untuk transactions
export const useTransactions = (userId, limit = 10) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadTransactions = async () => {
      const result = await userService.getTransactions(userId, limit);
      if (result.success) {
        setTransactions(result.data);
      }
      setLoading(false);
    };

    loadTransactions();
  }, [userId, limit]);

  const addTransaction = async (transaction) => {
    const result = await userService.addTransaction(userId, transaction);
    if (result.success) {
      setTransactions([transaction, ...transactions]);
    }
    return result;
  };

  return { transactions, loading, addTransaction };
};

