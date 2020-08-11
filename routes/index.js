const app = require("express").Router();
const spending = require("../data/spending");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const config = require("../config");

app.use(bodyParser.urlencoded({ extended: true }));

const sortObj = (unsorted) => {
  const ordered = {};
  Object.keys(unsorted)
    .sort()
    .forEach(function (key) {
      ordered[key] = unsorted[key];
    });

  return ordered;
};

const states = sortObj(require("../data/states"));

// parsepd.tech => landing with search bar etc etc
// parsepd.tech/MD => loads all cities + state crime
// parsepd.tech/MD/Baltimore => loads Baltimore + state crime

app.get("/", (req, res) => {
  res.render("landing", {
    title: "ParsePD",
    spending: spending,
    spendingData: JSON.stringify(spending),
    states: states,
    averageData: JSON.stringify(spending["Average for Cities"]["Total"]),
  });
});

app.post("/act", (req, res) => {
  const addr = req.body.address;

  fetch(
    `https://www.googleapis.com/civicinfo/v2/representatives?key=${config.googleKey}&address=${addr}&levels=administrativeArea1&levels=administrativeArea2&levels=country`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.officials) {
        res.render("act", {
          title: "Act Now: Defund the Police",
          officials: data.officials,
        });
      } else {
        res.render("error", {
          title: "Error: NOT Found",
          address: addr,
        });
      }
    });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/credits", (req, res) => {
  res.render("credits", { title: "Credits & Sources" });
});

app.get("/:state", (req, res) => {
  const state = req.params.state;

  if (state.length !== 2 || state.toUpperCase() !== state) {
    res.render("error", { title: "ERROR: NOT FOUND" });
  } else {
    res.render("state", {
      title: states[state].name + " Police Expenditure",
      blue: states[state].blue,
      state: state,
      stateName: states[state].name,
      spendingData: JSON.stringify(spending[state]["Total"]),
      averageData: JSON.stringify(spending["Average for Cities"]["Total"]),
    });
  }
});

module.exports = app;
