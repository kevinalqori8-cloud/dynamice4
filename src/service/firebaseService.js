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
// Get all users with validation
async getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = [];
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      // Validasi data user
      if (userData && userData.nama) {
        users.push({ id: doc.id, ...userData });
      }
    });
    
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
},

// Helper function dengan safety check
calculateLevel(userData) {
  if (!userData) return 1;
  
  const achievements = userData.achievements?.length || 0;
  const money = userData.money || 0;
  const gamesPlayed = userData.totalGames || 0;
  
  // Formula: achievements * 2 + money/1000 + gamesPlayed * 0.5
  return Math.max(1, Math.floor(achievements * 2 + money / 1000 + gamesPlayed * 0.5));
},

	// Tambahkan fungsi-fungsi ini ke userService.js yang sudah ada
// Tambahkan fungsi-fungsi ini ke userService.js

// Get all users for leaderboard
async getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = [];
    
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
},

// Update user game statistics
async updateUserGameStats(nama, gameName, result) {
  try {
    const userRef = doc(db, 'users', nama);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentStats = userData.gameStats || {};
      const gameStats = currentStats[gameName] || { played: 0, won: 0, totalEarnings: 0 };
      
      // Update statistics
      gameStats.played += 1;
      if (result.moneyChange > 0) {
        gameStats.won += 1;
      }
      gameStats.totalEarnings += (result.moneyChange || 0);
      
      // Update user data
      await updateDoc(userRef, {
        gameStats: {
          ...currentStats,
          [gameName]: gameStats
        },
        totalGames: (userData.totalGames || 0) + 1,
        lastGame: {
          gameName: gameName,
          result: result.result,
          moneyChange: result.moneyChange,
          timestamp: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    }
    
    return { success: false, error: "User not found" };
  } catch (error) {
    console.error("Error updating game stats:", error);
    return { success: false, error: error.message };
  }
},

// Get leaderboard by category
async getLeaderboard(category = 'level') {
  try {
    const users = await this.getAllUsers();
    
    // Sort berdasarkan kategori
    let sortedUsers = [];
    
    switch(category) {
      case 'money':
        sortedUsers = users.sort((a, b) => (b.money || 0) - (a.money || 0));
        break;
      case 'games':
        sortedUsers = users.sort((a, b) => (b.totalGames || 0) - (a.totalGames || 0));
        break;
      case 'achievements':
        sortedUsers = users.sort((a, b) => (b.achievements?.length || 0) - (a.achievements?.length || 0));
        break;
      default: // level
        sortedUsers = users.sort((a, b) => {
          const aLevel = this.calculateLevel(a);
          const bLevel = this.calculateLevel(b);
          return bLevel - aLevel;
        });
    }
    
    return sortedUsers;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
},

// Helper function untuk calculate level
calculateLevel(userData) {
  const achievements = userData.achievements?.length || 0;
  const money = userData.money || 0;
  const gamesPlayed = userData.totalGames || 0;
  
  // Formula: achievements * 2 + money/1000 + gamesPlayed * 0.5
  return Math.floor(achievements * 2 + money / 1000 + gamesPlayed * 0.5);
},


// Student data functions
async saveStudentData(nama, studentData) {
  try {
    const studentRef = doc(db, 'students', nama);
    await setDoc(studentRef, {
      ...studentData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving student data:", error);
    return { success: false, error: error.message };
  }
},

async getStudentData(nama) {
  try {
    const studentRef = doc(db, 'students', nama);
    const studentDoc = await getDoc(studentRef);
    
    if (studentDoc.exists()) {
      return studentDoc.data();
    } else {
      // Coba cari di collection 'users' juga
      const userRef = doc(db, 'users', nama);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Konversi user data ke student data format
        return {
          nama: userData.nama,
          jurusan: userData.jurusan || 'Xe - 4',
          jk: userData.jk || 'L',
          password: "DynamicIsLand", // Default password
          lencana: userData.lencana || ["Siswa E4"],
          money: userData.money || 1000,
          achievements: userData.achievements || []
        };
      }
      
      return null;
    }
  } catch (error) {
    console.error("Error getting student data:", error);
    return null;
  }
},

async updateStudentData(nama, updateData) {
  try {
    const studentRef = doc(db, 'students', nama);
    await updateDoc(studentRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating student data:", error);
    return { success: false, error: error.message };
  }
},

async getAllStudents() {
  try {
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);
    const students = [];
    
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });
    
    return students;
  } catch (error) {
    console.error("Error getting all students:", error);
    return [];
  }
},

// Password update function
async updatePassword(nama, newPassword) {
  try {
    // Update di student data
    const studentRef = doc(db, 'students', nama);
    await updateDoc(studentRef, {
      password: newPassword,
      updatedAt: new Date().toISOString()
    });
    
    // Update juga di user data jika ada
    const userRef = doc(db, 'users', nama);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        password: newPassword,
        updatedAt: new Date().toISOString()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message };
  }
},

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

