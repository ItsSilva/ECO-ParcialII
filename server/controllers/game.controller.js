// server/controllers/game.controller.js
const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;

    // Check if nickname is already taken
    const existingPlayer = playersDb
      .getAllPlayers()
      .find((p) => p.nickname === nickname);
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: "Nickname already in use",
      });
    }

    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);

    // Notify results screen about the new player
    emitEvent("playersUpdate", gameData.players);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    console.error("Error joining game:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersCount = playersDb.getAllPlayers().length;

    // Check if we have enough players (minimum 3: 1 Marco and at least 2 Polos)
    if (playersCount < 3) {
      return res.status(400).json({
        success: false,
        error: "Need at least 3 players to start the game",
      });
    }

    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error starting game:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    // Verify player is actually Marco
    const player = playersDb.findPlayerById(socketId);
    if (!player || player.role !== "marco") {
      return res.status(403).json({
        success: false,
        error: "Only Marco can use this action",
      });
    }

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error notifying Marco:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    // Verify player is actually a Polo
    const player = playersDb.findPlayerById(socketId);
    if (
      !player ||
      (player.role !== "polo" && player.role !== "polo-especial")
    ) {
      return res.status(403).json({
        success: false,
        error: "Only Polos can use this action",
      });
    }

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error notifying Polo:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    // Verify player is actually Marco
    const myUser = playersDb.findPlayerById(socketId);
    if (!myUser || myUser.role !== "marco") {
      return res.status(403).json({
        success: false,
        error: "Only Marco can select a Polo",
      });
    }

    const poloSelected = playersDb.findPlayerById(poloId);
    if (!poloSelected) {
      return res.status(404).json({
        success: false,
        error: "Selected player not found",
      });
    }

    const allPlayers = playersDb.getAllPlayers();
    const isSpecialPolo = poloSelected.role === "polo-especial";

    // Update player scores based on the game outcome
    let winner = null;

    if (isSpecialPolo) {
      // Update scores when Marco catches the special Polo
      winner = playersDb.updatePlayerScores(socketId, poloId, true);

      // Notify all players that the game is over
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        });
      });
    } else {
      // Update scores when Marco catches a regular Polo (wrong choice)
      winner = playersDb.updatePlayerScores(socketId, poloId, false);

      // Find and update special Polo player score (they weren't caught)
      const specialPoloPlayer = playersDb.findPlayersByRole("polo-especial")[0];
      if (specialPoloPlayer) {
        const specialPoloWinner = playersDb.updateSpecialPoloScore(
          specialPoloPlayer.id
        );
        // If special Polo reached 100+ points, they're the winner
        if (specialPoloWinner && !winner) {
          winner = specialPoloWinner;
        }
      }

      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha perdido`,
        });
      });
    }

    // Notify results screen about updated player scores
    emitEvent("playersUpdate", allPlayers);

    // If there's a winner, notify results screen
    if (winner) {
      emitEvent("winner", { winner, players: allPlayers });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error selecting Polo:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const resetScores = async (req, res) => {
  try {
    playersDb.resetPlayerScores();

    // Notify results screen about reset scores
    const allPlayers = playersDb.getAllPlayers();
    emitEvent("playersUpdate", allPlayers);

    // Notify all clients to restart the game
    emitEvent("gameReset");

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error resetting scores:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  resetScores,
};
