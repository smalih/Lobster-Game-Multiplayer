const btnRoll = document.getElementById("btnRoll");

btnRoll.addEventListener("click", (e) => {
  const playersReady = true;
  for (const player of Object.keys(players)) {
    if (!(players[player] === true)) {
      playersReady = false;
    }
  }
  if (playersReady === true) {
    rollDice();
    for (const player of Object.keys(players)) {
      players[player] = false;
    }
  } else {
    alert("Not all players are ready");
  }
});

const players = {};

const sock = io();
sock.on("initialConnect", (message) => {
  const response = JSON.parse(message);
  clientId = response.clientId;
  gameId = document.getElementById("spanGameId").innerText;

  const payload = {
    clientId: clientId,
    gameId: gameId,
  };
  sock.emit("create", JSON.stringify(payload));
});

sock.on("newPlayer", (message) => {
  const response = JSON.parse(message);
  const playerId = response.playerId;
  players[playerId] = false;
});

sock.on("playerReady", (message) => {
  const response = JSON.parse(message);
  const playerId = response.playerId;
  players[playerId] = false;
});
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

const guid = () =>
  (
    S4() +
    S4() +
    "-" +
    S4() +
    "-4" +
    S4().substr(0, 3) +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  ).toLowerCase();

function rollDice() {
  const roll = Math.random() * (6 - 1 + 1) + 1;
  let decision = "Good";
  if (roll >= 5) {
    decision = "Bad";
  }

  const payload = {
    roll: roll,
    decision: decision,
  };
  sock.emit("rollDice", JSON.stringify(payload));
}
