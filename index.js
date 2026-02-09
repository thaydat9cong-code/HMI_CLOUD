const express = require("express");
<<<<<<< HEAD
const path = require("path");          // 👈 THÊM DÒNG NÀY
const ModbusRTU = require("modbus-serial");
=======
>>>>>>> 80f69c47e73d30d75d0faba66003d6b10dedb60a

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


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
app.use(express.static(__dirname));

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
