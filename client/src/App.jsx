import { useState, useEffect } from "react";
// Import necessary components and utilities
import TaskPanel from "./components/TaskPanel";
import AuthPrompt from "./components/AuthPrompt";
import Timeline from "./components/Timeline";
import { fetchWithAuth } from "./utils/fetchWithAuth";
import { v4 as uuid } from 'uuid';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  // App state for tasks, authentication, and rescheduling
  const [tasks, setTasks] = useState([]);
  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);
  const [authMode, setAuthMode] = useState(null); // 'guest' | 'user'

  const [rescheduledTasks, setRescheduledTasks] = useState([]);
  const [skippedTasks, setSkippedTasks] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  // Triggered when rescheduling is previewed
  const handlePreviewReschedule = (updated, skipped) => {
    setRescheduledTasks(updated);
    setSkippedTasks(skipped);
    setShowOverlay(true);
  };

  // Apply the rescheduled task list
  const handleRescheduleConfirm = () => {
    rescheduledTasks.forEach(task => delete task.skipped);
    setTasks(rescheduledTasks);
    setRescheduledTasks([]);
    setSkippedTasks([]);
    setShowOverlay(false);
  };

  // Cancel the rescheduling preview
  const handleRescheduleCancel = () => {
    setRescheduledTasks([]);
    setSkippedTasks([]);
    setShowOverlay(false);
  };

  // On load, if a valid token exists, set authMode to "user"
  useEffect(() => {
    fetchWithAuth({ url: `${BASE_URL}/auth/verify`, alertUser: false })
      .then((res) => {
        if (res.ok) {
          setAuthMode("user");
        } 
      })
      .catch(() => {
        console.log("No valid session, prompting login.");
      });
  }, []);

  // Adds a new task to state
  const handleAdd = ({
    text,
    duration,
    startTime,
    fixed,
    skippable,
    completed,
  }) => {
    setTasks((prev) => [
      ...prev,
      {
        id: uuid(),
        text,
        duration,
        startTime,
        fixed,
        skippable,
        completed,
      },
    ]);
  };

  // Load tasks from localStorage or server, depending on auth mode
  useEffect(() => {
    if (authMode === "guest") {
      const saved = localStorage.getItem("snapnshift-tasks");
      if (saved) {
        setTasks(JSON.parse(saved));
      }
      setHasLoadedTasks(true);
    }

    if (authMode === "user") {
      fetchWithAuth({ url: `${BASE_URL}/user/tasks` })
        .then((res) => res.json())
        .then((data) => {
          setTasks(data);
          setHasLoadedTasks(true);
        })
        .catch((err) => {
          console.error("Failed to load user tasks:", err);
        });
    }
  }, [authMode]);

  // Persist tasks to storage after they have loaded
  useEffect(() => {
    if (!hasLoadedTasks) return;

    if (authMode === "guest") {
      localStorage.setItem("snapnshift-tasks", JSON.stringify(tasks));
    }

    if (authMode === "user") {
      fetchWithAuth({
        url: `${BASE_URL}/user/tasks`,
        alertUser: true,
        options: {
          method: "POST",
          body: JSON.stringify(tasks),
        },
      }).catch((err) => {
        console.error("Failed to save user tasks:", err);
      });
    }
  }, [tasks, hasLoadedTasks, authMode]);

  // Prompt user to choose login/register or guest mode
  if (authMode === null) {
    return (
      <div className="p-8 space-y-4">
        <h2 className="text-xl font-bold">Welcome to snapnshift</h2>
        <p>Please choose how you'd like to continue:</p>
        <div className="space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setAuthMode("authAttempt")}
          >
            Login / Register
          </button>
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setAuthMode("guest")}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  // Show authentication prompt if auth attempt is underway
  if (authMode === "authAttempt") {
    return <AuthPrompt onAuthSuccess={() => setAuthMode("user")} />
  }

  // Main app UI: TaskPanel and Timeline side by side
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-4 py-8">
      {/* logout */}
      {authMode === "user" && (
        <button
          onClick={() => {
            localStorage.removeItem("snapnshift-token");
            setHasLoadedTasks(false);
            setAuthMode(null); // return to welcome screen
          }}
          className="absolute top-4 right-4 text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      )}
      {/* task panel, to add or reschedule tasks */}
      <div className="col-span-1">
        <h1 className="text-2xl font-bold mb-4">snapnshift</h1>
        <TaskPanel
          tasks={tasks}
          setTasks={setTasks}
          onAdd={handleAdd}
          onPreviewReschedule={handlePreviewReschedule}
          onRescheduleConfirm={handleRescheduleConfirm}
          onRescheduleCancel={handleRescheduleCancel}
          showOverlay={showOverlay}
        />
      </div>

      {/* Timeline */}
      <div className="col-span-1">
        <h2 className="text-lg font-semibold mt-8 mb-2">Timeline</h2>
        {tasks.filter((task) => task.startTime).length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No tasks scheduled yet. <br />
            Add tasks to populate your timeline.
          </p>
        )}
        <Timeline
          tasks={tasks}
          setTasks={setTasks}
          rescheduledTasks={rescheduledTasks}
          showOverlay={showOverlay}
          skippedTasks={skippedTasks}
        />
      </div>
    </div>
  );
}
