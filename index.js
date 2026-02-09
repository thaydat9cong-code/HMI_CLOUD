const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// phục vụ file trong thư mục public
app.use(express.static(path.join(__dirname, "public")));

// =======================
// BIẾN LƯU GIÁ TRỊ
// =======================
let latestValue = 0;
let status = "Disconnected";

// =======================
// API NHẬN DATA
// =======================
app.post("/update", (req, res) => {
  latestValue = req.body.value;
  status = "Connected";
  res.send("OK");
});

// =======================
// API WEB
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
