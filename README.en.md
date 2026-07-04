# 🌐 Uptime Monitor

<div align="center">

**Lightweight website monitoring and bookmark hub on Cloudflare Workers + Pages + D1**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-0051C3.svg)](https://developers.cloudflare.com/d1/)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/jia0327/Uptime-Monitor?style=flat&logo=github)](https://github.com/jia0327/Uptime-Monitor)

English | [中文](README.md)

</div>

---

## 💡 Core Idea

**Monitoring and bookmarks in one place — uptime checks, SSL/domain alerts, and internal link navigation.**

- **Split check / visit URLs**: probe URL for health checks only; public page shows the visit link
- **Bookmark mode**: set interval to “no checks” for NAS, side routers, and other URLs Workers cannot reach
- **Private monitors**: public status page hides visit links, showing name and status only
- **Zero servers**: runs on Cloudflare free tier; bundled fonts and icons for better mainland China access

---

## 🚀 Online Demo

👉 **[https://uptime-monitor.onlydev.ccwu.cc](https://uptime-monitor.onlydev.ccwu.cc)**

| Path | Description |
|------|-------------|
| [`/`](https://uptime-monitor.onlydev.ccwu.cc/) | Public status page — monitor status, incidents, maintenance |
| [`/bookmarks`](https://uptime-monitor.onlydev.ccwu.cc/bookmarks) | Bookmarks — internal / navigation links by tag |
| [`/admin`](https://uptime-monitor.onlydev.ccwu.cc/admin) | Admin dashboard — login code **`Qwer1234`** |

> Demo is for evaluation only. Do not reuse the demo password in production. See [Deployment](#-deployment) to run your own instance.

---

## ✨ Features

### Monitoring and alerts

| Capability | Description |
|------------|-------------|
| **HTTP/HTTPS probes** | GET/POST, custom headers, request body, keyword checks |
| **Flexible intervals** | 1 / 3 / 5 / 10 / 15 / 30 minutes, or **no checks** (bookmark mode) |
| **SSL / domain expiry** | Independent toggles and alert thresholds |
| **Multi-channel alerts** | WeCom, Feishu, DingTalk, Webhook, Telegram, Email |
| **Alert templates** | Separate incident and recovery messages; silence windows for uptime, SSL, and domain |

### Status page and bookmarks

| Capability | Description |
|------------|-------------|
| **Public status page** | Tag grouping, incidents, maintenance windows, custom logo |
| **Dedicated bookmarks page** | `/bookmarks` with tag-based categories, separate from monitors |
| **Visit link UX** | Underlined name as link; full URL on hover; check URL hidden from lists |
| **Private monitors** | Public page hides visit link, shows name and status only |
| **Quick admin entry** | Status page header links to `/admin` |

### Admin dashboard

| Capability | Description |
|------------|-------------|
| **List UX** | Underlined names as visit links; check URLs hidden; full URL on hover |
| **Tag input** | Pick from existing tags or type new comma-separated values |
| **Bulk and ordering** | Bulk actions, drag-and-drop sort, JSON import/export, health checks |
| **Session auth** | Login session token; frontend does not keep plaintext password |
| **CORS hardening** | `ALLOWED_ORIGIN` support for Worker and Pages proxy |
| **Auto deploy** | GitHub Actions on push to `main` updates Worker and Pages |

### Five monitor modes

| Mode | Public page | HTTP checks | Typical use |
|------|-------------|-------------|-------------|
| **Normal monitor** | Name (underlined link) + status | Yes | Public websites, APIs |
| **Split check / visit URL** | Name (underlined link) + status | Yes | Health endpoint vs login page |
| **Bookmark (no checks)** | Name (underlined link) | No | Internal NAS, side router |
| **Private monitor** | Name + status, **link hidden** | Yes | Sensitive admin panels |
| **Bookmark + private** | Name only, **link hidden** | No | Sensitive internal links |

---

## 🎯 Who It Is For

| User | Use case |
|------|----------|
| Personal site owners | Monitor blogs, docs, APIs, image hosts, proxies |
| Indie developers | Public status page and alerting for their products |
| Small teams | Low-cost monitoring for sites, certificates, domains, HTTP endpoints |
| Homelab / hybrid users | Bookmark-only entries for NAS, side routers, unreachable URLs |
| Cloudflare users | Run on Workers, Pages, and D1 without maintaining a server |

Not meant for large observability platforms with distributed probes, advanced SLO reporting, on-call scheduling, or multi-tenant permissions.

---

## 🖼️ Screenshots

<div align="center">
  <img src="img/Uptime-Monitor-pc.png" alt="Status page" width="100%">
  <br>
  <em>Public status page</em>
</div>

<br>

<div align="center">
  <img src="img/Uptime-Monitor-admin.png" alt="Admin dashboard" width="100%">
  <br>
  <em>Admin dashboard</em>
</div>

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Frontend   │────▶│  Pages Proxy     │────▶│  Hono Worker        │
│  Vue 3 SPA  │     │  /api/* forward  │     │  + D1 + Cron probes │
└─────────────┘     └──────────────────┘     └─────────────────────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  Target sites│
                                               │  SSL / domain│
                                               │  Notifiers   │
                                               └──────────────┘
```

| Layer | Technology |
|-------|------------|
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 |
| Frontend | Vue 3 + Vite + Tailwind CSS |
| Edge proxy | Cloudflare Pages Functions |
| CI/CD | Wrangler + GitHub Actions |

---

## 📋 Quick Facts

| Question | Answer |
|----------|--------|
| Does it need a server | No — Cloudflare Workers, Pages, and D1 |
| Bookmark / internal links | Yes — set interval to “no checks” |
| Private monitors | Yes — public page hides visit link |
| Notification channels | WeCom, Feishu, DingTalk, Webhook, Telegram, Email |
| Mainland China friendliness | Bundled frontend assets; WeCom, Feishu, DingTalk recommended first |

---

## 🛠️ Deployment

### Requirements

- Cloudflare account
- Node.js 22 or later
- npm
- Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

Clone the repository:

```bash
git clone https://github.com/jia0327/Uptime-Monitor.git
cd Uptime-Monitor
```

### Create a D1 database

Create a database:

```bash
npx wrangler d1 create uptime-db
```

The command output includes a `database_id` value, which is required for deployment:

```toml
[[d1_databases]]
binding = "DB"
database_name = "uptime-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Initialize the schema:

```bash
npx wrangler d1 execute uptime-db --remote --file=worker/schema.sql
```

If you already have a D1 database, copy the Database ID from the Cloudflare Dashboard D1 detail page, or run:

```bash
npx wrangler d1 list
```

For existing databases, apply the **incremental migration** statements at the bottom of `worker/schema.sql`. Do not run the full schema file on a live database (it drops tables).

To upgrade to a version with **private monitors**, run:

```bash
npx wrangler d1 execute uptime-db --remote --command="ALTER TABLE monitors ADD COLUMN is_private INTEGER DEFAULT 0;"
```

To upgrade to a version with **split check / visit URLs**, run:

```bash
npx wrangler d1 execute uptime-db --remote --command="ALTER TABLE monitors ADD COLUMN link_url TEXT;"
```

Bookmark mode uses `interval = 0` and needs no extra column. If the column already exists, SQLite will error and you can ignore it.

### Pre-deployment checklist

Before going live, make sure all 4 items are complete:

- The remote D1 database has been initialized with `worker/schema.sql`.
- The Worker has a D1 binding named `DB`.
- The Worker has `ADMIN_API_KEY` configured.
- Pages has `WORKER_URL` configured and the frontend has been redeployed after saving it.

If the last step is missing, the login API returns:

```json
{"error":"WORKER_URL environment variable is not set"}
```

If the D1 schema is missing, public APIs or authenticated admin APIs may return:

```json
{"error":"D1_ERROR: no such table: monitors: SQLITE_ERROR"}
```

### Manual deployment

#### 1. Configure and deploy the Worker

```bash
cd worker
npm install
cp wrangler.example.toml wrangler.toml
```

Edit `worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "uptime-db"
database_id = "your D1_DATABASE_ID"

[vars]
ADMIN_API_KEY = "your admin login secret"
ALLOWED_ORIGIN = "https://your-pages-domain.pages.dev"
SESSION_TTL_HOURS = "12"
```

Keep `binding` as `DB`.

Deploy the Worker:

```bash
npx wrangler deploy
```

Copy the Worker URL from the command output, for example:

```text
https://uptime-worker.example.workers.dev
```

#### 2. Build and deploy the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run build
npx wrangler pages deploy dist --project-name=uptime-monitor
```

#### 3. Configure Pages environment variables

Open Cloudflare Dashboard:

`Workers & Pages` -> `uptime-monitor` -> `Settings` -> `Environment variables`

Add:

| Variable | Description |
|----------|-------------|
| `WORKER_URL` | Worker URL, for example `https://uptime-worker.example.workers.dev` |
| `ALLOWED_ORIGIN` | Pages URL, for example `https://uptime-monitor.pages.dev` |

Save the variables and redeploy the frontend:

```bash
npx wrangler pages deploy dist --project-name=uptime-monitor
```

Verify the proxy:

```bash
curl https://your-pages-domain.pages.dev/api/monitors/public
```

It should return `[]` or a monitor list. If it returns `WORKER_URL environment variable is not set`, the Pages environment variable is missing or the frontend was not redeployed after saving it.

### GitHub Actions deployment

After cloning this repository, configure the following values in GitHub repository `Settings` -> `Secrets and variables` -> `Actions`.

#### Secrets

| Name | Required | Description |
|------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | Yes | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare Account ID |
| `D1_DATABASE_ID` | Yes | D1 Database ID |
| `ADMIN_API_KEY` | Yes | Admin login secret |
| `VITE_CF_ANALYTICS_TOKEN` | No | Cloudflare Web Analytics Token |

The Cloudflare API Token should include at least:

| Permission | Level |
|------------|-------|
| Account / Workers Scripts | Edit |
| Account / Cloudflare Pages | Edit |
| Account / D1 | Edit |
| Account / Account Settings | Read |

#### Variables

| Name | Required | Description |
|------|----------|-------------|
| `ALLOWED_ORIGIN` | Recommended | Pages URL for CORS hardening |
| `SESSION_TTL_HOURS` | No | Admin session lifetime, defaults to 12 hours |
| `VITE_FOOTER_AUTHOR` | No | Footer author name |
| `VITE_FOOTER_URL` | No | Footer author URL |

After configuration, push to the `main` branch or manually run the `Deploy Uptime Monitor` workflow in the Actions tab.

After the first deployment, you must add `WORKER_URL` to the Cloudflare Pages project environment variables and redeploy the frontend once. `D1_DATABASE_ID` in GitHub Secrets is only used for the Worker binding; it does not configure the backend URL for Pages.

Open:

`Cloudflare Dashboard` -> `Workers & Pages` -> `uptime-monitor` -> `Settings` -> `Environment variables`

Add:

| Variable | Value |
|----------|-------|
| `WORKER_URL` | Worker URL, for example `https://uptime-worker.example.workers.dev` |
| `ALLOWED_ORIGIN` | Pages URL, for example `https://uptime-monitor.pages.dev` |

After saving, rerun the GitHub Actions deployment, or run locally:

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=uptime-monitor
```

---

## 💻 Local Development

Start the Worker:

```bash
cd worker
npm install
npm run dev
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

- Status page: `http://localhost:5173/`
- Bookmarks: `http://localhost:5173/bookmarks`
- Admin dashboard: `http://localhost:5173/admin`
- Worker: `http://127.0.0.1:8787`

---

## 🇨🇳 Mainland China Access Notes

The `workers.dev` domain may not be directly reachable from mainland China. The recommended setup is to deploy the frontend to Cloudflare Pages and let the Pages proxy forward `/api/*` requests to the Worker.

For better stability, bind custom domains:

- Worker: `Workers & Pages` -> Worker -> `Settings` -> `Domains & Routes`
- Pages: `Workers & Pages` -> Pages project -> `Custom domains`

The project does not depend on paid third-party services. Telegram, Email, `crt.sh`, and `rdap.org` may be affected by local network conditions. For mainland China users, WeCom, Feishu, DingTalk, or a custom Webhook are recommended first.

---

## ❓ FAQ

### GitHub Actions reports Cloudflare Authentication error

This usually means GitHub Secrets are incorrect or the API Token does not have enough permissions. Check:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- Workers, Pages, D1, and Account Settings permissions
- Whether the token resource scope includes the target Cloudflare account

### Worker throws Cannot read properties of undefined (reading 'prepare')

D1 is not bound correctly. Check:

- `binding` in `worker/wrangler.toml` is `DB`
- `database_id` is correct
- `D1_DATABASE_ID` is configured in GitHub Actions

### Admin login says authentication is not configured

Set `ADMIN_API_KEY`. The old `ADMIN_PASSWORD` variable is still supported, but `ADMIN_API_KEY` is recommended.

### `/api/monitors/public` returns the frontend page

The Pages proxy does not have the Worker URL. Set `WORKER_URL` in Cloudflare Pages environment variables, save it, and redeploy the frontend.

### Login API returns 500 with WORKER_URL environment variable is not set

The Pages project is missing `WORKER_URL`. Add this environment variable to the Cloudflare Pages project:

```text
WORKER_URL=https://your Worker URL
```

After saving it, redeploy Pages. New variables do not affect the existing deployment until redeployed.

### API returns D1_ERROR: no such table: monitors

The Worker is connected to a D1 database without the required schema, or `D1_DATABASE_ID` points to a different empty database.

Check D1 databases:

```bash
npx wrangler d1 list
```

Then initialize the remote database:

```bash
npx wrangler d1 execute uptime-db --remote --file=worker/schema.sql
```

---

## 📁 Project Structure

```text
Uptime-Monitor/
├── frontend/
│   ├── public/
│   │   └── _worker.js
│   ├── index.html
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── worker/
│   ├── src/index.ts
│   ├── schema.sql
│   ├── wrangler.example.toml
│   └── package.json
├── .github/workflows/
│   └── deploy.yml
├── docs/
│   └── LAUNCH.md
├── README.md
├── README.en.md
└── LICENSE
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Cloudflare](https://www.cloudflare.com/) platform
- Sister project: [CF-Quota-Dashboard](https://github.com/jia0327/CF-Quota-Dashboard) — multi-account Cloudflare free-tier monitoring

---

<div align="center">

**[⬆ Back to top](#-uptime-monitor)**

Made with ❤️ by [jia0327](https://github.com/jia0327)

</div>
