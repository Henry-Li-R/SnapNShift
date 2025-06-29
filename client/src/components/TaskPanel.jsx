import TaskInput from "./TaskInput";
import { applyPushMode, applyCompressMode } from "../utils/rescheduleUtils";

export default function TaskPanel({
  tasks,
  setTasks,
  onAdd,
  taskToString,
  onPreviewReschedule,
  onRescheduleConfirm,
  onRescheduleCancel
}) {
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
            const [updated, skippedTasks] = applyPushMode(tasks, currentTimeStr);
            alert(
              `Push mode applied.\n${skippedTasks.length} task(s) could not be scheduled and were skipped.`
            );
            console.log(
              "Skipped tasks:\n" + skippedTasks.map(taskToString).join("\n")
            );
            onPreviewReschedule(updated, skippedTasks);
          }}
          className="mt-4 mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Push Now
        </button>
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
            alert(`Compress Mode applied.`);
            onPreviewReschedule(updated, []);
          }}
          className="mt-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Compress Now
        </button>
        {onRescheduleConfirm && onRescheduleCancel && (
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
