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
  const newPlayer = { id: socketId, nickname };
  players.push(newPlayer);
  return newPlayer;
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
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return { players };
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
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  getGameData,
  resetGame,
};
