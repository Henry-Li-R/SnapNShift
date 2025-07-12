import { useState, useEffect, useRef } from "react";
import { timeStrToMinutes, minutesToTimeStr } from "../utils/reschedule";

// Throttle interval for limiting drag event updates (in ms)
const THROTTLE_INTERVAL_MS = 50;
// Task drag snap interval (in minutes)
const INTERVAL_MINUTES = 15;

// Returns a throttled version of the input function, only allowing execution every 'limit' ms
const throttle = (fn, limit) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
};

export default function Timeline({
  tasks = [],
  setTasks,
  rescheduledTasks = [],
  skippedTasks = [],
  showOverlay = false,
}) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editedAttributes, setEditedAttributes] = useState({});
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [draggedTaskState, setDraggedTaskState] = useState(null);
  const [resizingTaskState, setResizingTaskState] = useState(null);

  const wasDraggingOrResizingRef = useRef(false); // Track if user was recently dragging or resizing (to suppress click)
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef(null);
  

  const handleAttributeChange = (id, key, value) => {
    setEditedAttributes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  // Update time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute
    return () => clearInterval(intervalId);
  }, []);

  /* Task resizing (i.e. change duration) */
  // Throttled mouse move
  const throttledResizeMouseMove = throttle((e) => {
    if (!resizingTaskState?.id) return;

    const task = tasks.find((t) => t.id === resizingTaskState.id);
    if (!task) return;

    const containerTop = containerRef.current.getBoundingClientRect().top;
    const cursorY = e.clientY;
    const rawOffset = cursorY - containerTop + containerRef.current.scrollTop;
    const startMinutes = timeStrToMinutes(task.startTime);
    let newDuration = rawOffset - startMinutes;
    
    newDuration =
      Math.round(newDuration / INTERVAL_MINUTES) * INTERVAL_MINUTES;
    newDuration = Math.max(INTERVAL_MINUTES, newDuration);
    newDuration = Math.min(1440 - startMinutes, newDuration);
    setResizingTaskState({ id: task.id, newDuration });
  }, THROTTLE_INTERVAL_MS);
  // Attach mouse listeners
  useEffect(() => {
    // Disable text selection when resizing
    if (resizingTaskState?.id) {
      document.body.style.userSelect = "none";
    }
    // Attach global mousemove/mouseup listeners using throttled handler to limit updates
    const handleMouseMove = (e) => throttledResizeMouseMove(e);
    const handleMouseUp = () => {
      if (resizingTaskState) {
        const currentTask = tasks.find((t) => t.id === resizingTaskState.id);
        if (currentTask && currentTask.duration !== resizingTaskState.newDuration) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === resizingTaskState.id
                ? { ...t, duration: resizingTaskState.newDuration }
                : t
            )
          );
          // Set flag: just finished resizing
          wasDraggingOrResizingRef.current = true;
        }
      }
      setResizingTaskState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // Re-enable text selection after resize
      document.body.style.userSelect = "auto";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizingTaskState]);
  // Mouse down handler
  const handleResizeMouseDown = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setResizingTaskState({ id: taskId, newDuration: task.duration });
    }
  };
  // Abort task resizing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setResizingTaskState(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  /* Task dragging (i.e. change startTime) */
  // Throttled mouse move handler to update task position during drag
  const throttledDragMouseMove = throttle((e) => {
    if (!draggedTaskState?.id) return;

    const task = tasks.find((t) => t.id === draggedTaskState.id);
    if (!task) return;

    const containerTop = containerRef.current.getBoundingClientRect().top;
    const cursorY = e.clientY;
    const rawOffset =
      cursorY -
      containerTop +
      containerRef.current.scrollTop -
      (draggedTaskState.offsetY || 0);
    const rawMinutes = Math.round(rawOffset);
    const snappedMinutes =
      Math.round(rawMinutes / INTERVAL_MINUTES) * INTERVAL_MINUTES;
    const clampedMinutes = Math.max(
      0,
      Math.min(1440 - task.duration, snappedMinutes)
    );

    const newStartTime = minutesToTimeStr(clampedMinutes);
    setDraggedTaskState({ ...draggedTaskState, newStartTime });
  }, THROTTLE_INTERVAL_MS);
  // Mouse down handler (store the vertical click offset within the task box)
  const handleDragMouseDown = (taskId, e) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const taskTop = timeStrToMinutes(task.startTime);
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const clickY = e.clientY;
      const offsetY =
        clickY - containerTop - taskTop + containerRef.current.scrollTop;
      setDraggedTaskState({
        id: taskId,
        newStartTime: task.startTime,
        offsetY,
      });
    }
  };
  // Attach mouse liseners
  useEffect(() => {
    // Disable text selection when dragging
    if (draggedTaskState?.id) {
      document.body.style.userSelect = "none";
    }
    // Attach global mousemove/mouseup listeners using throttled handler to limit updates
    const handleMouseMove = (e) => throttledDragMouseMove(e);
    const handleMouseUp = () => {
      if (draggedTaskState) {
        const currentTask = tasks.find((t) => t.id === draggedTaskState.id);
        if (currentTask && currentTask.startTime !== draggedTaskState.newStartTime) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === draggedTaskState.id
                ? { ...t, startTime: draggedTaskState.newStartTime }
                : t
            )
          );
          // Set flag: just finished dragging
          wasDraggingOrResizingRef.current = true;
        }
      }
      setDraggedTaskState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // Re-enable text selection after drag
      document.body.style.userSelect = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggedTaskState]);
  // Abort dragging
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDraggedTaskState(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset the drag/resize flag after a short delay
  useEffect(() => {
    if (wasDraggingOrResizingRef.current) {
      const timeout = setTimeout(() => {
        wasDraggingOrResizingRef.current = false;
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [draggedTaskState, resizingTaskState]);

  /* Timeline scrollable container (1px = 1 minute) */
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div
      className="relative h-[600px] overflow-y-scroll border border-gray-300"
      ref={containerRef}
    >
      <div className="relative h-[1440px]">
        {/* Render horizontal hour markers and labels (e.g. "00:00", "01:00", ..., "23:00") */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 w-full border-t border-dashed border-gray-300 text-gray-500 text-sm"
            style={{ top: `${hour * 60}px` }}
          >
            <div className="absolute left-0 w-12 text-right pr-2">{`${hour
              .toString()
              .padStart(2, "0")}:00`}</div>
          </div>
        ))}

        {/* Render each current task (non-overlay) with clickable editor */}
        {tasks
          .filter((task) => task.startTime)
          .map((task) => {
            const isResizeCloned = resizingTaskState?.id === task.id;
            const isDragCloned = draggedTaskState?.id === task.id;
            const top = isDragCloned
              ? timeStrToMinutes(draggedTaskState.newStartTime)
              : timeStrToMinutes(task.startTime);
            const height = isResizeCloned
              ? resizingTaskState.newDuration
              : task.duration;
            return (
              <div key={task.id}>
                {/* Task display box */}
                <div
                  className="absolute left-16 right-4 bg-blue-200 rounded p-1 text-sm shadow z-0"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    opacity:
                      isDragCloned || isResizeCloned
                        ? 0.5
                        : hoveredTaskId === task.id
                        ? 0.85
                        : 1,
                  }}
                  onMouseDown={(e) => handleDragMouseDown(task.id, e)}
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                  onClick={() => {
                    if (wasDraggingOrResizingRef.current) {
                      return;
                    }
                    if (expandedTaskId !== task.id) {
                      setEditedAttributes({
                        [task.id]: {
                          text: task.text,
                          fixed: task.fixed,
                          skippable: task.skippable,
                          completed: task.completed,
                        },
                      });
                      setExpandedTaskId(task.id);
                    } else {
                      setExpandedTaskId(null);
                    }
                  }}
                >
                  <div className="cursor-pointer">
                    <div className="font-semibold">{task.text}</div>
                    <div className="text-xs text-gray-600">
                      {task.duration} min
                      {task.fixed && " · Fixed"}
                      {task.skippable && " · Skippable"}
                      {task.completed && " · Done"}
                    </div>
                  </div>
                  {/* Show resize/drag handle only on hover or if resizing */}
                  {(hoveredTaskId === task.id || isResizeCloned) && (
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-2 w-6 cursor-ns-resize"
                      style={{
                        backgroundImage: "linear-gradient(to bottom, #4B5563 50%, transparent 50%)",
                        backgroundSize: "100% 2px",
                        backgroundRepeat: "repeat-y",
                        opacity: 0.6,
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeMouseDown(task.id);
                      }}
                    />
                  )}
                </div>

                {/* Floating editor panel for modifying task attributes */}
                {expandedTaskId === task.id && (
                  <div
                    className="absolute left-4 right-4 z-20 bg-white border border-gray-300 rounded p-2 shadow-lg"
                    style={{ top: `${top + height + 4}px` }}
                  >
                    <input
                      type="text"
                      className="border px-1 py-0.5 rounded w-full mb-1"
                      defaultValue={task.text}
                      onChange={(e) =>
                        handleAttributeChange(task.id, "text", e.target.value)
                      }
                    />
                    <div className="space-x-2 mb-1">
                      {["fixed", "skippable", "completed"].map((key) => (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={
                              editedAttributes[task.id]?.[key] ?? task[key]
                            }
                            onChange={(e) =>
                              handleAttributeChange(
                                task.id,
                                key,
                                e.target.checked
                              )
                            }
                          />
                          {" " + key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTasks((prev) =>
                            prev.filter((t) => t.id !== task.id)
                          );
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === task.id
                                ? { ...t, ...editedAttributes[task.id] }
                                : t
                            )
                          );
                          setEditedAttributes((prev) => {
                            const updated = { ...prev };
                            delete updated[task.id];
                            return updated;
                          });
                          setExpandedTaskId(null);
                        }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        {/* Overlay showing rescheduled task positions (highlighted) */}
        {showOverlay &&
          rescheduledTasks
            .filter((task) => task.startTime)
            .map((task) => {
              const top = timeStrToMinutes(task.startTime);
              const height = task.duration;
              return (
                <div
                  key={`rescheduled-${task.id}`}
                  className="absolute left-16 right-4 bg-yellow-300 bg-opacity-80 rounded p-1 text-sm shadow z-10 border border-yellow-600"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    pointerEvents: "none",
                  }}
                >
                  <div className="font-semibold">{task.text}</div>
                  <div className="text-xs text-gray-700">
                    {task.duration} min
                    {task.fixed && " · Fixed"}
                    {task.skippable && " · Skippable"}
                    {task.completed && " · Done"}
                  </div>
                </div>
              );
            })}
        {/* Overlay showing skipped tasks (grayed out and struck through) */}
        {showOverlay &&
          skippedTasks
            .filter((task) => task.startTime)
            .map((task) => {
              const top = timeStrToMinutes(task.startTime);
              const height = task.duration;
              return (
                <div
                  key={`skipped-${task.id}`}
                  className="absolute left-16 right-4 bg-gray-400 rounded p-1 text-sm shadow z-0 border border-dashed border-gray-500"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    pointerEvents: "none",
                  }}
                >
                  <div className="font-semibold line-through">{task.text}</div>
                  <div className="text-xs text-gray-700 italic">Skipped</div>
                </div>
              );
            })}
        {/* Current time indicator */}
        <div
          className="absolute left-0 w-full border-t-2 border-red-500 z-30"
          style={{ top: `${currentMinutes}px` }}
        ></div>
      </div>
    </div>
  );
}
