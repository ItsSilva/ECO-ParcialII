// server/db/players.db.js
/**
 * Database service for player-related operations
 */

const { assignRoles } = require("../utils/helpers");

const players = [];

/**
 * Get all players
 * @returns {Array} Array of player objects
 */
const getAllPlayers = () => {
  return players;
};

/**
 * Add a new player
 * @param {string} nickname - Player's nickname
 * @param {string} socketId - Player's socket ID
 * @returns {Object} The created player
 */
const addPlayer = (nickname, socketId) => {
  const newPlayer = { id: socketId, nickname, score: 0 };
  players.push(newPlayer);
  return newPlayer;
};

/**
 * Remove a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Removed player object or null if not found
 */
const removePlayer = (socketId) => {
  const index = players.findIndex((player) => player.id === socketId);
  if (index !== -1) {
    return players.splice(index, 1)[0];
  }
  return null;
};

/**
 * Find a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Player object or null if not found
 */
const findPlayerById = (socketId) => {
  return players.find((player) => player.id === socketId) || null;
};

/**
 * Assign roles to all players
 * @returns {Array} Array of players with assigned roles
 */
const assignPlayerRoles = () => {
  const playersWithRoles = assignRoles(players);
  // Update the players array with the new values
  players.splice(0, players.length, ...playersWithRoles);
  return players;
};

/**
 * Find players by role
 * @param {string|Array} role - Role or array of roles to find
 * @returns {Array} Array of players with the specified role(s)
 */
const findPlayersByRole = (role) => {
  if (Array.isArray(role)) {
    return players.filter((player) => role.includes(player.role));
  }
  return players.filter((player) => player.role === role);
};

/**
 * Update player scores based on game outcome
 * @param {string} marcoId - Socket ID of Marco player
 * @param {string} poloId - Socket ID of selected Polo player
 * @param {boolean} isSpecialPolo - Whether the selected player was a special Polo
 * @returns {Object|null} Winner player object if someone reached 100+ points, null otherwise
 */
const updatePlayerScores = (marcoId, poloId, isSpecialPolo) => {
  const marcoPlayer = findPlayerById(marcoId);
  const poloPlayer = findPlayerById(poloId);

  if (!marcoPlayer || !poloPlayer) return null;

  if (isSpecialPolo) {
    // Marco caught the special Polo
    marcoPlayer.score = (marcoPlayer.score || 0) + 50;
    poloPlayer.score = (poloPlayer.score || 0) - 10;
  } else {
    // Marco caught a regular Polo (wrong choice)
    marcoPlayer.score = (marcoPlayer.score || 0) - 10;
  }

  // Check if any player has reached 100+ points
  const winner = players.find((player) => (player.score || 0) >= 100);
  return winner || null;
};

/**
 * Update score for special polo that wasn't caught
 * @param {string} specialPoloId - Socket ID of special Polo player
 * @returns {Object|null} Winner player object if someone reached 100+ points, null otherwise
 */
const updateSpecialPoloScore = (specialPoloId) => {
  const specialPoloPlayer = findPlayerById(specialPoloId);

  if (!specialPoloPlayer) return null;

  // Special Polo wasn't caught, so they get points
  specialPoloPlayer.score = (specialPoloPlayer.score || 0) + 10;

  // Check if any player has reached 100+ points
  const winner = players.find((player) => (player.score || 0) >= 100);
  return winner || null;
};

/**
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return { players };
};

/**
 * Reset all player scores
 * @returns {void}
 */
const resetPlayerScores = () => {
  players.forEach((player) => {
    player.score = 0;
    delete player.role;
  });
};

/**
 * Reset game data
 * @returns {void}
 */
const resetGame = () => {
  players.splice(0, players.length);
};

module.exports = {
  getAllPlayers,
  addPlayer,
  removePlayer,
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  updatePlayerScores,
  updateSpecialPoloScore,
  getGameData,
  resetPlayerScores,
  resetGame,
};
