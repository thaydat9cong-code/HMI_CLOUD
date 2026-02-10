const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let hmiValue = null;
let lastUpdate = 0;
let history = [];
let lastId = 0;

app.post("/update", (req, res) => {
  const { value, timestamp } = req.body;

  if (value !== hmiValue) {
    hmiValue = value;
    history.push({ id: ++lastId, t: timestamp, v: value });
    if (history.length > 100) history.shift();
  }

  lastUpdate = timestamp;
  res.send("OK");
});

app.get("/api/status", (req, res) => {
  const since = Number(req.query.since || 0);

  res.json({
    hmi_connected: Date.now() - lastUpdate < 6000,
    hmi_value: hmiValue,
    history: history.filter(x => x.id > since),
    lastId
  });
});

app.listen(process.env.PORT || 3000);
