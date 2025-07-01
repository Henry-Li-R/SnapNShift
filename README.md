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

## 🔧 Features (MVP)

- [ ] Create tasks with duration (e.g., 45 min)
- [ ] Display tasks in a timeline view
- [ ] "Start Now" rescheduler (Push Mode): reschedules all tasks to start from current time
- [ ] Compress Mode: reschedules tasks to fit into remaining time until fixed day end
- [ ] Mark tasks as fixed or skippable
- [ ] Local storage only (no account required)


- Overlay comparisons of old vs. new schedules
---

## 🗂️ Sample Task Schema

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
⚙️ **Config Notes**
- The current day end is configured as 12:00 AM (i.e., 24 * 60 minutes).
- A default buffer of 5 minutes is enforced between tasks during rescheduling.
These can be adjusted in `utils/rescheduleUtils.js`.

**Note:** If there are incomplete tasks earlier in the day, using Compress Mode may shift later tasks d them unintentionally. To avoid this, Compress Mode is disabled temporarily at such times; use **Push Mode first** to realign all tasks starting from now, then optionally Compress.

---

## 💻 Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Express
- **Persistence**: LocalStorage (guest) and file-based server persistence (user)

---

## 📦 Installation

Clone the repository:
```bash
git clone https://github.com/Henry-Li-R/SnapNShift.git
cd SnapNShift
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
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
 
	2.	Add input validation (e.g., conflicting times, invalid durations, duplicate entries)


## 🔮 Potential Extensions
- Task types and time-of-day preference
- Analytics (e.g., completion %, avg. overrun, skipped tasks)
- Smart templates / recurring blocks
- Schedule rating after day ends -> to improve rescheduling algorithm





---

Let’s build something that makes imperfect days feel productive again.
