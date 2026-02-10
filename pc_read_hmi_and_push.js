const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket = null;
let client = null;
let connected = false;
let lastValue = null;
let lastPush = 0;

function startConnectLoop() {
  if (socket) {
    socket.destroy();
    socket = null;
  }

  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);

  socket.connect(HMI_PORT, HMI_IP);

  socket.on("connect", () => {
    connected = true;
    console.log("✅ HMI connected");
  });

  socket.on("close", () => {
    connected = false;
    console.log("⚠️ HMI disconnected, retry...");
    setTimeout(startConnectLoop, 3000);
  });

  socket.on("error", () => {
    connected = false;
    setTimeout(startConnectLoop, 3000);
  });
}

setInterval(async () => {
  if (!connected) return;

  try {
    const r = await client.readHoldingRegisters(5, 1);
    const value = r.response.body.values[0];
    const now = Date.now();

    // Chỉ push khi thay đổi hoặc heartbeat 5s
    if (value !== lastValue || now - lastPush > 5000) {
      lastValue = value;
      lastPush = now;

      await axios.post(CLOUD_URL, {
        value,
        timestamp: now
      });

      console.log("📤 Push:", value);
    }
  } catch (e) {
    connected = false;
    socket.destroy();
  }
}, 1000);

startConnectLoop();
