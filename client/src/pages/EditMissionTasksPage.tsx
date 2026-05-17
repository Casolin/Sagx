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
    <div className="min-h-screen ">
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div
          className="flex gap-1 items-center cursor-pointer"
          onClick={() => navigate("/missions")}
        >
          <ArrowLeftToLine size={15} />
          <button className="cursor-pointer">Back</button>
        </div>

        <h2 className="text-xl font-bold">{mission.title}</h2>

        <p className="text-gray-500">{mission.description}</p>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">{task.description}</p>
              </div>

              <div className="flex gap-2">
                {task.status === "PENDING" && (
                  <button
                    onClick={() => handleStatusChange(task._id, "IN_PROGRESS")}
                    className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                  >
                    Start
                  </button>
                )}

                {task.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleStatusChange(task._id, "COMPLETED")}
                    className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                  >
                    Complete
                  </button>
                )}

                {task.status === "COMPLETED" && (
                  <span className="text-xs text-green-600 font-medium">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
