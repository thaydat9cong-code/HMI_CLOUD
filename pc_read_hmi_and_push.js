const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket, client;
let connected = false;
let lastValue = null;
let lastSend = 0;

function connectHMI() {
  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);

  socket.connect({ host: HMI_IP, port: HMI_PORT });

  socket.on("connect", () => {
    connected = true;
    console.log("✅ HMI connected");
  });

  socket.on("close", handleDisconnect);
  socket.on("error", handleDisconnect);
}

async function handleDisconnect() {
  if (connected) console.log("❌ HMI disconnected");
  connected = false;
  lastValue = null;

  await axios.post(CLOUD_URL, {
    hmi_connected: false,
    timestamp: Date.now()
  }).catch(() => {});

  setTimeout(connectHMI, 3000);
}

// đọc LW5
setInterval(async () => {
  if (!connected) return;

  try {
    const r = await client.readHoldingRegisters(5, 1);
    const value = r.response.body.values[0];
    const now = Date.now();

    // gửi khi đổi giá trị HOẶC mỗi 2s (keep-alive)
    if (value !== lastValue || now - lastSend > 2000) {
      lastValue = value;
      lastSend = now;

      await axios.post(CLOUD_URL, {
        hmi_connected: true,
        hmi_value: value,
        timestamp: now
      });

      console.log("📟 LW5:", value);
    }
  } catch {
    handleDisconnect();
  }
}, 500);

connectHMI();
