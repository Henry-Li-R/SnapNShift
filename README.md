# SnapNShift

A minimal, offline-first scheduling tool that helps you **reschedule your day quickly** when things go off track.

---

## 🧠 Problem

Most productivity tools assume you’ll follow your plan exactly. In reality, we start tasks late, run over time, or need to skip things — and then our whole plan falls apart.

SnapShift is designed for **adaptive scheduling**: one-click rescheduling when life gets in the way.

---

## 🎯 MVP Goals

- Enable quick planning of today’s schedule
- Allow users to easily reschedule all tasks if they fall behind
- Keep the app lightweight, fast, and local-only

---

## 🔧 Features (MVP)

- [ ] Create tasks with duration (e.g., 45 min)
- [ ] Display tasks in a timeline view
- [ ] "Start Now" rescheduler (Push Mode): reschedules all tasks to start from current time
- [ ] Compress Mode: reschedules tasks to fit into remaining time until fixed day end
- [ ] Mark tasks as fixed or skippable
- [ ] Local storage only (no account required)

---

## 🗂️ Task Schema

```json
{
  "title": "Write chemistry report",
  "duration": 60,
  "startTime": "09:00",   // optional
  "priority": 2,           // 1 = low, 3 = high
  "type": "focus",        // optional: focus, light, admin
  "fixed": false,          // true if cannot move
  "skippable": true        // false if must be kept during compression
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

## 💻 Stack

- **Frontend**: React + Tailwind CSS
- **State**: useState / useEffect (or Zustand later)
- **Persistence**: LocalStorage only (MVP)

---

## 📌 Core User Story

> I open SnapShift. I’m running 40 minutes late. I click "Shift Now." My whole day adjusts. I keep going — no stress, no mess.

---

## 🛣️ Next Steps
🧱 Foundation First
	1.	Deploy to web so others can try it (e.g., Vercel, Netlify)
	2.	Add backend with basic auth and schedule storage
	3.	Allow users to save/load their schedules
	4.	Prepare for future features like settings, analytics, and cross-device sync (e.g., data models, endpoints)
	5.	(Optional) Integrate with external calendars (e.g., Google Calendar API)

⸻

🔧 Product Features (Dependent on backend)
	1.	Undo actions like Clear, Delete, Push, and Compress
	2.	User settings (e.g., buffer time, day start/end time)
	3.	Support multi-day scheduling (e.g., rollover skipped tasks across days)
	4.	Overlay or side-by-side comparisons of old vs. new schedules

⸻

🎨 UI Enhancements
	1.	Timeline → time-grid layout (visually align task blocks by time)
	2.	Improve mobile responsiveness and UX for task editing & timeline interaction

⸻

🧠 Logic Improvements
	1.	Fine-tune Push / Compress logic (respect constraints, fix inefficiencies)
	2.	Add input validation (e.g., conflicting times, invalid durations, duplicate entries)


## 🔮 Potential Extensions
- Task types and time-of-day preference
- Analytics (e.g., completion %, avg. overrun, skipped tasks)
- Smart templates / recurring blocks
- Schedule rating after day ends -> to improve rescheduling algorithm





---

Let’s build something that makes imperfect days feel productive again.
