# Sheet Notify

Google Sheet (via SheetDB) ki new entries par Telegram notification.

## Install

```
npm install
```

## Run

```
npm start
```

## Config (environment variables)

- `BOT_TOKEN` – default andar hi hai, zorurat nahi.
- `CHAT_ID` – notification konsi chat me jaye.
- `POLL_INTERVAL` – seconds me how often check kare (default 30).

## How it works

- Har `POLL_INTERVAL` seconds SheetDB API se rows fetch karta hai.
- Naye rows detect karne ke liye har row ka combination (username+password+ip+timestamp) `seen.json` me store karta hai, taaki duplicates baar-baar na bheje.
- Naye entries milne par Telegram message bhejta hai.

## Note

- Script ko chalta rehna hota hai. Server / VPS / phanete computer par chala sakte ho.
- Agar sheet me purane entries hain, to unhe skip karega; sirf script ke baad aane wale naye bhejega.
