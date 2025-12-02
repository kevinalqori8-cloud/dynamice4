import { database } from '../firebase';
import { ref, get, set, push, update, remove } from 'firebase/database';

// User Management Service
export const userService = {
  // Save user data
  async saveUserData(userId, data) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, {
        ...data,
        lastUpdated: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving user data:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user data
  async getUserData(userId) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        // Return default data jika tidak ada
        return { 
          success: true, 
          data: this.getDefaultUserData(userId) 
        };
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      return { success: false, error: error.message };
    }
  },

  // Get default user data
  getDefaultUserData(userId) {
    return {
      nama: userId,
      money: 1000,
      achievements: [],
      joinDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  },

  // Update money
  async updateMoney(userId, amount) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, {
        money: amount,
        lastUpdated: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating money:", error);
      return { success: false, error: error.message };
    }
  },

  // Add transaction
  async addTransaction(userId, transaction) {
    try {
      const transactionRef = ref(database, `transactions/${userId}`);
      const newTransactionRef = push(transactionRef);
      
      await set(newTransactionRef, {
        ...transaction,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, id: newTransactionRef.key };
    } catch (error) {
      console.error("Error adding transaction:", error);
      return { success: false, error: error.message };
    }
  },

  // Get transactions
  async getTransactions(userId, limit = 10) {
    try {
      const transactionsRef = ref(database, `transactions/${userId}`);
      const snapshot = await get(transactionsRef);
      
      if (snapshot.exists()) {
        const transactions = Object.values(snapshot.val())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        
        return { success: true, data: transactions };
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error("Error getting transactions:", error);
      return { success: false, error: error.message };
    }
  }
};

// Game Service
export const gameService = {
  // Save game state
  async saveGameState(userId, gameType, gameData) {
    try {
      const gameRef = ref(database, `games/${userId}/${gameType}`);
      await set(gameRef, {
        ...gameData,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving game state:", error);
      return { success: false, error: error.message };
    }
  },

  // Get game state
  async getGameState(userId, gameType) {
    try {
      const gameRef = ref(database, `games/${userId}/${gameType}`);
      const snapshot = await get(gameRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      console.error("Error getting game state:", error);
      return { success: false, error: error.message };
    }
  },

  // Update leaderboard
  async updateLeaderboard(gameType, userId, score) {
    try {
      const leaderboardRef = ref(database, `leaderboards/${gameType}/${userId}`);
      await set(leaderboardRef, {
        score: score,
        userId: userId,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      return { success: false, error: error.message };
    }
  }
};

// Global stats service
export const globalStatsService = {
  // Get global money
  async getGlobalMoney() {
    try {
      const globalRef = ref(database, 'global/money');
      const snapshot = await get(globalRef);
      
      if (snapshot.exists()) {
        return { success: true, value: snapshot.val() };
      } else {
        // Initialize with default value
        await set(globalRef, 1000000); // 1 juta default
        return { success: true, value: 1000000 };
      }
    } catch (error) {
      console.error("Error getting global money:", error);
      return { success: false, error: error.message };
    }
  },

  // Update global money
  async updateGlobalMoney(amount) {
    try {
      const globalRef = ref(database, 'global/money');
      await set(globalRef, amount);
      return { success: true };
    } catch (error) {
      console.error("Error updating global money:", error);
      return { success: false, error: error.message };
    }
  }
};

export default {
  userService,
  gameService,
  globalStatsService
};

