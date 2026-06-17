import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMission, updateMission } from "../api/mission.api";
import api from "../api/axios";
import { ArrowLeftToLine } from "lucide-react";
import { toast } from "react-toastify";

import AlertSelector from "../components/alerts/AlertSelector";
import MaterialsSelector from "../components/materials/MaterialsSelector";
import TasksEditor from "../components/missions/TaskEditor";

import type {
  Mission,
  User,
  Machine,
  MissionPriority,
  MissionStatus,
  FailureType,
  MachineCondition,
  Task,
  MissionMaterial,
} from "../types/global.types";

import { getAvailableTechnicians } from "../api/user.api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function EditMissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<Mission | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  const [assignedTo, setAssignedTo] = useState("");
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [openTechDropdown, setOpenTechDropdown] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);

  const [machineId, setMachineId] = useState("");
  const [machines, setMachines] = useState<Machine[]>([]);

  const [alertId, setAlertId] = useState("");

  const [priority, setPriority] = useState<MissionPriority>("MEDIUM");
  const [status, setStatus] = useState<MissionStatus>("PENDING");
  const [failureType, setFailureType] = useState<FailureType>("NONE");
  const [condition, setCondition] = useState<MachineCondition>("NORMAL");

  const [location, setLocation] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [materials, setMaterials] = useState<MissionMaterial[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const missionData = await getMission(id);
        setMission(missionData);

        setTitle(missionData.title || "");
        setDescription(missionData.description || "");
        setCancellationReason(missionData.cancellationReason || "");

        setAssignedTo(
          typeof missionData.assignedTo === "string"
            ? missionData.assignedTo
            : missionData.assignedTo?._id || "",
        );

        const machine = missionData.machine as string | { _id: string };

        setMachineId(typeof machine === "string" ? machine : machine._id || "");

        const alert =
          typeof missionData.alertId === "string"
            ? missionData.alertId
            : //eslint-disable-next-line
              (missionData.alertId as any)?._id || "";

        setAlertId(alert);

        setPriority(missionData.priority || "MEDIUM");
        setStatus(missionData.status || "PENDING");
        setFailureType(missionData.failureType || "NONE");
        setCondition(missionData.condition || "NORMAL");

        setLocation(missionData.location || "");
        setRequiredSkills(missionData.requiredSkills?.join(", ") || "");

        setTasks(missionData.tasks || []);
        setMaterials(missionData.materials || []);

        const [techRes, machineRes] = await Promise.all([
          getAvailableTechnicians(),
          api.get("/api/machines"),
        ]);

        setTechnicians(techRes);
        setMachines(machineRes.data.data || []);
      } catch (err: unknown) {
        const error = err as ApiError;
        toast.error(error.response?.data?.message || "Failed to load mission");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (techRef.current && !techRef.current.contains(e.target as Node)) {
        setOpenTechDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedTechnician = technicians.find((t) => t._id === assignedTo);

  const handleUpdate = async () => {
    if (!id) return;

    try {
      await updateMission(id, {
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        machine: machineId,
        alertId,
        priority,
        status,
        failureType,
        condition,
        location: location.trim(),
        requiredSkills: requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tasks,
        materials,
        cancellationReason:
          status === "CANCELLED" ? cancellationReason.trim() : "",
      });

      toast.success("Mission updated");
      navigate("/missions");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!mission) return <div className="p-6">Mission not found</div>;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/missions")}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
          >
            <ArrowLeftToLine size={16} />
            Missions
          </button>

          <h1 className="text-sm font-semibold tracking-wide text-zinc-800">
            Edit Mission
          </h1>

          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* MISSION DETAILS */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              Mission details
            </h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mission title"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* CONFIG GRID */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 grid md:grid-cols-2 gap-4">
            {/* FAILURE */}
            <select
              value={failureType}
              onChange={(e) => setFailureType(e.target.value as FailureType)}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="NONE">NONE</option>
              <option value="MECHANICAL">MECHANICAL</option>
              <option value="ELECTRICAL">ELECTRICAL</option>
              <option value="OVERHEAT">OVERHEAT</option>
              <option value="SENSOR">SENSOR</option>
              <option value="HYDRAULIC">HYDRAULIC</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>

            {/* CONDITION */}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as MachineCondition)}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="ANOMALY">ANOMALY</option>
              <option value="FAILURE">FAILURE</option>
            </select>

            {/* PRIORITY */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as MissionPriority)}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MissionStatus)}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* TECH + MACHINE */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* TECH */}
            <div
              ref={techRef}
              className="bg-white border border-zinc-200 rounded-2xl p-4 relative"
            >
              <p className="text-xs text-zinc-500 mb-2">Assigned technician</p>

              <button
                onClick={() => setOpenTechDropdown((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-zinc-50 hover:bg-white"
              >
                {selectedTechnician ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedTechnician.avatar || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full border"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {selectedTechnician.firstName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {selectedTechnician.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-zinc-400">Select technician</span>
                )}

                <span className="text-zinc-400">▾</span>
              </button>

              {openTechDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                  {technicians.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => {
                        setAssignedTo(t._id);
                        setOpenTechDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50"
                    >
                      <img
                        src={t.avatar || "/default-avatar.png"}
                        className="w-8 h-8 rounded-full border"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium">{t.firstName}</p>
                        <p className="text-xs text-zinc-500">{t.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MACHINE */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-2">Machine</p>

              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-zinc-50"
              >
                <option value="">Select machine</option>
                {machines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EXTRA FIELDS */}
          {status === "CANCELLED" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5">
              <input
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Cancellation reason"
                className="w-full px-4 py-3 rounded-xl border bg-zinc-50"
              />
            </div>
          )}

          {/* TASKS + MATERIALS */}
          <div className="space-y-4">
            <TasksEditor
              tasks={tasks}
              setTasks={setTasks}
              machineId={machineId}
            />
            <MaterialsSelector
              materials={materials}
              setMaterials={setMaterials}
            />
          </div>

          {/* LOCATION + SKILLS */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="px-4 py-3 rounded-xl border bg-white"
            />

            <input
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="Skills (comma separated)"
              className="px-4 py-3 rounded-xl border bg-white"
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* ALERT */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-2">Linked alert</p>
            <AlertSelector
              alertId={alertId}
              setAlertId={setAlertId}
              setMachineId={setMachineId}
            />
          </div>

          {/* ACTIONS */}
          <div className="sticky top-24 bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium">Actions</p>

            <button
              onClick={handleUpdate}
              className="w-full py-2.5 rounded-xl bg-black text-white hover:opacity-90 transition cursor-pointer"
            >
              Update Mission
            </button>

            <button
              onClick={() => navigate("/missions")}
              className="w-full py-2.5 rounded-xl border hover:bg-zinc-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <p className="text-xs text-zinc-400 text-center">
              Changes will be saved immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
