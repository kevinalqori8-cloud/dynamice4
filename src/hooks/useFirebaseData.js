import { useState, useEffect } from 'react';
import { userService, gameService, globalStatsService } from '../service/firebaseService'; // ✅ FIX: service bukan services

// Hook untuk user data dengan error handling yang lebih baik
export const useUserData = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.log("No userId provided, skipping load");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        console.log("Loading user data for:", userId);
        setLoading(true);
        setError(null);
        
        const result = await userService.getUserData(userId);
        console.log("User data result:", result);
        
        if (result.success) {
          setData(result.data);
          console.log("User data loaded:", result.data);
        } else {
          console.error("Error loading user data:", result.error);
          setError(result.error);
          // Set default data jika error
          setData({
            nama: userId,
            money: 1000,
            achievements: []
          });
        }
      } catch (err) {
        console.error("Exception in useUserData:", err);
        setError(err.message);
        // Set default data jika exception
        setData({
          nama: userId,
          money: 1000,
          achievements: []
        });
      } finally {
        setLoading(false);
        console.log("Finished loading user data");
      }
    };

    loadData();
  }, [userId]);

  const updateData = async (newData) => {
    try {
      console.log("Updating user data:", newData);
      const result = await userService.saveUserData(userId, newData);
      if (result.success) {
        setData(newData);
        console.log("User data updated successfully");
      } else {
        console.error("Error updating user data:", result.error);
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      console.error("Exception in updateData:", err);
      throw err;
    }
  };

  const updateMoney = async (amount) => {
    try {
      console.log("Updating money to:", amount);
      const result = await userService.updateMoney(userId, amount);
      if (result.success && data) {
        setData({ ...data, money: amount });
        console.log("Money updated successfully");
      } else {
        console.error("Error updating money:", result.error);
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      console.error("Exception in updateMoney:", err);
      throw err;
    }
  };

  return { data, loading, error, updateData, updateMoney };
};

// Hook untuk game data dengan error handling
export const useGameData = (userId, gameType) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !gameType) {
      console.log("Missing userId or gameType, skipping load");
      setLoading(false);
      return;
    }

    const loadGameData = async () => {
      try {
        console.log("Loading game data for:", userId, gameType);
        setLoading(true);
        setError(null);
        
        const result = await gameService.getGameState(userId, gameType);
        console.log("Game data result:", result);
        
        if (result.success) {
          setGameState(result.data);
          console.log("Game data loaded:", result.data);
        } else {
          console.error("Error loading game data:", result.error);
          setError(result.error);
          setGameState(null);
        }
      } catch (err) {
        console.error("Exception in useGameData:", err);
        setError(err.message);
        setGameState(null);
      } finally {
        setLoading(false);
        console.log("Finished loading game data");
      }
    };

    loadGameData();
  }, [userId, gameType]);

  const saveGameState = async (newState) => {
    try {
      console.log("Saving game state:", newState);
      const result = await gameService.saveGameState(userId, gameType, newState);
      if (result.success) {
        setGameState(newState);
        console.log("Game state saved successfully");
      } else {
        console.error("Error saving game state:", result.error);
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      console.error("Exception in saveGameState:", err);
      throw err;
    }
  };

  return { gameState, loading, error, saveGameState };
};

// Hook untuk transactions dengan error handling
export const useTransactions = (userId, limit = 10) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.log("No userId provided, skipping load");
      setLoading(false);
      return;
    }

    const loadTransactions = async () => {
      try {
        console.log("Loading transactions for:", userId, "limit:", limit);
        setLoading(true);
        setError(null);
        
        const result = await userService.getTransactions(userId, limit);
        console.log("Transactions result:", result);
        
        if (result.success) {
          setTransactions(result.data);
          console.log("Transactions loaded:", result.data.length, "items");
        } else {
          console.error("Error loading transactions:", result.error);
          setError(result.error);
          setTransactions([]);
        }
      } catch (err) {
        console.error("Exception in useTransactions:", err);
        setError(err.message);
        setTransactions([]);
      } finally {
        setLoading(false);
        console.log("Finished loading transactions");
      }
    };

    loadTransactions();
  }, [userId, limit]);

  const addTransaction = async (transaction) => {
    try {
      console.log("Adding transaction:", transaction);
      const result = await userService.addTransaction(userId, transaction);
      if (result.success) {
        setTransactions([transaction, ...transactions]);
        console.log("Transaction added successfully");
      } else {
        console.error("Error adding transaction:", result.error);
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      console.error("Exception in addTransaction:", err);
      throw err;
    }
  };

  return { transactions, loading, error, addTransaction };
};

// Hook untuk global stats
export const useGlobalStats = () => {
  const [globalMoney, setGlobalMoney] = useState(1000000); // Default 1jt
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        console.log("Loading global stats");
        setLoading(true);
        
        const result = await globalStatsService.getGlobalMoney();
        
        if (result.success) {
          setGlobalMoney(result.value);
          console.log("Global money loaded:", result.value);
        } else {
          console.error("Error loading global money:", result.error);
          setError(result.error);
        }
      } catch (err) {
        console.error("Exception in useGlobalStats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  return { globalMoney, loading, error };
};

