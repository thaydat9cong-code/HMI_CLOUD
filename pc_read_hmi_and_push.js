const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket, client;
let connected = false;
let lastValue = null;

function connectHMI() {
  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);
  socket.connect(HMI_PORT, HMI_IP);

  socket.on("connect", () => {
    connected = true;
    console.log("✅ HMI connected");
  });

  socket.on("close", () => connected = false);
  socket.on("error", () => connected = false);
}

setInterval(async () => {
  try {
    if (!connected) {
      await axios.post(CLOUD_URL, { connected: false });
      return;
    }

    const r = await client.readHoldingRegisters(5, 1);
    const value = r.response.body.values[0];

    await axios.post(CLOUD_URL, {
      connected: true,
      value,
      timestamp: Date.now()
    });

    lastValue = value;
  } catch {
    connected = false;
  }
}, 1000);

connectHMI();
