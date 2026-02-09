const express = require("express");
const app = express();

let hmiValue = null;
let hmiConnected = false;
let lastUpdate = 0;

app.use(express.json());

// ===== API nhận dữ liệu từ PC / HMI =====
app.post("/update", (req, res) => {
  hmiValue = req.body.hmi_value;
  hmiConnected = req.body.hmi_connected;
  lastUpdate = Date.now();
  res.send("OK");
});

// ===== API để web đọc dữ liệu =====
app.get("/api/status", (req, res) => {
  const online = hmiConnected && (Date.now() - lastUpdate < 5000);

  res.json({
    hmi_value: hmiValue,
    hmi_connected: online
  });
});

// ===== TRẢ GIAO DIỆN =====
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HMI CLOUD SERVER RUNNING OK!");
});
