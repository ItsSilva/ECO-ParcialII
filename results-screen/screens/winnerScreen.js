// results-screen/screens/winnerScreen.js
import { navigateTo, socket } from "../app.js";

export default function renderWinnerScreen(data) {
  const { winner, players } = data;
  const app = document.getElementById("app");

  app.innerHTML = `
    <div id="winner-screen">
      <h1>We Have a Winner!</h1>
      <div class="winner-announcement">
        <h2>${winner.nickname} wins with ${winner.score} points!</h2>
      </div>
      
      <div class="sorting-controls">
        <button id="sort-by-score" class="active">Sort by Score</button>
        <button id="sort-alphabetically">Sort Alphabetically</button>
      </div>
      
      <div id="final-rankings">
        <!-- Player rankings will be inserted here -->
      </div>
      
      <button id="reset-game" class="reset-button">Reset All Scores & Restart Game</button>
    </div>
  `;

  const finalRankings = document.getElementById("final-rankings");
  const sortByScoreBtn = document.getElementById("sort-by-score");
  const sortAlphabeticallyBtn = document.getElementById("sort-alphabetically");
  const resetGameBtn = document.getElementById("reset-game");

  // Function to render players list with different sorting options
  function renderPlayersList(sortType = "score") {
    let sortedPlayers;

    if (sortType === "alphabetical") {
      sortedPlayers = [...players].sort((a, b) =>
        a.nickname.localeCompare(b.nickname)
      );
      sortByScoreBtn.classList.remove("active");
      sortAlphabeticallyBtn.classList.add("active");
    } else {
      sortedPlayers = [...players].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      );
      sortByScoreBtn.classList.add("active");
      sortAlphabeticallyBtn.classList.remove("active");
    }

    finalRankings.innerHTML = "";

    sortedPlayers.forEach((player, index) => {
      const playerRank = document.createElement("div");
      playerRank.className = "player-rank";
      playerRank.innerHTML = `
        <span class="rank">${index + 1}.</span>
        <span class="player-name">${player.nickname}</span>
        <span class="player-score ${player.score < 0 ? "negative" : ""}">${
        player.score
      } pts</span>
      `;
      finalRankings.appendChild(playerRank);
    });
  }

  // Initialize with score sorting
  renderPlayersList("score");

  // Event listeners for sorting buttons
  sortByScoreBtn.addEventListener("click", () => renderPlayersList("score"));
  sortAlphabeticallyBtn.addEventListener("click", () =>
    renderPlayersList("alphabetical")
  );

  // Reset game button event listener
  resetGameBtn.addEventListener("click", () => {
    socket.emit("resetGame");
  });

  // Listen for game reset confirmation
  socket.on("gameReset", () => {
    navigateTo("/", {});
  });
}
