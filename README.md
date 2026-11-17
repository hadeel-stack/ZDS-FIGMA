# ZenHR Hackathon 2026 — Frontend

An HR web app built for the ZenHR Hackathon. It shows an **employee Requests screen** — a list of leave, expense, overtime and other requests — where an HR admin can search, filter, approve or reject them (one by one or in bulk), and add new ones. The whole interface is built with **ZDS**, ZenHR's design system, including the sidebar and top navigation.

---

## 🚀 How to run it (no tech knowledge needed)

1. **Install Node.js** (one time only) — download the **LTS** version from [nodejs.org](https://nodejs.org) and install it like any normal app.
2. **Open the Terminal app** (on Mac: press `⌘ + Space`, type "Terminal", press Enter).
3. **Go to this project's folder and run the start script.** Type these two lines, pressing Enter after each:

   ```sh
   cd path/to/hackathon
   ./start.sh
   ```

   > Tip: instead of typing the path, type `cd ` (with a space) and drag the project folder into the Terminal window, then press Enter.

4. **Wait.** The script checks your setup, downloads what the app needs (a few minutes the first time), and starts the app.
5. **Open the app** in your browser at **[http://localhost:4200](http://localhost:4200)**.

To stop the app: go back to the Terminal window and press `Ctrl + C`.

### What does `start.sh` actually do?

| Step | What it does | Why |
|---|---|---|
| 1 | Checks Node.js is installed | Node.js is the engine that runs the app |
| 2 | Checks Yarn is installed (installs it if missing) | Yarn downloads the app's building blocks |
| 3 | Runs `yarn install` | Downloads all the building blocks (one-time) |
| 4 | Runs `yarn dev` | Starts the app on your computer |

---

## 🧑‍💻 For developers

### Commands

```sh
yarn install   # install dependencies
yarn dev       # start the dev server → http://localhost:4200
yarn build     # production build
yarn test      # run tests
yarn lint      # lint
```

### Tech stack

- **React 18 + TypeScript** on an **Nx** workspace (app lives in `apps/web`)
- **Vite** for dev server & builds, **Tailwind CSS** for styling
- **[ZDS](https://github.com/ZenHR/ZDS)** — ZenHR's design system (installed straight from its GitHub repo; provides `DataTable`, `SideNav`, `TopNav`, `Drawer`, `Tabs`, and more)
- **react-router-dom** for routing, **react-hook-form** for forms

### Project structure

```
apps/web/src/app/
├── components/
│   ├── AppShell.tsx            # ZDS SideNav + TopNav page shell (all pages render inside it)
│   ├── TabsContentContainer.tsx
│   ├── MassSelectionBar.tsx    # bulk approve/reject banner
│   └── RequestFormDrawer.tsx   # create/edit request drawer form
├── helpers/
│   ├── navigation.helper.tsx   # nav entries (id, label, path, icon) — single source of truth
│   └── requestTabs.helper.tsx
├── data/requests.ts            # mock data layer (list / create / update / bulk status)
├── pages/
│   ├── RequestsIndex.tsx       # the main Requests screen
│   └── PlaceholderPage.tsx     # "coming soon" stub for unbuilt views
└── app.tsx                     # routes, generated from the nav config
```

### How navigation works

`AppShell` renders the ZDS `SideNav` (hover to expand) and `TopNav`. Nav items, their routes, and the TopNav page title all come from one config: [`navigation.helper.tsx`](apps/web/src/app/helpers/navigation.helper.tsx). Clicking a nav item navigates to its `path`; the active highlight and title are derived from the URL. To add a real page for a placeholder entry, create the page component and point its route at it in [`app.tsx`](apps/web/src/app/app.tsx).

### Scaffolding new index pages

The repo ships a Claude Code skill — `/create-index-page` (see `.claude/skills/`) — that scaffolds a new ZDS index page (DataTable + filters + drawer form + optional Tabs/SubNav) following the `RequestsIndex` pattern.
