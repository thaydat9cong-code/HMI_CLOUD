const express = require("express");
const app = express();

let hmiValue = 0;
let lastUpdate = Date.now();

app.use(express.json());

// ===== API nhận dữ liệu từ PC / HMI =====
app.post("/update", (req, res) => {
  hmiValue = req.body.value;
  lastUpdate = Date.now();
  res.send("OK");
});

// ===== API để web đọc dữ liệu =====
app.get("/data", (req, res) => {
  const connected = Date.now() - lastUpdate < 5000;
  res.json({
    value: hmiValue,
    status: connected ? "Connected" : "Disconnected"
  });
});

// ===== TRẢ GIAO DIỆN HMI =====
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HMI CLOUD SERVER RUNNING OK!");
});
