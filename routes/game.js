const express = require("express");

const router = express.Router();

router.get("/new", (req, res) => {
  const serverGenGameId = guid();
  res.redirect(`/game/${serverGenGameId}?host=true`);
});

router.get("/:id/", (req, res) => {
  let isHost = false;
  if (req.query.host === "true") {
    isHost = true;
  }
  if (isHost) {
    res.render("game/host.ejs", { serverGenGameId: req.params.id });
  } else {
    res.render("game/player.ejs", {
      serverGenGameId: req.params.id,
      playerName: req.query.name,
    });
  }
});

module.exports = router;
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
