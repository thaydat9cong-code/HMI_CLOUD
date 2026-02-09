const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// =======================
// BIẾN LƯU GIÁ TRỊ
// =======================
let latestValue = 0;
let status = "Disconnected";

// =======================
// STATIC WEB
// =======================
app.use(express.static(path.join(__dirname, "public")));

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
// SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HMI CLOUD SERVER RUNNING OK!");
});
