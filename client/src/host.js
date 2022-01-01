const btnRoll = document.getElementById("btnRoll");
const min = 1;
const max = 6;
btnRoll.addEventListener("click", (e) => {
  let playersReady = true;
  for (const player of Object.values(players)) {
    if (player === false) {
      playersReady = false;
    }
  }
  if (playersReady === true) {
    rollDice(min, max);
    alert("Dice rolled");
    for (const player of Object.keys(players)) {
      players[player] = false;
    }
  } else {
    alert("Not all players are ready");
    console.log(players);
  }
});

const players = {};
const playerTotals = {};

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
  playerTotals[playerId] = [];
});

sock.on("playerReady", (message) => {
  const response = JSON.parse(message);
  const playerId = response.playerId;
  players[playerId] = true;
});

sock.on("update", (message) => {
  const response = JSON.parse(message);
  const playerId = response.playerId;
  const total = response.total;

  playerTotals[playerId].push(total);
  console.log(playerId, total);
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

function rollDice(min, max) {
  const roll = Math.floor(Math.random() * (max - min + 1)) + min;
  let decision = "Good";
  if (roll >= 5) {
    decision = "Bad";
  }

  const payload = {
    roll: roll,
    decision: decision,
    gameId: gameId,
  };
  sock.emit("rollDice", JSON.stringify(payload));
}
