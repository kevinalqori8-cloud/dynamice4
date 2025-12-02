import { ref, get, set, push, update } from 'firebase/database';
import { database } from '../firebase'; // ✅ PASTIKAN path ini benar

// Debug logging
const debug = true;
const log = (message, data) => {
  if (debug) {
    console.log(`[FirebaseService] ${message}`, data);
  }
};

export const userService = {
  // Get user data
  async getUserData(userId) {
    try {
      log("Getting user data for:", userId);
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        log("User data found:", data);
        return { success: true, data };
      } else {
        log("User data not found, returning default");
        return { 
          success: true, 
          data: this.getDefaultUserData(userId) 
        };
      }
    } catch (error) {
      log("Error getting user data:", error);
      return { success: false, error: error.message };
    }
  },

  // Save user data
  async saveUserData(userId, data) {
    try {
      log("Saving user data for:", userId, data);
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, {
        ...data,
        lastUpdated: new Date().toISOString()
      });
      log("User data saved successfully");
      return { success: true };
    } catch (error) {
      log("Error saving user data:", error);
      return { success: false, error: error.message };
    }
  },

  // Update money
  async updateMoney(userId, amount) {
    try {
      log("Updating money for:", userId, "amount:", amount);
      const userRef = ref(database, `users/${userId}/money`);
      await set(userRef, amount);
      log("Money updated successfully");
      return { success: true };
    } catch (error) {
      log("Error updating money:", error);
      return { success: false, error: error.message };
    }
  },

  // Get transactions
  async getTransactions(userId, limit = 10) {
    try {
      log("Getting transactions for:", userId, "limit:", limit);
      const transactionsRef = ref(database, `transactions/${userId}`);
      const snapshot = await get(transactionsRef);
      
      if (snapshot.exists()) {
        const transactions = Object.values(snapshot.val())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        log("Transactions found:", transactions.length);
        return { success: true, data: transactions };
      } else {
        log("No transactions found");
        return { success: true, data: [] };
      }
    } catch (error) {
      log("Error getting transactions:", error);
      return { success: false, error: error.message };
    }
  },

  // Add transaction
  async addTransaction(userId, transaction) {
    try {
      log("Adding transaction for:", userId, transaction);
      const transactionsRef = ref(database, `transactions/${userId}`);
      const newTransactionRef = push(transactionsRef);
      
      await set(newTransactionRef, {
        ...transaction,
        timestamp: Date.now()
      });
      
      log("Transaction added successfully");
      return { success: true, id: newTransactionRef.key };
    } catch (error) {
      log("Error adding transaction:", error);
      return { success: false, error: error.message };
    }
  },

  // Default user data
  getDefaultUserData(userId) {
    return {
      nama: userId,
      money: 1000,
      achievements: [],
      joinDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }
};

export const gameService = {
  // Get game state
  async getGameState(userId, gameType) {
    try {
      log("Getting game state for:", userId, gameType);
      const gameRef = ref(database, `games/${userId}/${gameType}`);
      const snapshot = await get(gameRef);
      
      if (snapshot.exists()) {
        log("Game state found");
        return { success: true, data: snapshot.val() };
      } else {
        log("Game state not found");
        return { success: true, data: null };
      }
    } catch (error) {
      log("Error getting game state:", error);
      return { success: false, error: error.message };
    }
  },

  // Save game state
  async saveGameState(userId, gameType, gameData) {
    try {
      log("Saving game state for:", userId, gameType);
      const gameRef = ref(database, `games/${userId}/${gameType}`);
      await set(gameRef, {
        ...gameData,
        timestamp: new Date().toISOString()
      });
      log("Game state saved successfully");
      return { success: true };
    } catch (error) {
      log("Error saving game state:", error);
      return { success: false, error: error.message };
    }
  }
};

export const globalStatsService = {
  // Get global money
  async getGlobalMoney() {
    try {
      log("Getting global money");
      const globalRef = ref(database, 'global/money');
      const snapshot = await get(globalRef);
      
      if (snapshot.exists()) {
        log("Global money found:", snapshot.val());
        return { success: true, value: snapshot.val() };
      } else {
        log("Global money not found, using default");
        return { success: true, value: 1000000 }; // Default 1 juta
      }
    } catch (error) {
      log("Error getting global money:", error);
      return { success: false, error: error.message };
    }
  },

  // Update global money
  async updateGlobalMoney(amount) {
    try {
      log("Updating global money to:", amount);
      const globalRef = ref(database, 'global/money');
      await set(globalRef, amount);
      log("Global money updated successfully");
      return { success: true };
    } catch (error) {
      log("Error updating global money:", error);
      return { success: false, error: error.message };
    }
  }
};

export default {
  userService,
  gameService,
  globalStatsService
};

