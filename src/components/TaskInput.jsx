import { useState } from "react";

export default function TaskInput({ onAdd }) {
  const DEFAULT_DURATION = 60; // minutes
  const DEFAULT_START_TIME = "09:00";
  const DEFAULT_FIXED = false;
  const DEFAULT_SKIPPABLE = true;

  const [text, setText] = useState("");
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [fixed, setFixed] = useState(DEFAULT_FIXED);
  const [skippable, setSkippable] = useState(DEFAULT_SKIPPABLE);
  const [completed, setCompleted] = useState(false);
  

  const setDefault = () => {
    setText("");
    setDuration(DEFAULT_DURATION);
    setStartTime(DEFAULT_START_TIME);
    setFixed(DEFAULT_FIXED);
    setSkippable(DEFAULT_SKIPPABLE);
    setCompleted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      text: text.trim(),
      duration: parseInt(duration, 10),
      startTime, // type: string or time??
      fixed,
      skippable,
      completed,
    });
    setDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <input
        className="border rounded px-3 py-2 w-full"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter task..."
      />
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border rounded px-3 py-2 w-20"
        />
        <span className="text-sm text-gray-500">min</span>
      </div>
      <input
        className="border rounded px-3 py-2 w-28"
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        title="Start time"
      />
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={fixed}
          onChange={(e) => setFixed(e.target.checked)}
        />
        Fixed
      </label>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={skippable}
          onChange={(e) => setSkippable(e.target.checked)}
        />
        Skippable
      </label>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
        />
        Completed
      </label>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add
      </button>
    </form>
  );
}
