const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket = null;
let client = null;
let pollTimer = null;
let connected = false;

function connectHMI() {
  console.log("🔌 Connecting to HMI...");

  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);

  socket.setTimeout(3000);

  socket.connect({ host: HMI_IP, port: HMI_PORT });

  socket.on("connect", () => {
    console.log("✅ HMI connected");
    connected = true;

    startPolling();
  });

  socket.on("error", (err) => {
    console.log("❌ Socket error:", err.message);
    handleDisconnect();
  });

  socket.on("timeout", () => {
    console.log("⏱️ Socket timeout");
    handleDisconnect();
  });

  socket.on("close", () => {
    console.log("🔴 Socket closed");
    handleDisconnect();
  });
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    try {
      const resp = await client.readHoldingRegisters(5, 1);
      const value = resp.response.body.values[0];

      console.log("📟 HMI LW5 =", value);

      await axios.post(CLOUD_URL, {
        value,
        connected: true
      });

    } catch (err) {
      console.log("❌ Read error:", err.message);
      handleDisconnect();
    }
  }, 2000);
}

async function handleDisconnect() {
  if (!connected) return;
  connected = false;

  console.log("⚠️ HMI disconnected");

  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;

  try {
    socket.destroy();
  } catch {}

  // báo cloud là đã mất HMI
  await axios.post(CLOUD_URL, {
    value: null,
    connected: false
  });

  // thử reconnect sau 3s
  setTimeout(connectHMI, 3000);
}

connectHMI();
