import { useState } from "react";
import { timeStrToMinutes } from "../utils/reschedule";

export default function Timeline({ tasks = [], setTasks, rescheduledTasks = [], skippedTasks = [], showOverlay = false }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editedAttributes, setEditedAttributes] = useState({});

  const hours = Array.from({ length: 24 }, (_, i) => i);


  const handleAttributeChange = (id, key, value) => {
    setEditedAttributes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  // Timeline scrollable container (1px = 1 minute)
  return (
    <div className="relative h-[600px] overflow-y-scroll border border-gray-300">
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
            const top = timeStrToMinutes(task.startTime);
            const height = task.duration;
            return (
              <div key={task.id}>
                {/* Task display box */}
                <div
                  className="absolute left-16 right-4 bg-blue-200 rounded p-1 text-sm shadow z-0"
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => {
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
                    <div className="font-semibold">{task.text}</div>
                    <div className="text-xs text-gray-600">
                      {task.duration} min
                      {task.fixed && " · Fixed"}
                      {task.skippable && " · Skippable"}
                      {task.completed && " · Done"}
                    </div>
                  </div>
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
                              handleAttributeChange(task.id, key, e.target.checked)
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
                  style={{ top: `${top}px`, height: `${height}px`, pointerEvents: 'none' }}
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
                  style={{ top: `${top}px`, height: `${height}px`, pointerEvents: 'none' }}
                >
                  <div className="font-semibold line-through">{task.text}</div>
                  <div className="text-xs text-gray-700 italic">Skipped</div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
