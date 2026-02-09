const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket;
let client;
let isConnected = false;
let timer = null;

function sendStatus(value, connected) {
  return axios.post(CLOUD_URL, {
    value: value,
    connected: connected,
    ts: Date.now()
  });
}

function connectHMI() {
  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);

  socket.setTimeout(3000);

  socket.connect({ host: HMI_IP, port: HMI_PORT });

  socket.on("connect", () => {
    console.log("✅ Connected to HMI");
    isConnected = true;

    timer = setInterval(readAndPush, 2000);
  });

  socket.on("error", async (err) => {
    console.log("❌ Socket error:", err.message);
    handleDisconnect();
  });

  socket.on("timeout", () => {
    console.log("⏱️ HMI timeout");
    handleDisconnect();
  });

  socket.on("close", () => {
    console.log("🔌 HMI disconnected");
    handleDisconnect();
  });
}

async function readAndPush() {
  try {
    const resp = await client.readHoldingRegisters(5, 1);
    const value = resp.response.body.values[0];

    console.log("📟 HMI LW5 =", value);
    await sendStatus(value, true);

  } catch (err) {
    console.log("❌ Read error:", err.message);
    handleDisconnect();
  }
}

async function handleDisconnect() {
  if (!isConnected) return;

  isConnected = false;

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  try {
    socket.destroy();
  } catch {}

  await sendStatus(null, false);

  console.log("🔄 Reconnecting in 5s...");
  setTimeout(connectHMI, 5000);
}

connectHMI();
