const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let hmiValue = null;
let connected = false;
let lastSeen = 0;
let history = [];

app.post("/update", (req, res) => {
  const { type, value, timestamp } = req.body;
  lastSeen = timestamp;

  if (type === "disconnect") {
    connected = false;
    return res.send("OK");
  }

  if (type === "heartbeat") {
    connected = true;
    return res.send("OK");
  }

  if (type === "value") {
    connected = true;
    hmiValue = value;

    history.push({ t: timestamp, v: value });
    if (history.length > 300) history.shift();
  }

  res.send("OK");
});

app.get("/api/status", (req, res) => {
  res.json({
    hmi_connected: connected,
    hmi_value: hmiValue,
    history
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ SERVER RUNNING"));
