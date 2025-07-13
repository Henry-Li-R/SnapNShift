import TaskInput from "./TaskInput";
import {
  applyPushMode,
  applyCompressMode,
  timeStrToMinutes,
} from "../utils/reschedule";

export default function TaskPanel({
  tasks,
  setTasks,
  onAdd,
  onPreviewReschedule,
  onRescheduleConfirm,
  onRescheduleCancel,
  showOverlay,
}) {
  // Check if any task starts in the past (with optional buffer), disallowing compression
  const hasPastIncompleteTasks = tasks.some((task) => {
    if (task.completed || !task.startTime || task.duration == null)
      return false;
    const startTimeMinutes = timeStrToMinutes(task.startTime);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const buffer = 1;
    return startTimeMinutes - buffer < nowMinutes;
  });

  // Render task input, import/export, and rescheduling controls
  return (
    <>
      <TaskInput onAdd={onAdd} />
      <div className="mt-4 space-y-2 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-600">Task Management</h3>
        {tasks.length > 0 && (
          <button
            onClick={() => setTasks([])}
            className="mt-4 text-sm text-gray-500 hover:underline"
          >
            Clear all
          </button>
        )}
        {/* Export current tasks to JSON file */}
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(tasks, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "snapnshift-tasks.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export tasks
        </button>
        {/* Import tasks from a JSON file */}
        <input
          type="file"
          accept="application/json"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                  setTasks(importedTasks);
                } else {
                  alert("Invalid file format.");
                }
              } catch (err) {
                console.error("Failed to import tasks:", err);
                alert("Failed to import tasks.");
              }
            };
            reader.readAsText(file);
          }}
        />
      </div>

      <div className="mt-4 space-y-2 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-600">Reschedule</h3>
        {/* Apply push mode and show a preview of rescheduled tasks */}
        <span title={tasks.length === 0 ? "No tasks to reschedule." : ""}>
          <button
            onClick={() => {
              const now = new Date();
              const currentTimeStr = `${now
                .getHours()
                .toString()
                .padStart(2, "0")}:${now
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;
              const [updated, skippedTasks] = applyPushMode(
                tasks,
                currentTimeStr
              );
              onPreviewReschedule(updated, skippedTasks);
            }}
            className="mt-4 mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            disabled={tasks.length === 0}
          >
            Push Now
          </button>
        </span>
        <span
          title={
            tasks.length === 0
              ? "No tasks to reschedule."
              : hasPastIncompleteTasks
              ? "Cannot compress: a past task is incomplete."
              : ""
          }
        >
          {/* Apply compress mode and show a preview of rescheduled tasks */}
          <button
            onClick={() => {
              const now = new Date();
              const currentTimeStr = `${now
                .getHours()
                .toString()
                .padStart(2, "0")}:${now
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;
              const updated = applyCompressMode(tasks, currentTimeStr);
              onPreviewReschedule(updated, []);
            }}
            className="mt-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={tasks.length === 0 || hasPastIncompleteTasks}
          >
            Compress Now
          </button>
        </span>
        {/* Show confirm/cancel buttons only when overlay is active */}
        {showOverlay && (
          <div className="mt-2 flex space-x-4">
            <button
              onClick={onRescheduleConfirm}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Confirm Reschedule
            </button>
            <button
              onClick={onRescheduleCancel}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              Cancel Reschedule
            </button>
          </div>
        )}
      </div>
    </>
  );
}
