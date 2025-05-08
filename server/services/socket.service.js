// server/services/socket.service.js
const { Server } = require("socket.io");
const playersDb = require("../db/players.db");

let io;

const initSocketInstance = (httpServer) => {
  io = new Server(httpServer, {
    path: "/real-time",
    cors: {
      origin: "*",
    },
  });

  // Set up event handlers for socket connections
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle player requesting current players list (for results screen)
    socket.on("getPlayers", () => {
      const players = playersDb.getAllPlayers();
      socket.emit("playersUpdate", players);
    });

    // Handle game reset request from results screen
    socket.on("resetGame", () => {
      playersDb.resetPlayerScores();
      const players = playersDb.getAllPlayers();

      // Notify all clients about the updated scores
      io.emit("playersUpdate", players);

      // Notify all clients to reset the game
      io.emit("gameReset");
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const emitToSpecificClient = (socketId, eventName, data) => {
  if (!io) {
    throw new Error("Socket.io instance is not initialized");
  }
  io.to(socketId).emit(eventName, data);
};

const emitEvent = (eventName, data) => {
  if (!io) {
    throw new Error("Socket.io instance is not initialized");
  }
  io.emit(eventName, data);
};

module.exports = {
  emitEvent,
  initSocketInstance,
  emitToSpecificClient,
};
