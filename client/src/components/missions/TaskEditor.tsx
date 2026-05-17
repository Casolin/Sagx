import { useState } from "react";
import type { Task } from "../../types/global.types";

type Props = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  machineId: string;
};

export default function TasksEditor({ tasks, setTasks, machineId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [estimatedTime, setEstimatedTime] = useState(0);

  const addTask = () => {
    if (!title.trim()) return;

    //@ts-expect-error task id is already set
    const newTask: Task = {
      title: title.trim(),
      description: description.trim(),
      source: "MANUAL",
      machine: machineId,
      status: "PENDING",
      priority,
      dueDate: null,
      estimatedTime,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);

    setTitle("");
    setDescription("");
    setEstimatedTime(0);
    setPriority("MEDIUM");
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t._id !== id));
  };

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <h3 className="font-semibold">Tasks</h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full border px-2 py-1 rounded"
      />

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description"
        className="w-full border px-2 py-1 rounded"
      />

      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="border px-2 py-1 rounded w-1/2"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>

        <input
          type="number"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(Number(e.target.value))}
          placeholder="Estimated time"
          className="border px-2 py-1 rounded w-1/2"
        />
      </div>

      <button
        onClick={addTask}
        className="w-full bg-green-600 text-white py-1 rounded cursor-pointer"
      >
        Add Task
      </button>

      <div className="space-y-2 mt-2">
        {tasks.map((t) => (
          <div
            key={t._id}
            className="flex justify-between border p-2 rounded text-sm"
          >
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-gray-500">{t.priority}</p>
            </div>

            <button onClick={() => removeTask(t._id)} className="text-red-500">
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
