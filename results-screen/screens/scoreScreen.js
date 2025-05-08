// results-screen/screens/scoreScreen.js
import { navigateTo, socket } from "../app.js";

export default function renderScoreScreen(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="score-screen">
      <h1>Marco-Polo Live Scores</h1>
      <div id="players-list">
        <div class="player-header">
          <span class="player-name">Player</span>
          <span class="player-score">Score</span>
        </div>
        <div id="players-container">
          <p class="loading">Waiting for players to connect...</p>
        </div>
      </div>
    </div>
  `;

  const playersContainer = document.getElementById("players-container");

  // Function to update the players list
  function updatePlayersList(players) {
    if (!players || players.length === 0) {
      playersContainer.innerHTML =
        '<p class="loading">Waiting for players to connect...</p>';
      return;
    }

    playersContainer.innerHTML = "";

    // Sort players by score (highest to lowest)
    const sortedPlayers = [...players].sort(
      (a, b) => (b.score || 0) - (a.score || 0)
    );

    sortedPlayers.forEach((player) => {
      const score = player.score || 0;
      const playerElement = document.createElement("div");
      playerElement.className = "player-item";
      playerElement.innerHTML = `
        <span class="player-name">${player.nickname}</span>
        <span class="player-score ${
          score < 0 ? "negative" : ""
        }">${score} pts</span>
      `;
      playersContainer.appendChild(playerElement);
    });
  }

  // Listen for player updates
  socket.on("playersUpdate", (players) => {
    updatePlayersList(players);
  });

  // Listen for winner announcement
  socket.on("winner", (data) => {
    navigateTo("/winner", data);
  });

  // Initial request for player data
  socket.emit("getPlayers");
}
