import { useState } from "react";

export default function Timeline({ tasks = [], setTasks }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editedAttributes, setEditedAttributes] = useState({});

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

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
        {/* Render hour markers (00:00 to 23:00) */}
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

        {/* Render each task as a time-aligned block */}
        {tasks
          .filter((task) => task.startTime)
          .map((task) => {
            const top = timeToMinutes(task.startTime);
            const height = task.duration;
            return (
              <div
                key={task.id}
                className="absolute left-16 right-4 bg-blue-200 rounded p-1 text-sm shadow"
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                {/* Task header (click to expand/collapse) */}
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

                {/* Task detail editor (text + toggles + save/delete) */}
                {expandedTaskId === task.id && (
                  <div className="mt-2 text-xs space-y-1 bg-white border border-gray-300 rounded p-1">
                    <input
                      type="text"
                      className="border px-1 py-0.5 rounded w-full"
                      defaultValue={task.text}
                      onChange={(e) =>
                        handleAttributeChange(task.id, "text", e.target.value)
                      }
                    />
                    <div className="space-x-2">
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
                          {key.charAt(0).toUpperCase() + key.slice(1)}
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
      </div>
    </div>
  );
}
