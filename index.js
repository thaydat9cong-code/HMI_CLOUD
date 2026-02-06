const express = require("express");
const ModbusRTU = require("modbus-serial");

const app = express();
const client = new ModbusRTU();

// =======================
// BIẾN TOÀN CỤC
// =======================
let latestValue = 0;
let status = "Disconnected";

// =======================
// KẾT NỐI MODBUS TCP
// =======================
async function connectModbus() {
  try {
    if (client.isOpen) return;

    await client.connectTCP("192.168.8.15", { port: 502 }); // IP HMI
    client.setID(1);
    status = "Connected";
    console.log("Connected to HMI");
  } catch (err) {
    status = "Disconnected";
    console.log("Connect error:", err.message);
  }
}

// =======================
// ĐỌC GIÁ TRỊ TỪ LW5
// =======================
async function readData() {
  if (!client.isOpen) return;

  try {
    const data = await client.readHoldingRegisters(5, 1);
    latestValue = data.data[0];
    status = "Connected";
    console.log("Gia tri tu HMI:", latestValue);
  } catch (err) {
    status = "Disconnected";
    console.log("Read error:", err.message);
  }
}

// =======================
// TRANG CHỦ
// =======================
app.get("/", (req, res) => {
  res.send("HMI CLOUD SERVER RUNNING OK!");
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
// LẶP
// =======================
setInterval(connectModbus, 5000);
setInterval(readData, 1000);

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Web running on port", PORT);
});
