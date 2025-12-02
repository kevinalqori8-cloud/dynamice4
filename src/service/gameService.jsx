// Tambahkan function untuk GameReme
export const gameService = {
  // ... existing functions ...

  // Save GameReme state
  async saveGameRemeState(userId, gameData) {
    try {
      const gameRef = ref(database, `games/${userId}/gamereme`);
      await set(gameRef, {
        ...gameData,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving GameReme state:", error);
      return { success: false, error: error.message };
    }
  },

  // Get GameReme state
  async getGameRemeState(userId) {
    try {
      const gameRef = ref(database, `games/${userId}/gamereme`);
      const snapshot = await get(gameRef);
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      console.error("Error getting GameReme state:", error);
      return { success: false, error: error.message };
    }
  },

  // Update GameReme leaderboard
  async updateGameRemeLeaderboard(userId, score, winRate) {
    try {
      const leaderboardRef = ref(database, 'leaderboards/gamereme/' + userId);
      await set(leaderboardRef, {
        score: score,
        winRate: winRate,
        userId: userId,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating GameReme leaderboard:", error);
      return { success: false, error: error.message };
    }
  }
};

