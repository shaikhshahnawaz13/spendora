<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:050608,35:1a0f00,70:78350f,100:d97706&height=280&section=header&text=Spendora&fontSize=90&fontColor=FFFFFF&fontAlignY=35&desc=Personal%20Finance%20Dashboard%20%7C%20Powered%20by%20Supabase%20%2B%20React&descAlignY=58&descSize=20&descColor=fcd34d&animation=fadeIn" />

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=700&size=22&duration=2500&pause=1000&color=D97706&center=true&vCenter=true&width=900&lines=Track+income.+Monitor+expenses.;Visualize+your+financial+habits.;Export+reports+as+CSV+or+PDF.;Backed+by+Supabase.+Secured+with+Google.)](https://shaikhshahnawaz13.github.io/spendora/)

<br/><br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Now-d97706?style=for-the-badge&logo=githubpages&logoColor=white)](https://shaikhshahnawaz13.github.io/spendora/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-050608?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shaikhshahnawaz13/spendora)
[![Stars](https://img.shields.io/github/stars/shaikhshahnawaz13/spendora?style=for-the-badge&color=d97706&logo=github)](https://github.com/shaikhshahnawaz13/spendora)
[![Issues](https://img.shields.io/github/issues/shaikhshahnawaz13/spendora?style=for-the-badge&color=f59e0b)](https://github.com/shaikhshahnawaz13/spendora/issues)
[![License](https://img.shields.io/badge/License-MIT-fcd34d?style=for-the-badge)](LICENSE)

<br/><br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics-22C55E?style=flat-square)](https://recharts.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br/><br/>

> *Spendora is a terminal-aesthetic personal finance dashboard. It tracks your income and expenses in real time, surfaces financial insights, and exports clean reports — all backed by a live Supabase database.*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Charts & Analytics](#-charts--analytics)
- [Financial Signals Engine](#-financial-signals-engine)
- [Authentication](#-authentication)
- [Export System](#-export-system)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [UI & Design Philosophy](#-ui--design-philosophy)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)

---

## Overview

Spendora is not just a list of expenses. It is a full financial intelligence dashboard that helps you understand where your money goes, how your spending compares across months, and what budget limits you are approaching.

Every transaction you add is stored in a real Supabase database — not the browser's localStorage — so your data is synced, persistent, and accessible from any device.

The interface is built around a monospace terminal aesthetic using IBM Plex Mono, with a dark theme and amber accent that makes critical financial numbers stand out at a glance.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Expense & Income Tracking** | Add, view, and delete transactions categorized into 8 expense and 5 income types |
| **Supabase Backend** | All transactions stored in a live PostgreSQL database via Supabase |
| **Google OAuth** | Secure sign-in with Google — no passwords required |
| **Budget Tracking** | Preset monthly budgets per category with live progress tracking |
| **Financial Signals** | Auto-generated insights based on your spending patterns |
| **Multi-Chart Analytics** | Area, Bar, and Line charts for income vs. expense over time |
| **Period Summary Table** | Month-by-month breakdown of income, expenses, and savings rate |
| **CSV Export** | Download current month's transactions as a spreadsheet |
| **PDF Report** | Export a formatted monthly financial report as a PDF |
| **Mobile Responsive** | Sidebar drawer navigation on mobile, full dashboard on desktop |
| **Status Bar** | Live system status, DB connection, row count, and active view |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 | Component-based UI with hooks |
| Build Tool | Vite | Fast dev server and optimized production builds |
| Backend / DB | Supabase | PostgreSQL database + real-time data sync |
| Auth | Supabase Auth + Google OAuth | Secure user authentication |
| Charts | Recharts | Area, Bar, and Line chart components |
| Styling | Inline styles + IBM Plex Mono | Terminal-aesthetic design system |
| Export | Custom CSV + PDF generators | Client-side report generation |
| Deployment | GitHub Pages | Free static hosting |

---

## 📁 Project Structure

```
spendora/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── App.jsx          ← Entire application (single-file architecture)
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── .gitignore
```

> Spendora uses a single-file architecture where all components, logic, constants, and styles live in `App.jsx`. This keeps the codebase easy to navigate for a project of this scope.

---

## ⚙️ How It Works

```
User signs in via Google OAuth
          ↓
Supabase Auth issues session
          ↓
Transactions fetched from Supabase DB
          ↓
React state populated → Charts render
          ↓
User adds/deletes transaction
          ↓
Supabase DB updated → UI re-renders
          ↓
Financial signals recalculated automatically
```

---

## 📊 Charts & Analytics

Spendora uses three Recharts chart types to visualize financial data:

**Area Chart** — Stacked income vs. expense over rolling months. Shows trends at a glance.

**Bar Chart** — Side-by-side income and expense bars per month. Best for comparing period performance.

**Line Chart** — Net savings line over time. Reveals whether your financial health is improving or declining.

All charts update in real time whenever transactions are added or removed. The Y-axis uses a compact INR formatter (e.g., `14K`, `1.2L`) to keep the dashboard readable.

---

## 🔍 Financial Signals Engine

Spendora automatically generates contextual financial insights from your transaction data. Examples include:

- Budget warnings when a category approaches or exceeds its monthly limit
- Savings rate signals when the ratio falls below healthy thresholds
- Income vs. expense imbalance detection
- Month-over-month spending trend alerts

These signals appear in the **Financial Signals** panel and refresh whenever data changes.

---

## 🔐 Authentication

Spendora uses **Supabase Auth with Google OAuth**. Users sign in with their Google account — no email/password setup required.

On sign-in, Supabase issues a session tied to the user's ID. All transactions are scoped per user, so each account sees only its own data.

---

## 📤 Export System

**CSV Export** — Generates a `Date, Type, Category, Amount, Note` spreadsheet for the current month and triggers a browser download.

**PDF Export** — Builds a formatted financial report using the browser's print API, including the monthly summary table and chart data.

Both exports are client-side — no server required.

---

## 🚀 Installation

```bash
git clone https://github.com/shaikhshahnawaz13/spendora.git
cd spendora
npm install
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## 🌐 Deployment

The project is deployed to GitHub Pages using `gh-pages`.

Inside `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/spendora/',
})
```

Inside `package.json`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Deploy with:

```bash
npm run deploy
```

---

## 🎨 UI & Design Philosophy

Spendora is built around a **terminal / financial terminal aesthetic**:

- **Font**: IBM Plex Mono — every label, number, and tag uses monospace for a data-dense, precise feel
- **Color palette**: Near-black backgrounds (`#050608`) with amber (`#d97706`, `#f59e0b`) as the primary accent
- **Data density**: Small font sizes, uppercase labels, letter spacing — information packed without clutter
- **Status bar**: Persistent bottom bar showing active user, DB status, row count, and system health — inspired by IDE status bars
- **Skeleton loaders**: Panels render shimmer placeholders while data fetches, avoiding layout shifts

---

## 🛣 Future Roadmap

- [ ] Recurring transactions support
- [ ] Custom budget limits per user (currently preset)
- [ ] Dark / Light theme toggle
- [ ] AI-powered spending suggestions
- [ ] Bank statement import (CSV parsing)
- [ ] Notification alerts when budgets are exceeded
- [ ] Search and filter transactions
- [ ] Multi-currency support

---

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:d97706,50:78350f,100:050608&height=140&section=footer" />

[![Typing SVG](https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=600&size=16&pause=1000&color=D97706&center=true&vCenter=true&width=600&lines=Built+by+Shaikh+Shahnawaz+Ahmed;Track+smart.+Spend+better.+Save+more.)](https://github.com/shaikhshahnawaz13)

[![GitHub](https://img.shields.io/badge/GitHub-shaikhshahnawaz13-d97706?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shaikhshahnawaz13)

⭐ If Spendora helped you, consider leaving a star.

