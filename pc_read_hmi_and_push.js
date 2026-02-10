const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket = null;
let client = null;
let connected = false;
let reconnecting = false;

/* ===== CONNECT LOOP ===== */
function connectHMI() {
  if (reconnecting) return;
  reconnecting = true;

  if (socket) {
    try { socket.destroy(); } catch {}
    socket = null;
  }

  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);

  socket.connect(HMI_PORT, HMI_IP);

  socket.on("connect", () => {
    connected = true;
    reconnecting = false;
    console.log("✅ HMI connected");
  });

  socket.on("close", handleDisconnect);
  socket.on("error", handleDisconnect);
}

function handleDisconnect() {
  if (connected) console.log("❌ HMI disconnected");
  connected = false;

  setTimeout(() => {
    reconnecting = false;
    connectHMI();
  }, 3000);
}

/* ===== READ & PUSH ===== */
setInterval(async () => {
  try {
    if (!connected) {
      await axios.post(CLOUD_URL, { connected: false }).catch(()=>{});
      return;
    }

    const r = await client.readHoldingRegisters(5, 1);
    const value = r.response.body.values[0];

    await axios.post(CLOUD_URL, {
      connected: true,
      value,
      timestamp: Date.now()
    });

  } catch {
    handleDisconnect();
  }
}, 1000);

/* ===== START ===== */
connectHMI();
