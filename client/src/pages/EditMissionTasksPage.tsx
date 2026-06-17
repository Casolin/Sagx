import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMission, updateTaskStatus } from "../api/mission.api";
import { toast } from "react-toastify";
import { ArrowLeftToLine } from "lucide-react";

import type { Mission, Task, TaskStatus } from "../types/global.types";

export default function EditMissionTasksPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const data = await getMission(id);
        setMission(data);
        setTasks(data.tasks || []);
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
        };

        toast.error(error?.response?.data?.message || "Failed to load mission");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!id) return;

    try {
      await updateTaskStatus(id, taskId, { status });

      const refreshed = await getMission(id);

      setMission(refreshed);
      setTasks(refreshed.tasks || []);

      toast.success("Task updated");
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
      };

      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!mission) return <div className="p-6">Mission not found</div>;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/missions")}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
          >
            <ArrowLeftToLine size={16} />
            Missions
          </button>

          <h1 className="text-sm font-semibold text-zinc-800 tracking-wide">
            Tasks
          </h1>

          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* MISSION HEADER */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mission.title}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* TASKS */}
        <div className="space-y-3">
          {tasks.length === 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-500">
              No tasks available
            </div>
          )}

          {tasks.map((task) => {
            const isPending = task.status === "PENDING";
            const isProgress = task.status === "IN_PROGRESS";
            const isDone = task.status === "COMPLETED";

            return (
              <div
                key={task._id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-sm transition"
              >
                {/* LEFT */}
                <div className="space-y-1">
                  <p className="font-medium text-zinc-900">{task.title}</p>
                  <p className="text-xs text-zinc-500">{task.description}</p>

                  {/* STATUS BADGE */}
                  <div className="pt-2">
                    {isPending && (
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                        Pending
                      </span>
                    )}

                    {isProgress && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                        In Progress
                      </span>
                    )}

                    {isDone && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2">
                  {isPending && (
                    <button
                      onClick={() =>
                        handleStatusChange(task._id, "IN_PROGRESS")
                      }
                      className="px-3 py-2 text-xs rounded-xl bg-black text-white hover:opacity-90 transition"
                    >
                      Start
                    </button>
                  )}

                  {isProgress && (
                    <button
                      onClick={() => handleStatusChange(task._id, "COMPLETED")}
                      className="px-3 py-2 text-xs rounded-xl bg-green-600 text-white hover:opacity-90 transition"
                    >
                      Complete
                    </button>
                  )}

                  {isDone && (
                    <span className="text-xs text-zinc-400 px-2">Done</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
