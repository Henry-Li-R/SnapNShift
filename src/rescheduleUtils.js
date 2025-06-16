const DAY_END = 21 * 60; // 9:00 PM

/* Helpers */
function timeStrToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeStr(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/* Push Mode */
/**
 * Applies push mode rescheduling to tasks.
 * @param {Array} tasks - Array of task objects. Each task has:
 *   - startTime: string (e.g., "14:30") or null
 *   - duration: number (minutes)
 *   - fixed: boolean
 * @param {string} currentTimeStr - Current time as string (e.g., "15:00")
 */
function applyPushMode(tasks, currentTimeStr) {
  // Separate fixed and non-fixed tasks
  const fixedTasks = tasks
    .filter((task) => task.fixed)
    .sort(
      (a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime)
    );

  const nonFixedTasks = tasks
    .filter((task) => !task.fixed && !task.completed && !task.skipped)
    .sort((a, b) => {
      if (a.skippable === b.skippable) return 0;
      return a.skippable ? 1 : -1; // non-skippable first
    });

  let pointer = timeStrToMinutes(currentTimeStr);
  const scheduledTasks = [];

  for (const task of nonFixedTasks) {
    const newStart = findNextAvailableSlot(
      task,
      pointer,
      fixedTasks,
      scheduledTasks
    );
    if (newStart === null) {
      task.skipped = true;
      continue;
    }
    task.startTime = minutesToTimeStr(newStart);
    task.skipped = false;
    pointer = newStart + task.duration;
    scheduledTasks.push({ ...task });
  }
  fallbackReschedule(nonFixedTasks, pointer, fixedTasks, scheduledTasks);

  const completedTasks = tasks.filter((task) => task.completed);
  const skippedTasks = tasks.filter((task) => task.skipped);
  return [
    [...fixedTasks, ...completedTasks, ...scheduledTasks].sort((a, b) => {
      const aTime = a.startTime ? timeStrToMinutes(a.startTime) : Infinity;
      const bTime = b.startTime ? timeStrToMinutes(b.startTime) : Infinity;
      return aTime - bTime;
    }),
    skippedTasks,
  ];
}

function findNextAvailableSlot(task, pointer, fixedTasks, scheduledTasks) {
  let candidateStart = Math.max(pointer, 0);

  while (candidateStart + task.duration <= DAY_END) {
    const conflict = fixedTasks.concat(scheduledTasks).some((otherTask) => {
      const otherStart = timeStrToMinutes(otherTask.startTime);
      const otherEnd = otherStart + otherTask.duration;
      const candidateEnd = candidateStart + task.duration;
      return candidateStart < otherEnd && otherStart < candidateEnd;
    });
    if (!conflict) {
      return candidateStart;
    }
    candidateStart++;
  }

  return null;
}

function fallbackReschedule(tasks, pointer, fixedTasks, scheduledTasks) {
  const unscheduled = tasks.filter((task) => task.skipped && !task.completed);

  for (let time = pointer; time < DAY_END; time++) {
    for (const task of unscheduled) {
      const conflict = fixedTasks.concat(scheduledTasks).some((otherTask) => {
        const otherStart = timeStrToMinutes(otherTask.startTime);
        const otherEnd = otherStart + otherTask.duration;
        const taskEnd = time + task.duration;
        return time < otherEnd && otherStart < taskEnd;
      });
      if (!conflict && time + task.duration <= DAY_END) {
        task.startTime = minutesToTimeStr(time);
        task.skipped = false;
        scheduledTasks.push({ ...task });
        break;
      }
    }
  }
}

/* Compress code */
/**
 * Applies compress mode to optimize task layout.
 * Compress mode moves non-fixed tasks earlier in the day if possible,
 * without violating task constraints or overlapping fixed tasks.
 * 
 * Tasks are prioritized:
 *   1. Non-skippable tasks
 *   2. Earlier originally scheduled tasks
 *
 * Fixed and completed tasks are preserved.
 * Skipped tasks are not affected.
 *
 * @param {Array} tasks - Array of task objects. Each task may include:
 *   - startTime: string (e.g., "14:30")
 *   - duration: number (minutes)
 *   - fixed: boolean
 *   - completed: boolean
 *   - skippable: boolean
 * @param {string} currentTimeStr - Current time as a string (e.g., "12:00")
 * @returns {Array} New array of rescheduled tasks, sorted by startTime.
 */
function applyCompressMode(tasks, currentTimeStr) {
  const fixedTasks = tasks
    .filter((task) => task.fixed)
    .sort(
      (a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime)
    );

  const nonFixedTasks = tasks
    .filter((task) => !task.fixed && !task.completed)
    .sort((a, b) => {
      if (a.skippable === b.skippable) {
        return timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime);
      }
      return a.skippable ? 1 : -1;
    });

  const scheduledTasks = [];
  let pointer = timeStrToMinutes(currentTimeStr);

  for (const task of nonFixedTasks) {
    const originalStart = timeStrToMinutes(task.startTime);
    const newStart = findEarliestAvailableSlot(
      task,
      pointer,
      fixedTasks,
      scheduledTasks
    );

    if (newStart < originalStart) {
      task.startTime = minutesToTimeStr(newStart);
    }

    scheduledTasks.push({ ...task });
    pointer = Math.max(pointer, newStart + task.duration);
  }

  const completedTasks = tasks.filter((task) => task.completed);

  const finalTasks = [...fixedTasks, ...scheduledTasks, ...completedTasks].sort(
    (a, b) => {
      const aTime = a.startTime ? timeStrToMinutes(a.startTime) : Infinity;
      const bTime = b.startTime ? timeStrToMinutes(b.startTime) : Infinity;
      return aTime - bTime;
    }
  );

  return finalTasks;
}

function findEarliestAvailableSlot(task, pointer, fixedTasks, scheduledTasks) {
  const allTasks = fixedTasks.concat(scheduledTasks);
  let candidateStart = pointer;

  while (candidateStart + task.duration <= DAY_END) {
    const conflict = allTasks.some((other) => {
      const otherStart = timeStrToMinutes(other.startTime);
      const otherEnd = otherStart + other.duration;
      const candidateEnd = candidateStart + task.duration;
      return candidateStart < otherEnd && otherStart < candidateEnd;
    });

    if (!conflict) {
      return candidateStart;
    }
    candidateStart++;
  }

  return timeStrToMinutes(task.startTime); // fallback to original
}

export { applyPushMode, applyCompressMode };

// Edge case unit test for applyPushMode
/*
function runTest() {
  const tasks = [
    // Fixed task blocking the only viable time window
    { id: 1, text: "Fixed Task", duration: 60, startTime: "14:00", fixed: true, completed: false },

    // Task that should be skipped due to no available slot
    { id: 2, text: "Too Long Task", duration: 300, startTime: "14:30", fixed: false, completed: false },

    // Already skipped task, should remain unchanged
    { id: 3, text: "Previously Skipped", duration: 30, startTime: null, fixed: false, completed: false, skipped: true },

    // Completed task, should be ignored
    { id: 4, text: "Completed Task", duration: 45, startTime: "15:30", fixed: false, completed: true }
  ];

  const currentTimeStr = "14:30";
  applyPushMode(tasks, currentTimeStr);
  console.log("Updated tasks (edge cases):", tasks);
}

runTest();
*/
