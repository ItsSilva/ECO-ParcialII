import { makeRequest, navigateTo, socket } from "../app.js";

export default function renderGameOverScreen(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="game-over">
      <h1>Game Over</h1>
      <h2 id="game-result">${data.message}</h2>
      <button id="restart-button">Restart game</button>
    </div>
  `;

  console.log("data", data);

  const restartButton = document.getElementById("restart-button");

  restartButton.addEventListener("click", async () => {
    await makeRequest("/api/game/start", "POST");
  });

  // Keep the socket.on listener for game start event
  socket.on("startGame", (role) => {
    navigateTo("/game", { nickname: data.nickname, role });
  });
}
