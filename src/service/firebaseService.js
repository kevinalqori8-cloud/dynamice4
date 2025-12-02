import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Debug logging
const debug = true;
const log = (message, data) => {
  if (debug) {
    console.log(`[FirebaseService] ${message}`, data);
  }
};

export const userService = {
  // Get user data dari Firestore
  async getUserData(userId) {
    try {
      log("Getting user data for:", userId);
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        log("User data found:", data);
        return { success: true, data };
      } else {
        log("User data not found, creating default");
        const defaultData = this.getDefaultUserData(userId);
        await this.saveUserData(userId, defaultData);
        return { success: true, data: defaultData };
      }
    } catch (error) {
      log("Error getting user data:", error);
      return { success: false, error: error.message };
    }
  },

  // Save user data ke Firestore
  async saveUserData(userId, data) {
    try {
      log("Saving user data for:", userId, data);
      const userDoc = doc(db, 'users', userId);
      await setDoc(userDoc, {
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

  // Update money di Firestore
  async updateMoney(userId, amount) {
    try {
      log("Updating money for:", userId, "amount:", amount);
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        money: amount,
        lastUpdated: new Date().toISOString()
      });
      log("Money updated successfully");
      return { success: true };
    } catch (error) {
      log("Error updating money:", error);
      return { success: false, error: error.message };
    }
  },

  // Get transactions dari Firestore
  async getTransactions(userId, limitCount = 10) {
    try {
      log("Getting transactions for:", userId, "limit:", limitCount);
      const transactionsRef = collection(db, 'transactions', userId, 'items');
      const q = query(
        transactionsRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      log("Transactions found:", transactions.length);
      return { success: true, data: transactions };
    } catch (error) {
      log("Error getting transactions:", error);
      return { success: false, error: error.message };
    }
  },

  // Add transaction ke Firestore
  async addTransaction(userId, transaction) {
    try {
      log("Adding transaction for:", userId, transaction);
      const transactionsRef = collection(db, 'transactions', userId, 'items');
      
      const docRef = await addDoc(transactionsRef, {
        ...transaction,
        timestamp: new Date().toISOString()
      });
      
      log("Transaction added successfully with ID:", docRef.id);
      return { success: true, id: docRef.id };
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
  // Get game state dari Firestore
  async getGameState(userId, gameType) {
    try {
      log("Getting game state for:", userId, gameType);
      const gameDoc = doc(db, 'games', userId, 'states', gameType);
      const gameSnapshot = await getDoc(gameDoc);
      
      if (gameSnapshot.exists()) {
        log("Game state found");
        return { success: true, data: gameSnapshot.data() };
      } else {
        log("Game state not found");
        return { success: true, data: null };
      }
    } catch (error) {
      log("Error getting game state:", error);
      return { success: false, error: error.message };
    }
  },

  // Save game state ke Firestore
  async saveGameState(userId, gameType, gameData) {
    try {
      log("Saving game state for:", userId, gameType);
      const gameDoc = doc(db, 'games', userId, 'states', gameType);
      await setDoc(gameDoc, {
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
  // Get global money dari Firestore
  async getGlobalMoney() {
    try {
      log("Getting global money");
      const globalDoc = doc(db, 'global', 'stats');
      const globalSnapshot = await getDoc(globalDoc);
      
      if (globalSnapshot.exists()) {
        const data = globalSnapshot.data();
        log("Global money found:", data.money);
        return { success: true, value: data.money || 1000000 };
      } else {
        log("Global money not found, creating default");
        await this.updateGlobalMoney(1000000);
        return { success: true, value: 1000000 };
      }
    } catch (error) {
      log("Error getting global money:", error);
      return { success: false, error: error.message };
    }
  },

  // Update global money di Firestore
  async updateGlobalMoney(amount) {
    try {
      log("Updating global money to:", amount);
      const globalDoc = doc(db, 'global', 'stats');
      await setDoc(globalDoc, {
        money: amount,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
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

