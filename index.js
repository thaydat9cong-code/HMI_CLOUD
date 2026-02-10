const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let hmiValue = null;
let lastHeartbeat = 0;
let history = [];
let idCounter = 0;

app.post("/update", (req, res) => {
  const { connected, value, timestamp } = req.body;

  if (connected === true) {
    lastHeartbeat = Date.now();

    if (typeof value === "number") {
      hmiValue = value;
      history.push({
        id: ++idCounter,
        t: timestamp,
        v: value
      });
      if (history.length > 200) history.shift();
    }
  }

  res.send("OK");
});

app.get("/api/status", (req, res) => {
  const since = Number(req.query.since || 0);

  res.json({
    connected: Date.now() - lastHeartbeat < 5000,
    value: hmiValue,
    history: history.filter(x => x.id > since)
  });
});

app.listen(process.env.PORT || 3000);
