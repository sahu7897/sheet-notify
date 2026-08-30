# GitHub Actions setup — step by step

Yeh setup karne ke baad computer OFF hua to bhi Telegram me notification aayega (GitHub ke server par 24/7 chalta hai).

## Step 1 — GitHub repo banao (public)

1. github.com pe login karo
2. Right top me `+` → `New repository`
3. Name: `sheet-notify`
4. **Public** select karo
5. `Create repository`

## Step 2 — Files upload karo

Naye repo me:
1. `Add file` → `Upload files`
2. Ye files drag karo / select karo:
   - `notify.js`
   - `seen.json`
   - `.github/workflows/notify.yml`
3. `Commit changes`

## Step 3 — Secrets add karo

Repo me:
1. `Settings` → `Secrets and variables` → `Actions`
2. `New repository secret`
   - Name: `BOT_TOKEN`, Value: `8955191674:AAHhAeZU0aHp7kZH-HB6L9Bh4rnGhh3RVmE` → Add
3. Phir ek aur:
   - Name: `CHAT_ID`, Value: `1388446058` → Add

## Step 4 — Pehla run manually

Repo me `Actions` tab kholo:
1. Left sidebar me `Sheet Notify` chuno
2. `Run workflow` → `Run workflow`

Pehla run "No new entries" dega (kyunki `seen.json` already seeded hai). Aage jab sheet me koi naya row aayega, to Telegram me message aa jayega.

## Time

Baad me har **10 minute** par khud chalta rahega. Isse change karna ho to `notify.yml` me `cron: "*/10 * * * *"` badlo aur naye commit kar do.

## Speed up kon jug

- Har check ke baad `seen.json` repo me update hota hai, isliye duplicates baar-baar nahi bheje jate.
- Pehli baar `Actions` tab me workflow ko enable karna pad sakta hai (repo banate time `workflows` folder aane ke baad automatically milega).
