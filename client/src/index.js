$("#btnCreate").click(function () {
  window.location.href = `http://localhost:8080/game/new`;
});

$("#btnJoin").click(function () {
  if ($("#gameId").val() !== "" && $("#playerName").val() !== "") {
    gameId = $("#gameId").val();
    playerName = $("#playerName").val();
    window.location.href = `http://localhost:8080/game/${gameId}?name=${playerName}`;
  }
});
