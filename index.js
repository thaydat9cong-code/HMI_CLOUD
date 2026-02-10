const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let hmiValue = null;
let lastUpdate = 0;
let history = []; // giữ tối đa 300 điểm

// PC / Gateway đẩy dữ liệu
app.post("/update", (req, res) => {
  const { hmi_value, hmi_connected, timestamp } = req.body;

  if (typeof timestamp === "number") {
    lastUpdate = timestamp;
  }

  if (hmi_connected === true && typeof hmi_value === "number") {
    hmiValue = hmi_value;

    history.push({
      t: new Date(timestamp).toLocaleTimeString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh"
      }),
      v: hmi_value
    });

    if (history.length > 300) history.shift();
  }

  res.send("OK");
});

// Web đọc dữ liệu
app.get("/api/status", (req, res) => {
  const connected = Date.now() - lastUpdate < 10000;

  res.json({
    hmi_connected: connected,
    hmi_value: connected ? hmiValue : null,
    history
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("✅ HMI CLOUD SERVER RUNNING")
);
