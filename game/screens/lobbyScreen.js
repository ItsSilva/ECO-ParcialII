import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderLobbyScreen(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="lobby-screen">
      <h2 id="nickname-display">${data.nickname}</h2>
      <p>
        Esperando a que otros se unan:
        <b id="users-count"><b>0</b></b> usuarios en la sala
      </p>
      <button id="start-button">Start game</button>
    </div>
  `;

  const startButton = document.getElementById("start-button");
  const usersCount = document.getElementById("users-count");

  usersCount.innerHTML = data?.players.length || 0;

  // Keep the socket.on listeners for receiving events
  socket.on("userJoined", (data) => {
    console.log(data);
    usersCount.innerHTML = data?.players.length || 0;
  });

  // Use HTTP request instead of socket.emit
  startButton.addEventListener("click", async () => {
    await makeRequest("/api/game/start", "POST");
  });

  // Keep the socket.on listener for game start event
  socket.on("startGame", (role) => {
    navigateTo("/game", { nickname: data.nickname, role });
  });
}
