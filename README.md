# SnapShift

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
- [ ] Manual skip toggle before reschedule
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

### Push Mode (Start Now)
- All non-fixed tasks are re-anchored from current time
- Task durations remain the same
- Fixed tasks stay locked

### Compress Mode
- Available time = Now → Day End (e.g., 9 PM)
- Non-skippable tasks are scaled to fit
- Skippable tasks dropped if not enough space

---

## 🔮 Designed for Future Extensions

Already structured to support:
- Task types and time-of-day preference
- Reflective prompts or feedback (“Why was this rescheduled?”)
- Analytics (e.g., completion %, avg. overrun, skipped tasks)
- Smart templates / recurring blocks

---

## 💻 Stack

- **Frontend**: React + Tailwind CSS
- **State**: useState / useEffect (or Zustand later)
- **Persistence**: LocalStorage only (MVP)

---

## 📌 Core User Story

> I open SnapShift. I’m running 40 minutes late. I click "Shift Now." My whole day adjusts. I keep going — no stress, no mess.

---

## 🛣️ Next Steps (Issue Ideas)

- [ ] Task creation and timeline rendering UI
- [ ] Reschedule logic (Push + Compress modes)
- [ ] LocalStorage for persistent task list
- [ ] UI polish with basic mobile responsiveness

---

## Known Limitations
- Push mode uses greedy scheduling: shorter tasks may be skipped if preceded by a long task that can’t fit.

---

Let’s build something that makes imperfect days feel productive again.
