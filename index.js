const express = require("express");
const app = express();

let hmiValue = null;
let lastUpdate = 0;

app.use(express.json());

// PC / Gateway gửi dữ liệu lên
app.post("/update", (req, res) => {
  hmiValue = req.body.value;
  lastUpdate = Date.now();
  res.send("OK");
});

// Web đọc dữ liệu
app.get("/api/status", (req, res) => {
  const connected = Date.now() - lastUpdate < 5000;

  res.json({
    hmi_value: connected ? hmiValue : null,
    hmi_connected: connected
  });
});

// Giao diện
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HMI CLOUD SERVER RUNNING");
});
