const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let hmiValue = null;
let lastUpdate = 0;
let history = [];

app.post("/update", (req, res) => {
  const { value, timestamp } = req.body;

  hmiValue = value;
  lastUpdate = timestamp;

  history.push({ t: timestamp, v: value });
  if (history.length > 200) history.shift();

  res.send("OK");
});

app.get("/api/status", (req, res) => {
  res.json({
    hmi_connected: Date.now() - lastUpdate < 5000,
    hmi_value: hmiValue,
    history
  });
});

app.listen(process.env.PORT || 3000);
