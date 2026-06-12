# 🚀 Personal Desktop Productivity Dashboard

> **A fully interactive, animated productivity system that runs as your Windows desktop wallpaper — powered by Next.js, SQLite, and Lively Wallpaper.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Local%20DB-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand-demo.pmnd.rs/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📖 Table of Contents

1. [What Is This?](#-what-is-this)
2. [Live Demo / Screenshots](#-live-demo--screenshots)
3. [Tech Stack & Architecture](#-tech-stack--architecture)
4. [Project Structure](#-project-structure)
5. [Automated 1-Click Setup](#-automated-1-click-setup)
6. [Manual Developer Setup](#-manual-developer-setup)
7. [Connecting to Lively Wallpaper](#-connecting-to-lively-wallpaper)
8. [All Features Deep-Dive](#-all-features-deep-dive)
9. [Database Schema](#-database-schema)
10. [API Endpoints Reference](#-api-endpoints-reference)
11. [State Management Architecture](#-state-management-architecture)
12. [Wallpaper & Background System](#-wallpaper--background-system)
13. [Automated Startup System](#-automated-startup-system)
14. [Data Persistence & Reboot Safety](#-data-persistence--reboot-safety)
15. [Multi-Profile System](#-multi-profile-system)
16. [Known Quirks & Pro Tips](#-known-quirks--pro-tips)
17. [Roadmap / Ideas](#-roadmap--ideas)
18. [Contributing](#-contributing)
19. [Author](#-author)

---

## 🤔 What Is This?

This project turns your **Windows desktop into a fully interactive productivity operating system**. Instead of a static wallpaper, your desktop shows a live Next.js web app — complete with animated widgets, a real database, and full interactivity — rendered inside [Lively Wallpaper](https://github.com/rocksdanister/lively) using its built-in WebView2 (Chromium) engine.

### Why is this impressive technically?

- **No cloud. No subscriptions. 100% offline-first.** All data lives in a local SQLite file on your machine.
- **Survives reboots.** A custom VBS startup script silently launches the Next.js server in the background before Windows even loads your desktop. By the time you see your wallpaper, the server is already running.
- **Multi-profile.** Switch between completely isolated user profiles, each with their own tasks, notes, health history, stats, and preferences.
- **Persistent state across WebView2 sessions.** Lively Wallpaper's WebView2 engine wipes `localStorage` on every reload. We solved this by building a custom Zustand storage adapter that writes state to the SQLite database via a REST API instead.
- **Locked Wallpaper Memory.** You can pin any specific wallpaper so it always loads on boot, ignoring the slideshow cycle — with that preference stored in the database, surviving reboots.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Why |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side API routes + React frontend in one project |
| **UI Library** | React 19 | Latest concurrent rendering features |
| **Styling** | TailwindCSS 4 | Utility-first, glassmorphism effects |
| **Language** | TypeScript 5 | Full type safety across frontend + API |
| **State Management** | Zustand 5 + `persist` middleware | Lightweight, reactive, with custom DB-backed storage |
| **Database ORM** | Prisma 5 | Type-safe SQLite queries, auto migrations |
| **Database** | SQLite (local file) | Zero config, zero server, 100% offline |
| **Icons** | Lucide React | Consistent, clean icon set |
| **QR Codes** | qrcode.react | For UPI payment QR generation |
| **Desktop Runtime** | Lively Wallpaper (WebView2) | Renders the web app as a Windows desktop wallpaper |
| **Startup Automation** | Windows VBScript + Task Scheduler | Silent background server startup on boot |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Windows Desktop                      │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │          Lively Wallpaper (WebView2)         │    │
│  │                                              │    │
│  │   ┌─────────────────────────────────────┐   │    │
│  │   │    Next.js App  (localhost:4321)     │   │    │
│  │   │                                      │   │    │
│  │   │  React Components + Zustand Store    │   │    │
│  │   │          ↕ REST API calls            │   │    │
│  │   │  Next.js API Routes (/api/*)         │   │    │
│  │   │          ↕ Prisma ORM                │   │    │
│  │   │      SQLite Database (dev.db)        │   │    │
│  │   └─────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [Silent background: next start -p 4321 via VBS]     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
productivedashboard/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main dashboard page (all widgets assembled here)
│   ├── layout.tsx                # Root layout, metadata, font loading
│   ├── globals.css               # Global CSS reset + custom animations
│   └── api/                      # All REST API endpoints
│       ├── store/route.ts        # Read/write Zustand state to SQLite
│       ├── health/route.ts       # CRUD for health ring daily records
│       ├── wallpapers/route.ts   # List, upload, delete wallpaper files
│       ├── media/route.ts        # Stream media files (images/videos) safely
│       ├── profiles/route.ts     # Create, list, delete user profiles
│       ├── export/route.ts       # Export profile data as JSON backup
│       └── thumbnails/route.ts   # Generate/serve video thumbnails
│
├── components/                   # All React UI components
│   ├── VideoBackground.tsx       # Dynamic wallpaper renderer (image + video)
│   ├── Navbar.tsx                # Top navigation bar with quick-launch icons
│   ├── BigClock.tsx              # Large animated clock display
│   ├── DraggableClock.tsx        # Draggable wrapper for the clock widget
│   ├── DraggableWidget.tsx       # Generic drag-and-drop widget wrapper
│   ├── HealthRings.tsx           # Apple-style animated health rings
│   ├── HealthModal.tsx           # Health ring detail/logging modal
│   ├── Timer.tsx                 # Pomodoro/focus session timer
│   ├── TaskManager.tsx           # Full task management panel
│   ├── NotesManager.tsx          # Rich text notes with date-based entries
│   ├── PlansManager.tsx          # Roadmap/learning plan tracker
│   ├── Timetable.tsx             # Weekly class/work timetable grid
│   ├── Countdown.tsx             # Target date countdown widgets
│   ├── MiniCalendar.tsx          # Compact month calendar
│   ├── StatsModal.tsx            # Study/work history statistics viewer
│   ├── QuotePopup.tsx            # Motivational quote display with animation
│   ├── CustomDatePicker.tsx      # Reusable date picker component
│   └── SettingsModal.tsx         # Full settings panel (tabs: Wallpapers, Preferences, Workspaces, Data & Backup, About)
│
├── store/
│   └── dashboardStore.ts         # Zustand global store + custom SQLite-backed persistence adapter
│
├── utils/
│   └── quoteEngine.ts            # 100+ quote database + intelligent anti-repetition engine
│
├── prisma/
│   └── schema.prisma             # Database schema (Profile, DashboardStorage, HealthRecord)
│
├── public/
│   ├── wallpapers/               # Default bundled wallpaper files
│   └── branding/                 # Author photo, logo assets
│
├── setup.bat                     # 1-click automated installer script
├── start-server.vbs              # Silent VBS: starts Next.js server invisibly
├── start-lively.vbs              # Silent VBS: opens Lively Wallpaper app
└── .gitignore                    # Excludes /data, /prisma/*.db, VBS files, .env
```

---

## ⚡ Automated 1-Click Setup

> **You do NOT need to be a developer to use this.** The setup script handles everything.

### Prerequisites
- Windows 10 or 11
- An active internet connection (for the first-time install only)
- [Lively Wallpaper](https://apps.microsoft.com/detail/9ntm2qc6qws7) (Free on the Microsoft Store)

### Steps

1. **Download** this repository as a ZIP file and **extract it** to a permanent location on your PC.  
   *(Recommended: `C:\Users\YourName\Documents\ProductiveDashboard`)*

2. **Right-click `setup.bat`** → **Run as Administrator**

3. The script will automatically:
   - ✅ Check for and install Node.js if missing
   - ✅ Run `npm install` to download all dependencies
   - ✅ Generate the Prisma client and set up the SQLite database
   - ✅ Create a `.env` file with the correct database path
   - ✅ Build the production-optimized Next.js bundle
   - ✅ Create `start-server.vbs` — a silent script that starts the server with zero console windows
   - ✅ Create `start-lively.vbs` — a silent script that opens Lively Wallpaper with a delay
   - ✅ Register **two Task Scheduler tasks** to auto-run both scripts at login with Administrator privileges and auto-retry on failure

4. **Restart your PC.** The dashboard will be live at `http://localhost:4321` before you even open a browser.

---

## 🧑‍💻 Manual Developer Setup

If you want to run this in development mode and modify the code:

```bash
# 1. Clone the repository
git clone https://github.com/anandgonaboyina/Productive_Dashboard_Wallpaper.git
cd Productive_Dashboard_Wallpaper

# 2. Install dependencies
npm install

# 3. Set up environment
echo DATABASE_URL="file:./prisma/dev.db" > .env

# 4. Initialize the database
npx prisma generate
npx prisma db push

# 5. Start the dev server (with hot-reload)
npm run dev
# App runs at http://localhost:4321
```

### Build for Production

```bash
npm run build
npm run start   # Starts production server at http://localhost:4321
```

---

## 🎨 Connecting to Lively Wallpaper

Once the server is running at `http://localhost:4321`:

1. Open **Lively Wallpaper** from your Start Menu or System Tray
2. Click the **`+` (Add Wallpaper)** button
3. Select **"Enter URL / Web"**
4. Type: `http://localhost:4321`
5. Press Enter and apply it as your wallpaper

Your desktop is now a live, interactive productivity dashboard. All clicks, drags, and interactions work directly on the desktop.

---

## 🎯 All Features Deep-Dive

### 🎥 Dynamic Video & Image Wallpapers

The background of the dashboard is fully dynamic — not a static image.

- Supports **`.mp4`, `.webm`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`** formats
- Ships with **9 bundled default wallpapers** (Naruto, Kakashi, Rock Lee, Demon Slayer, Itachi, and more)
- **Upload your own**: Go to `Settings → Wallpapers → Upload Media`
- **Hide/Show**: Default wallpapers can be hidden from the cycle without deleting them
- **Slideshow Mode**: Auto-cycles through visible wallpapers at 1, 5, 10, 30, or 60 minute intervals
- **Lock Wallpaper**: Click any wallpaper in Settings to permanently pin it as your active background — it persists across reboots. Enabling slideshow or clicking "Next" clears the lock automatically
- **Video Controls**: Play/Pause and Mute/Unmute buttons appear when a video wallpaper is active

**Technical note:** Media files are served through a custom `/api/media` streaming route with proper HTTP range request support (206 Partial Content), which is required for video seeking to work correctly in WebView2.

---

### ⏰ Big Animated Clock

- Displays current time in a large, beautiful format
- Supports **12-hour (AM/PM)** and **24-hour military** format — toggle in Settings
- Fully **draggable**: click and drag to reposition on any wallpaper
- Position is **saved per-wallpaper** — different wallpapers can have the clock in different spots
- Lock/unlock dragging from `Settings → Preferences → Lock Clock`

---

### 💪 Health Rings (Apple Watch Style)

Inspired by Apple's Activity Rings, these animated circles track 5 daily habits:

| Ring | Habit | Target |
|---|---|---|
| 💧 | Water Intake | 8 glasses/day |
| 🧘 | Stretching/Exercise | 1 session/day |
| 📚 | Reading | 30 min/day |
| 🎓 | Academic Study | 2 hours/day |
| 🗣️ | English Practice | 1 session/day |

- Click any ring to **log progress** — the ring fills up with a smooth animation
- At **midnight**, rings auto-reset and the day's data is archived to the database
- Historical data is viewable in the **Stats Modal**
- Data is stored separately per profile and per date in the `HealthRecord` SQLite table

---

### ⏱️ Focus Timer (Pomodoro-Style)

A persistent, full-featured session timer:

- Set any custom duration in minutes
- Supports **start, pause, resume, and cancel**
- **Survives page refreshes**: timer state (`endAt` timestamp, `pausedLeft` milliseconds) is stored in Zustand and persisted to SQLite — reload the page and your timer picks up exactly where it left off
- Plays an **alarm sound** when time runs out
- Integrates with the **Task Manager** — start a timer directly from a task card
- Auto-deducts completed time from the task's estimated duration

---

### ✅ Task Manager

A clean, focused to-do list:

- Add tasks with a **title** and **estimated duration** in minutes
- Mark tasks as **complete** (with a satisfying strikethrough animation)
- **Delete** individual tasks
- **Start a timer** directly from a task — opens the focus timer pre-loaded with that task's duration
- All tasks persist in Zustand/SQLite and survive reboots

---

### 📝 Notes Manager (Rich Text Journal)

A multi-notebook rich text editor:

- Create **multiple separate notebooks**
- Each notebook stores **date-stamped entries** — write a note today, come back tomorrow and it auto-creates a new entry for that date
- Notes use a **contenteditable rich text** interface with basic formatting
- Entries with no content are automatically removed to keep notes clean
- All notebooks and entries persist in the main `DashboardStorage` table as JSON

---

### 🗺️ Plans & Roadmap Manager

A full learning/project roadmap tracker:

- Create **Plans** with a title, category, estimated duration, and target end date
- Add **Sub-Topics** to each plan — granular milestones
- Check off sub-topics as you complete them — visual progress bar updates in real-time
- Add a **thumbnail image** to each plan (compressed and stored as base64)
- Plans are great for tracking things like "Learn DSA", "Build Portfolio", "IELTS Prep", etc.

---

### 📅 Timetable

A weekly class/work schedule grid:

- **7-day × 9-timeslot** editable grid (Monday–Sunday, 9 AM–5 PM)
- Click any cell to edit the subject/activity for that time slot
- Pre-filled with a sample CS student schedule
- Persists in the main store

---

### ⏳ Target Countdowns

3 customizable countdown timers displayed on the desktop:

- Set a **title** and **target date** for each
- Shows days remaining in a clean format
- Updates in real-time
- Perfect for: Exam dates, project deadlines, travel plans, etc.

---

### 📅 Mini Calendar

- A compact month view showing the current month
- Today's date is highlighted
- Navigate between months
- Purely informational — great for a quick date reference at a glance

---

### 💬 Motivational Quotes Engine

An intelligent daily quote system:

- **100+ hand-curated quotes** covering productivity, stoicism, focus, and growth
- **Anti-repetition memory**: tracks recently shown quotes in a session — you won't see the same quote twice in a row
- Quotes are displayed with smooth fade animations on the wallpaper

---

### 📊 Stats & History

A visual history of your study/work sessions:

- Tracks total minutes worked **per day** (auto-logged when you complete focus timer sessions)
- Displays a **bar chart** of your last 30 days of activity
- Great for building streaks and visualizing consistency

---

### 🔗 Navbar (Quick Launch Icons)

A sleek top navigation bar with one-click launchers for:

- **WhatsApp** — opens your WhatsApp Web
- **Telegram** — opens Telegram Web
- **VS Code** — launches Visual Studio Code via the `vscode://` protocol
- **Antigravity** — links to the AI coding assistant
- All links open in new windows/tabs to avoid disrupting the wallpaper WebView2 session

---

## 🗄️ Database Schema

```prisma
// Profile: Each user workspace / person
model Profile {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
}

// DashboardStorage: Stores the entire Zustand state as a JSON blob per profile
// One row per profile (id = profileId)
model DashboardStorage {
  id        Int      @id @default(1)
  data      String   // Full serialized Zustand state JSON
  updatedAt DateTime @updatedAt
}

// HealthRecord: One row per profile per date
model HealthRecord {
  id        Int    @id @default(autoincrement())
  profileId Int    @default(1)
  date      String // "YYYY-MM-DD" format
  water     Int    @default(0)
  stretch   Int    @default(0)
  reading   Int    @default(0)
  academic  Int    @default(0)
  english   Int    @default(0)

  @@unique([profileId, date])
}
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/store?profileId=1` | Load the full Zustand state for a profile |
| `POST` | `/api/store` | Save Zustand state `{ profileId, data }` |
| `GET` | `/api/health?profileId=1` | Get all health records for a profile |
| `POST` | `/api/health` | Increment a health metric for a date |
| `DELETE` | `/api/health?action=olderThan&days=60` | Delete records older than N days |
| `GET` | `/api/wallpapers` | List all available wallpaper files |
| `POST` | `/api/wallpapers` | Upload a new wallpaper file (multipart form) |
| `DELETE` | `/api/wallpapers` | Delete a wallpaper file by filename |
| `GET` | `/api/media?file=naruto.webp` | Stream a media file with range request support |
| `GET` | `/api/profiles` | List all profiles |
| `POST` | `/api/profiles` | Create a new profile |
| `DELETE` | `/api/profiles` | Delete a profile and all its data |
| `GET` | `/api/export?profileId=1` | Download a full JSON backup of a profile |
| `GET` | `/api/thumbnails?file=video.mp4` | Get or generate a thumbnail for a video |

---

## 🧠 State Management Architecture

The state management is one of the most technically interesting parts of this project, specifically built to solve the **Lively Wallpaper / WebView2 localStorage wipe problem**.

### The Problem

Lively Wallpaper uses WebView2 (Chromium-based) to render the web app. Every time the wallpaper reloads (screen lock, reboot, Lively restart), WebView2 wipes all `localStorage` and `sessionStorage`. Standard Zustand persistence to `localStorage` doesn't survive reboots.

### The Solution: Custom SQLite-Backed Storage Adapter

We created a custom Zustand storage adapter (`fileStorage` in `dashboardStore.ts`) that:

1. **On `getItem`**: Fetches the current state from `/api/store` (SQLite) via a `GET` request. Falls back to `localStorage` only if the API is unreachable (e.g., server offline).

2. **On `setItem`**: POSTs the new state to `/api/store` (SQLite) on every state change. Falls back to `localStorage` only on API failure.

3. **On `removeItem`**: POSTs `null` data to `/api/store` to clear the profile's stored state.

```typescript
const fileStorage = createJSONStorage(() => ({
  getItem: async (_name) => {
    const res = await fetch(`/api/store?profileId=${getActiveProfileId()}`);
    const json = await res.json();
    if (json.data === null) return null; // New profile → use defaults
    if (json.data) return JSON.stringify(json.data);
    return localStorage.getItem(`dashboard-storage-${getActiveProfileId()}`); // Fallback
  },
  setItem: async (_name, value) => {
    await fetch('/api/store', {
      method: 'POST',
      body: JSON.stringify({ profileId: getActiveProfileId(), data: JSON.parse(value) }),
    });
  },
  // ...
}));
```

### What Gets Persisted vs. What Doesn't

The `partialize` config **excludes** transient UI state from being saved:

```typescript
partialize: (state) => Object.fromEntries(
  Object.entries(state).filter(([key]) => ![
    'isQuotePopupOpen', 'isTaskManagerOpen', 'isStatsOpen', 'timerTrigger',
    'isNotesOpen', 'isPlansOpen', 'isTimetableOpen', 'isHealthModalOpen', 'healthData',
    'isVideoMuted', 'isVideoPlaying', 'isSettingsOpen'
  ].includes(key))
),
```

Everything else — tasks, notes, plans, wallpaper preference, widget positions, timer state, clock format, countdowns, visibility toggles, locked wallpaper — is saved to SQLite on every change.

---

## 🖼️ Wallpaper & Background System

The background system (`VideoBackground.tsx`) is reactive and intelligent:

1. **On mount**: Fetches the list of all wallpapers from `/api/wallpapers`
2. **Filtering**: Reactively filters out any wallpapers in the `hiddenWallpapers` list from Zustand (fixes the issue where hidden wallpapers would reappear after a reboot due to async hydration timing)
3. **Locked Wallpaper Logic**: If `lockedWallpaper` (a filename string) is set in the store, that specific wallpaper is always shown regardless of the current `bgIndex`
4. **Slideshow**: If slideshow is enabled, an interval fires every N minutes to call `cycleBackground()`, which increments `bgIndex` and clears `lockedWallpaper` automatically
5. **Fallback**: If all wallpapers are hidden, falls back to `naruto.webp`
6. **Event-driven updates**: Listens for a `wallpapers-updated` custom DOM event dispatched by SettingsModal after uploads/deletes/visibility changes — triggers a fresh re-fetch

---

## 🚀 Automated Startup System

The dashboard uses a two-script VBScript system to start silently on Windows boot:

### `start-server.vbs`
```vb
' Starts Next.js production server completely invisibly (no console window)
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d ""C:\path\to\dashboard"" && npm run start", 0, False
```

### `start-lively.vbs`
```vb
' Waits 15 seconds for the server to start, then opens Lively Wallpaper
WScript.Sleep 15000
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """C:\path\to\Lively.exe""", 0, False
```

Both scripts are registered as **Windows Task Scheduler tasks** with:
- Trigger: **At user logon**
- Run with **highest privileges** (Administrator)
- Auto-restart on failure: **3 retries, 1 minute apart**
- Run whether or not user is logged on

---

## 🔒 Data Persistence & Reboot Safety

| Data Type | Storage Location | Survives Reboot? |
|---|---|---|
| Tasks, Notes, Plans | SQLite via `/api/store` | ✅ Yes |
| Health Records | SQLite `HealthRecord` table | ✅ Yes |
| Widget Positions (per wallpaper) | SQLite via `/api/store` | ✅ Yes |
| Locked Wallpaper Preference | SQLite via `/api/store` | ✅ Yes |
| Hidden Wallpapers List | SQLite via `/api/store` | ✅ Yes |
| Active Profile ID | `localStorage` (persists in WebView2 across sessions) | ✅ Yes |
| Timer State (`endAt`, `pausedLeft`) | SQLite via `/api/store` | ✅ Yes |
| Uploaded Wallpaper Files | `/public/wallpapers/` folder on disk | ✅ Yes |
| Modal open/closed states | In-memory Zustand only | ❌ No (intentional) |

---

## 👥 Multi-Profile System

The dashboard supports multiple completely isolated user profiles ("Workspaces"):

- **Profile 1 (Default)** is created automatically and cannot be deleted
- Create additional profiles in `Settings → Workspaces → Create New Workspace`
- Switching profiles **reloads the page** — the new profile's data is fetched fresh from SQLite
- Each profile has its own:
  - Tasks, Notes, Plans, Timetable
  - Health history
  - All preferences (clock format, widget visibility, widget positions, etc.)
  - Slideshow settings and wallpaper preferences
- Deleting a profile permanently removes all its data (except uploaded media files, which are shared)
- Active profile ID is stored in `localStorage` under `dashboard-active-profile`

---

## 🕵️ Known Quirks & Pro Tips

### Lively Wallpaper Focus Bug
Lively Wallpaper occasionally loses mouse focus when you click heavily on the desktop or switch between apps. **If a button isn't responding**, click an empty area on the desktop first (to give Lively focus), then click your target button. This is a known Lively/WebView2 limitation, not a bug in this app.

### First Boot Delay
On the very first boot after running `setup.bat`, the Task Scheduler task takes ~5-20 seconds to start the server. If you see your wallpaper loading as a plain Next.js error screen, wait 15-20 seconds and it will resolve itself.

### Video Wallpaper Autoplay
Browsers require user interaction before playing audio. When a video wallpaper first loads, it auto-plays muted (to satisfy browser autoplay policies), then restores your saved mute preference immediately after. This causes a brief "muted then unmuted" flash — it's expected behavior.

### Widget Dragging
- Widgets must be **unlocked** in `Settings → Preferences → Widget Layout` to be draggable
- Positions are saved **per wallpaper** — changing your wallpaper will load positions you set specifically for that background
- Use "Reset Default Positions" in Settings to return all widgets for the current wallpaper to their original positions

---

## 🗺️ Roadmap / Ideas

- [ ] **AI Voice Assistant** — Gemini-powered voice interface with avatar overlay
- [ ] **Pomodoro Statistics** — Track focus sessions and break compliance over time
- [ ] **Weather Widget** — Real-time local weather via a free API
- [ ] **Spotify / Music Widget** — Currently playing song integration
- [ ] **Goal Streaks** — Visual streak tracker for daily habit completion
- [ ] **Custom Quotes** — Let users add their own quotes to the engine
- [ ] **Dark/Light Theme Toggle** — Alternative light glassmorphism theme
- [ ] **Mobile Companion App** — View and edit tasks from your phone

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are very welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear commit messages
4. Push your branch and open a Pull Request

Please follow the existing code style (TypeScript strict, functional React components, Zustand for state).

---

## 👨‍💻 Author

**Gonaboyina Anand Kumar**

Built from scratch as a personal productivity tool that became a full-featured project. Every component, API, database schema, startup script, and automation was designed and implemented hands-on.

- 🔗 GitHub: [@anandgonaboyina](https://github.com/anandgonaboyina)
- 💬 Telegram: Available via the dashboard Navbar
- ☕ Support the project via UPI: `gonaboyinaanandkumar@ybl`

---

> *"The secret of getting ahead is getting started."* — Mark Twain

**Made with ❤️ for working more efficiently every single day.**