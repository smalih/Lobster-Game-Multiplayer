/* Game variables*/
let tableCells = $(".table-cells");

let weekDiv = $(".week.latest");
let dayDiv = $(".day.latest");

let onshore = $(".onshore-input.latest");
let offshore = $(".offshore-input.latest");
let onshoreDiv = $(".onshore.latest");
let offshoreDiv = $(".offshore.latest");

let weather = $(".weather.latest");
let income = $(".income.latest");
let costs = $(".costs.latest");
let profit = $(".profit.latest");
let total = $(".total.latest");

tableHeaders = [
  weekDiv,
  dayDiv,
  onshoreDiv,
  offshoreDiv,
  weather,
  income,
  costs,
  profit,
  total,
];
const btnReady = document.getElementById("btnReady");

let totalVal = 0;

addInputListeners();

jQuery.fn.outerHTML = function () {
  return jQuery("<div />").append(this.eq(0).clone()).html();
};

let row = "";
tableHeaders.forEach((element) => (row += element.outerHTML()));

let firstRoll = true;

/* User-defined variables*/
let pots = 5;
let onshorePrice = 3;
let offshorePrice = 5;
let onshoreBadWeatherPrice = 5;
let offshoreCost = 6;

/* Logic game variables*/
let days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
let day = "";
let dayIndex = 0;
let weekIndex = 1;

const sock = io();

btnReady.addEventListener("click", (e) => {
  if (checkShoreInputs() === true) {
    const payload = {
      clientId: clientId,
      gameId: gameId,
    };
    sock.emit("potsReady", JSON.stringify(payload));
    btnReady.disabled = true;
  }
});

sock.on("initialConnect", (message) => {
  const response = JSON.parse(message);
  clientId = response.clientId;
  gameId = document.getElementById("spanGameId").innerText;

  const payload = {
    clientId: clientId,
    gameId: gameId,
  };
  sock.emit("join", JSON.stringify(payload));
});

sock.on("rollDice", (message) => {
  console.log("rollDice received from server");
  const response = JSON.parse(message);
  const decision = response.decision;
  const roll = response.roll;
  if (day == "Sat" || day == "Sun") {
    weather.children("p:first").text("-");
  } else {
    weather.children("p:first").text(decision);
  }
  calcIncomeCostProfit(decision);
  firstRoll = false;
  addRow();
});

function getLatestShoreVals() {
  onshoreValue = parseInt($(".onshore-input.latest").val());
  offshoreValue = parseInt($(".offshore-input.latest").val());
}
function getLatestVariables() {
  tableCells = $(".table-cells");

  weekDiv = $(".week.latest");
  dayDiv = $(".day.latest");

  onshore = $(".onshore-input.latest");
  offshore = $(".offshore-input.latest");
  onshoreDiv = $(".onshore.latest");
  offshoreDiv = $(".offshore.latest");

  weather = $(".weather.latest");
  income = $(".income.latest");
  costs = $(".costs.latest");
  profit = $(".profit.latest");
  total = $(".total.latest");
  getLatestShoreVals();
}

/* Generate random number*/

function checkShoreInputs() {
  getLatestShoreVals();
  potsInput = onshoreValue + offshoreValue;
  if (potsInput === pots) {
    return true;
  }

  if (potsInput > pots) {
    alert("Please make sure you are not using more pots than you have");
  } else if (potsInput < pots) {
    if (confirm("Are you sure? You are not using all your pots.")) {
      return true;
    }
  }

  return false;
}

function calcIncomeCostProfit(decision) {
  if (onshoreValue + offshoreValue == 0) {
    incomeVal = 15;
    costsVal = 0;
  } else if (decision === "Good") {
    incomeVal = onshoreValue * onshorePrice + offshoreValue * offshorePrice;
    costsVal = 0;
  } else if (decision === "Bad") {
    incomeVal = onshoreValue * onshoreBadWeatherPrice;
    costsVal = offshoreValue * offshoreCost;
  }

  if (day == "Sat") {
    income.children("p:first").text("-");
    costs.children("p:first").text(80);
    profit.children("p:first").text(-80);
    totalVal -= 80;
    total.children("p:first").text(totalVal);
  } else if (day == "Sun") {
    profitVal = incomeVal - costsVal;
    income.children("p:first").text("-");
    costs.children("p:first").text("-");
    profit.children("p:first").text("-");
    total.children("p:first").text(totalVal);
  } else {
    profitVal = incomeVal - costsVal;
    income.children("p:first").text(incomeVal);
    costs.children("p:first").text(costsVal);
    profit.children("p:first").text(profitVal);
    totalVal += profitVal;
    total.children("p:first").text(totalVal);
  }

  const payload = {
    clientId: clientId,
    gameId: gameId,
    total: totalVal,
  };

  sock.emit("outcome", JSON.stringify(payload));
}

function addRow() {
  tableCells.append(row);

  $(".week.latest").eq(0).removeClass("latest");
  $(".day.latest").eq(0).removeClass("latest");

  $(".onshore-input.latest").eq(0).prop("disabled", true);
  $(".onshore-input.latest").eq(0).addClass("old-input-val");
  $(".onshore-input.latest").eq(0).removeClass("latest");
  $(".onshore.latest").eq(0).removeClass("latest");

  $(".offshore-input.latest").eq(0).prop("disabled", true);
  $(".offshore-input.latest").eq(0).addClass("old-input-val");
  $(".offshore-input.latest").eq(0).removeClass("latest");
  $(".offshore.latest").eq(0).removeClass("latest");
  $(".weather.latest").eq(0).removeClass("latest");
  $(".income.latest").eq(0).removeClass("latest");
  $(".costs.latest").eq(0).removeClass("latest");
  $(".profit.latest").eq(0).removeClass("latest");
  $(".total.latest").eq(0).removeClass("latest");
  getLatestVariables();
  dayIndex += 1;
  day = days[dayIndex % 7];

  weekIndex = (dayIndex - (dayIndex % 7)) / 7 + 1;
  weekDiv.children("p").eq(0).text(weekIndex);
  dayDiv.children("p").eq(0).text(day);
  if (day == "Sat" || day == "Sun") {
    $(".offshore-input.latest").eq(0).prop("disabled", true);
    $(".offshore-input.latest").eq(0).addClass("old-input-val");
    $(".onshore-input.latest").eq(0).prop("disabled", true);
    $(".onshore-input.latest").eq(0).addClass("old-input-val");
  }
}

function addInputListeners() {
  $(".onshore-input.latest").change(function () {
    onshoreValue = parseInt($(".onshore-input.latest").val());
  });
  $(".offshore-input.latest").change(function () {
    offshoreValue = parseInt($(".offshore-input.latest").val());
  });
}
