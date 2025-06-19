import { useState, useEffect } from "react";
import TaskInput from "./components/TaskInput";
import { applyPushMode, applyCompressMode } from './rescheduleUtils';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const handleAdd = ({ text, duration, startTime, fixed, skippable, completed}) => {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text, duration, startTime, fixed, skippable, completed },
    ]);
  };

  const taskToString = task => (
   `[${task.startTime || '--:--'}] ${task.text} (${task.duration}m)` +
    (task.fixed ? ' [Fixed]' : '') +
    (task.completed ? ' [Done]' : '') +
    (task.skipped ? ' [Skipped]' : '')
  );
  /*
  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };
  */
  useEffect(() => {
    const saved = localStorage.getItem("snapshift-tasks");
    if (saved) {
      //console.log("Loaded from storage:", saved);
      setTasks(JSON.parse(saved));
    }
    setInitialized(true); // run the useEffect() below AFTER initilized
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem("snapshift-tasks", JSON.stringify(tasks));
    }
  }, [tasks, initialized]);

  return (
    <div className="grid grid-cols-2 gap-8 px-4">
      <div className="col-span-1">
        <h1 className="text-2xl font-bold mb-4">SnapShift</h1>
        <TaskInput onAdd={handleAdd} />
        {/* List of tasks (with description and button to delete task) */}
        {/*
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border px-4 py-2 rounded flex justify-between items-center"
            >
              <span>
                {" "}
                [{task.duration} min] {task.text}{" "}
              </span>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-500 hover:underline text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        */}
        {/* Button to delete all tasks */}
        {tasks.length > 0 && (
          <button
            onClick={() => setTasks([])}
            className="mt-4 text-sm text-gray-500 hover:underline"
          >
            Clear all
          </button>
        )}
        {/*Export Tasks*/}
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(tasks, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "snapshift-tasks.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export tasks as JSON
        </button>
        {/* Import Tasks */}
        <input
          type="file"
          accept="application/json"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();

            reader.onload = (e) => {
              try {
                // can add more structural validation
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
        <br/>
        {/* Push Now Button */}
        <button
          onClick={() => {
            const now = new Date();
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const [updated, skippedTasks] = applyPushMode(tasks, currentTimeStr);
            setTasks(updated);
            alert(`${skippedTasks.length} task(s) could not be scheduled and were skipped.`);
            console.log("Skipped tasks:\n" + skippedTasks.map(taskToString).join('\n'));
          }}
          className="mt-4 mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Push Now
        </button>
        <button
          onClick={() => {
            const now = new Date();
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const updated = applyCompressMode(tasks, currentTimeStr);
            setTasks(updated);
          }}
          className="mt-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Compress Now
        </button>
      </div>

      {/* Timeline */}
      <div className="col-span-1">
        <h2 className="text-lg font-semibold mt-8 mb-2">Timeline</h2>
        <div className="space-y-1 border-l-2 border-gray-400 pl-4">
          {tasks
            .filter((task) => task.startTime)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((task) => (
              <div key={task.id} className="relative">
                <div
                  className="absolute -left-4 text-xs text-gray-500"
                  style={{ top: 0 }}
                >
                  {task.startTime}
                </div>
                <div className="bg-blue-100 p-2 rounded-md shadow-sm">
                  {task.text} ({task.duration} min)
                  {task.fixed && " [Fixed]"}
                  {task.completed && " [Done]"}
                  {task.skipped && " [Skipped]"}
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}
