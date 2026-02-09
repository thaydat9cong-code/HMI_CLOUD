const Modbus = require("jsmodbus");
const net = require("net");
const axios = require("axios");

const HMI_IP = "192.168.8.15";
const HMI_PORT = 502;
const CLOUD_URL = "https://hmi-cloud.onrender.com/update";

let socket;
let client;
let connected = false;

function connectHMI() {
  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, 1);

  socket.connect({ host: HMI_IP, port: HMI_PORT });

  socket.on("connect", () => {
    connected = true;
    console.log("✅ HMI connected");
  });

  socket.on("error", handleDisconnect);
  socket.on("close", handleDisconnect);
}

function handleDisconnect() {
  if (connected) console.log("❌ HMI disconnected");
  connected = false;
  setTimeout(connectHMI, 3000); // auto reconnect
}

setInterval(async () => {
  if (!connected) return;

  try {
    const resp = await client.readHoldingRegisters(5, 1); // LW5
    const value = resp.response.body.values[0];

    console.log("📟 HMI LW5 =", value);

    await axios.post(CLOUD_URL, { value });

  } catch (err) {
    handleDisconnect();
  }
}, 2000);

connectHMI();
