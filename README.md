# SnapNShift

A minimal, offline-first scheduling tool that helps you **reschedule your day quickly** when things go off track.

---

## 🧠 Problem

Most productivity tools assume you’ll follow your plan exactly. In reality, we start tasks late, run over time, or need to skip things — and then our whole plan falls apart.

SnapNShift is designed for **adaptive scheduling**: one-click rescheduling when life gets in the way.

---

## 🎯 MVP Goals

- Enable quick planning of today’s schedule
- Allow users to easily reschedule all tasks if they fall behind
- Keep the app lightweight, fast, and local-only

---

## 🔧 Features

- Display tasks in a timeline view
- Edit, drag, and resize task blocks
- Push Mode: reschedules all tasks to start from current time
- Compress Mode: reschedules tasks to fit into remaining time until fixed day end
- Overlay comparisons of old vs. new schedules

---

## 🗂️ Sample Task Schema

```json
{
  "text": "Write chemistry report",
  "duration": 60, // minutes
  "startTime": "19:00",
  "fixed": true,          // true if cannot move
  "skippable": true,       // if too many tasks are not done, a task may be skipped upon reschedule
  "completed": true, 
}
```

---

## 🔁 Rescheduling Modes

### Push Mode
- Use case: need rescheduling when falling behind
- All non-fixed, incomplete tasks are rescheduled to start sequentially from the current time, mostly preserving their original order.

### Compress Mode
- Use case: fast-tracking when ahead of schedule
- All non-fixed, incomplete tasks are shifted earlier in the day if possible, filling available time slots before their original start time.

---
⚙️ **Config Notes**
- The current day end is configured as 12:00 AM (i.e., 24 * 60 minutes).
- A default buffer of 15 minutes is enforced between tasks during rescheduling.
These can be adjusted in `client/src/utils/rescheduleUtils.js`.

- The interval by which tasks can be dragged or resized is set to 15 minutes. This can be adjusted in `client/src/components/Timeline.jsx`.

- The JWT token is stored in localStorage for simplicity; consider more secure storage (e.g. HttpOnly cookies) for sensitive applications.

---

## 💻 Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Express
- **Persistence**: LocalStorage (guest) and PostgreSQL with Prisma (user)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Henry-Li-R/SnapNShift.git
cd SnapNShift
```

### 2. Set up the backend

```bash
cd server
touch .env   # Fill in DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_ORIGIN, and PORT
npm install
npx prisma generate
npx prisma migrate dev  # optional: use `reset` if needed
```

### 3. Set up the frontend

```bash
cd ../client
npm install
```

### 4. Start both servers (concurrently)

From the root directory:

```bash
npm install
npm run dev
```

---

## 📌 Core User Story

> I open SnapNShift. I’m running 40 minutes late. I click "Shift Now." My whole day adjusts. I keep going — no stress, no mess.

---

## 🛣️ Next Steps
 
	1. Support multi-day scheduling (e.g., rollover skipped tasks across days)

	2. Settings
	
	3. Analytics

	4. (Optional) Integrate with external calendars (e.g., Google Calendar API)
 

⸻

🧠 Logic Improvements

	1.	Fine-tune Push / Compress logic (respect constraints, fix inefficiencies)
 
	2.	Improve input validation (e.g., conflicting times, duplicate entries)


## 🔮 Potential Extensions
- Task types and time-of-day preference
- Analytics (e.g., completion %, avg. overrun, skipped tasks)
- Smart templates / recurring blocks
- Schedule rating after day ends -> to improve rescheduling algorithm





---

Let’s build something that makes imperfect days feel productive again.
