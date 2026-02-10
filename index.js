const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let hmiValue = null;
let lastUpdate = 0;
let connectedFlag = false;
let history = [];

app.post("/update", (req, res) => {
  const { hmi_value, hmi_connected, timestamp } = req.body;

  if (typeof timestamp === "number") {
    lastUpdate = timestamp;
  }

  if (hmi_connected === false) {
    connectedFlag = false;
  }

  if (hmi_connected === true && typeof hmi_value === "number") {
    connectedFlag = true;
    hmiValue = hmi_value;

    history.push({
      t: timestamp, // ⬅ GIỮ NGUYÊN timestamp
      v: hmi_value
    });

    if (history.length > 300) history.shift();
  }

  res.send("OK");
});

app.get("/api/status", (req, res) => {
  res.json({
    hmi_connected: connectedFlag,
    hmi_value: hmiValue,
    history
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ SERVER RUNNING"));
