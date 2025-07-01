const DAY_END = 24 * 60; // end of day: 12 AM

const BUFFER_BETWEEN_TASKS = 5; // in minutes

/* Helpers: Conversion between time formats */
export function timeStrToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeStr(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/* Push Mode Rescheduling Logic */
function applyPushMode(tasks, currentTimeStr) {
  const clonedTasks = tasks.map((task) => ({ ...task }));

  // Separate fixed and non-fixed tasks
  const fixedTasks = clonedTasks
    .filter((task) => task.fixed && !task.completed)
    .sort(
      (a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime)
    );

  const nonFixedTasks = clonedTasks
    .filter((task) => !task.fixed && !task.completed)
    .sort((a, b) => {
      if (a.skippable === b.skippable) {
        return timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime);
      }
      return a.skippable ? 1 : -1; // non-skippable first
    });

  let pointer = timeStrToMinutes(currentTimeStr);
  const scheduledTasks = [];

  // Attempt to find slot and reschedule each non-fixed task
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
    pointer = newStart + task.duration + BUFFER_BETWEEN_TASKS;
    scheduledTasks.push({ ...task });
  }

  const completedTasks = clonedTasks.filter((task) => task.completed);
  const skippedTasks = clonedTasks.filter((task) => task.skipped);

  // Return all scheduled tasks sorted by startTime
  return [
    [...fixedTasks, ...completedTasks, ...scheduledTasks].sort((a, b) => {
      const aTime = a.startTime ? timeStrToMinutes(a.startTime) : Infinity;
      const bTime = b.startTime ? timeStrToMinutes(b.startTime) : Infinity;
      return aTime - bTime;
    }),
    skippedTasks,
  ];
}

/* Find earliest non-conflicting time slot starting from pointer */
function findNextAvailableSlot(task, pointer, fixedTasks, scheduledTasks) {
  let candidateStart = Math.max(pointer, 0);

  while (candidateStart + task.duration <= DAY_END) {
    const conflict = fixedTasks.concat(scheduledTasks).some((otherTask) => {
      const otherStart = timeStrToMinutes(otherTask.startTime);
      const otherEnd = otherStart + otherTask.duration + BUFFER_BETWEEN_TASKS;
      const candidateEnd = candidateStart + task.duration + BUFFER_BETWEEN_TASKS;
      return candidateStart < otherEnd && otherStart < candidateEnd;
    });
    if (!conflict) {
      return Math.max(timeStrToMinutes(task.startTime), candidateStart);
    }
    candidateStart++;
  }

  return null;
}

/* Compress Mode Rescheduling Logic */
function applyCompressMode(tasks, currentTimeStr) {
  const clonedTasks = tasks.map((task) => ({ ...task }));

  // Separate fixed and non-fixed tasks
  const fixedTasks = clonedTasks
    .filter((task) => task.fixed && !task.completed)
    .sort(
      (a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime)
    );

  const nonFixedTasks = clonedTasks
    .filter((task) => !task.fixed && !task.completed)
    .sort((a, b) => {
      return timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime);
    });

  const scheduledTasks = [];
  let pointer = timeStrToMinutes(currentTimeStr);

  // Compress non-fixed tasks leftwards if possible
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
      pointer = newStart + task.duration + BUFFER_BETWEEN_TASKS;
    } else {
      pointer = originalStart + task.duration + BUFFER_BETWEEN_TASKS;
    }

    scheduledTasks.push({ ...task });
  }

  const completedTasks = clonedTasks.filter((task) => task.completed);

  // Return all tasks sorted by updated start time
  const finalTasks = [...fixedTasks, ...scheduledTasks, ...completedTasks].sort(
    (a, b) => {
      const aTime = a.startTime ? timeStrToMinutes(a.startTime) : Infinity;
      const bTime = b.startTime ? timeStrToMinutes(b.startTime) : Infinity;
      return aTime - bTime;
    }
  );

  return finalTasks;
}

/* Utility: Find earliest time slot to left-shift task */
function findEarliestAvailableSlot(task, pointer, fixedTasks, scheduledTasks) {
  const allTasks = fixedTasks.concat(scheduledTasks);
  let candidateStart = pointer;

  while (candidateStart + task.duration <= DAY_END) {
    const conflict = allTasks.some((other) => {
      const otherStart = timeStrToMinutes(other.startTime);
      const otherEnd = otherStart + other.duration + BUFFER_BETWEEN_TASKS;
      const candidateEnd = candidateStart + task.duration + BUFFER_BETWEEN_TASKS;
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
