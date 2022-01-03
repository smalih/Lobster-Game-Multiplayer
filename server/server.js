const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { urlencoded } = require("express");

const app = express();

app.use(express.static(`${__dirname}/../client`));
app.use(urlencoded({ extended: true }));
app.use(express.json());

app.set("views", `${__dirname}/../views`);
app.set("view engine", "ejs");

const server = http.createServer(app);

const gameRouter = require("../routes/game");
app.use("/game", gameRouter);

const io = socketio(server);

const clients = {};
const games = {};
io.on("connection", (sock) => {
  const clientId = guid();
  clients[clientId] = {
    connection: sock,
  };

  // send response to client
  const payload = {
    clientId: clientId,
  };
  sock.emit("initialConnect", JSON.stringify(payload));

  sock.on("create", (message) => {
    const result = JSON.parse(message);
    const gameId = result.gameId;
    if (!games[gameId]) {
      games[gameId] = {
        id: gameId,
        clients: [],
        hostId: result.clientId,
        hostSock: sock,
        totals: {},
      };
    }
  });

  sock.on("join", (message) => {
    const result = JSON.parse(message);
    const clientId = result.clientId;
    const playerName = result.playerName;
    const gameId = result.gameId;
    sock.join(gameId);
    const game = games[gameId];

    game.clients.push({
      clientId: clientId,
    });

    const payload = {
      playerId: clientId,
      playerName: playerName,
    };
    if (clientId !== game.hostId) {
      game.hostSock.emit("newPlayer", JSON.stringify(payload));
    }
  });

  sock.on("potsReady", (message) => {
    const result = JSON.parse(message);
    const clientId = result.clientId;
    const gameId = result.gameId;
    const game = games[gameId];

    const payload = {
      playerId: clientId,
    };
    game.hostSock.emit("playerReady", JSON.stringify(payload));
  });

  sock.on("rollDice", (message) => {
    const result = JSON.parse(message);
    const roll = result.roll;
    const decision = result.decision;
    const gameId = result.gameId;
    const payload = {
      roll: roll,
      decision: decision,
    };

    io.to(gameId).emit("rollDice", JSON.stringify(payload));
  });

  sock.on("outcome", (message) => {
    const result = JSON.parse(message);
    const gameId = result.gameId;
    const clientId = result.clientId;
    const total = result.total;

    let totals = games[gameId].totals;

    if (!totals[clientId]) {
      totals[clientId] = [];
    }
    totals[clientId].push(total);
    games[gameId].totals = totals;
    const payload = {
      playerId: clientId,
      total: total,
    };

    games[gameId].hostSock.emit("update", JSON.stringify(payload));
    console.log("emitted update", gameId);
  });

  sock.on("finalStandings", (message) => {
    result = JSON.parse(message);
    const gameId = result.gameId;
    const totals = result.totals;
    const payload = {
      totals: result.totals,
    };
    console.log(totals);
    finalStandings = getWinningOrder(totals);
    io.to(gameId).emit("finalStandings", JSON.stringify(payload));
  });
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(8080, () => {
  console.log("Server is ready");
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

function getWinningOrder(totals) {
  const entries = Object.keys(totals).map(function (key) {
    return [key, totals[key]];
  });

  entries.sort(function (first, second) {
    return second[1] - first[1];
  });
  console.log(entries);
  return entries;
}
