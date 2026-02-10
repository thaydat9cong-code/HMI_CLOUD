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

  socket.connect({ host: HMI_IP, port: HMI_PORT });

  socket.on("connect", () => {
    connected = true;
    console.log("✅ HMI connected");
  });

  socket.on("close", () => connected = false);
  socket.on("error", () => connected = false);
}

setInterval(async () => {
  if (!connected) return;

  try {
    const r = await client.readHoldingRegisters(5, 1);
    const value = r.response.body.values[0];

    if (value !== lastValue) {
      lastValue = value;

      await axios.post(CLOUD_URL, {
        value,
        timestamp: Date.now()
      });

      console.log("📤 Push:", value);
    }
  } catch {
    connected = false;
    setTimeout(connectHMI, 3000);
  }
}, 1000);

connectHMI();
