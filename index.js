const express = require("express");

const app = express();
app.use(express.json());

// =======================
// BIẾN LƯU GIÁ TRỊ
// =======================
let latestValue = 0;
let status = "Disconnected";

// =======================
// API NHẬN DATA TỪ PC
// =======================
app.post("/update", (req, res) => {
  latestValue = req.body.value;
  status = "Connected";

  console.log("Received from PC:", latestValue);

  res.send("OK");
});

// =======================
// API WEB XEM DATA
// =======================
app.get("/data", (req, res) => {
  res.json({
    value: latestValue,
    status: status
  });
});

// =======================
// TRANG GỐC
// =======================
app.get("/", (req, res) => {
  res.send("HMI CLOUD SERVER RUNNING OK!");
});

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Web running on port", PORT);
});
