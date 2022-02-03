const btnRoll = $("#btnRoll");
const btnEndGame = $("#btnEndGame");
const tableHeadings = $(".table-headings");
const tableCells = $(".table-cells");
const min = 1;
const max = 6;
let count = 0;

$(".table-contents").css("grid-template-columns", "repeat(2, 1fr)");
tableHeadings.css("grid-template-columns", "repeat(2, 1fr)");
tableCells.css("grid-template-columns", "repeat(2, 1fr)");

btnRoll.click(function () {
  let playersReady = true;
  for (const player of Object.values(players)) {
    if (player === false) {
      playersReady = false;
    }
  }
  if (playersReady === true) {
    rollDice(min, max);
    alert("Dice rolled");
    count++;
    for (const player of Object.keys(players)) {
      players[player] = false;
    }
  } else {
    alert("Not all players are ready");
    console.log(players);
  }
});

btnEndGame.click(function () {
  const payload = {
    gameId: gameId,
    totals: {},
  };
  console.log(playerTotals);
  for (const playerId of Object.keys(players)) {
    payload.totals[playerNames[playerId]] = playerTotals[playerId].at(-1);
  }

  sock.emit("finalStandings", JSON.stringify(payload));
});
const players = {};
const playerTotals = {};
const playerNames = {};

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
  const playerName = response.playerName;
  players[playerId] = false;
  playerTotals[playerId] = [];
  playerNames[playerId] = playerName;
  addPlayerToHTML(playerName);
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
  console.log(playerTotals);
  for (const totalsArray of Object.values(playerTotals)) {
    while (totalsArray.length !== count) {
      console.log(
        "still waiting on score",
        totalsArray,
        totalsArray.length,
        count
      );
    }
  }
  updatePlayerHTMLScores();
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

// const b = document.createElement("button");
// b.id = `ball${i + 1}`;
// b.tag = i + 1;
// b.textContent = i + 1;
// b.style.width = "150px";
// b.style.height = "150px";

// b.addEventListener("click", (e) => {
//   b.style.background = playerColor;
//   const payload = {
//     clientId: clientId,
//     gameId: gameId,
//     // returing tag of b in payload so 1-indexing
//     ballId: b.tag,
//     color: playerColor,
//   };
//   sock.emit("play", JSON.stringify(payload));
// });
// divBoard.appendChild(b);

function addPlayerToHTML(playerName) {
  const newLength = Object.keys(players).length;
  $(".table-contents").css(
    "grid-template-columns",
    `repeat(${newLength + 1}, 1fr)`
  );
  tableHeadings.css("grid-template-columns", `repeat(${newLength + 1}, 1fr)`);

  tableCells.css("grid-template-columns", `repeat(${newLength + 1}, 1fr)`);
  console.log(newLength);
  let p = document.createElement("p");
  p = $(p);
  p.text(`${playerName}`);

  let d = document.createElement("div");
  d = $(d);
  d.addClass("table-heading-wrapper");
  d.append(p);
  tableHeadings.append(d);

  p = document.createElement("p");
  p = $(p);
  p.text("0");
  d = document.createElement("div");
  d = $(d);
  d.addClass(`${playerName} player table-cell-wrapper`);
  d.append(p);
  tableCells.append(d);
}

function updatePlayerHTMLScores() {
  for (const playerId of Object.keys(player)) {
    playerName = playerNames[playerId];
    playerTotal = playerTotals[playerId][0];
    let p = document.createElement("p");
    p = $(p);
    p.text(`${playerTotal}`);
    d = document.createElement("div");
    d = $(d);
    d.addClass(`${playerName} player table-cell-wrapper`);
    d.append(p);
    tableCells.append(d);
  }
}
