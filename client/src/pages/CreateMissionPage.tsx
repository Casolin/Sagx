import { useEffect, useRef, useState } from "react";
import { createMission } from "../api/mission.api";
import { getAvailableTechnicians } from "../api/user.api";
import api from "../api/axios";
import { ArrowLeftToLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AlertSelector from "../components/alerts/AlertSelector";
import MaterialsSelector from "../components/materials/MaterialsSelector";
import TasksEditor from "../components/missions/TaskEditor";

import type {
  User,
  Machine,
  MissionPriority,
  MissionStatus,
  FailureType,
  MachineCondition,
  Task,
  MissionMaterial,
} from "../types/global.types";

import { toast } from "react-toastify";

type Props = {
  refresh?: () => void;
};

export default function CreateMissionPage({ refresh }: Props) {
  /* ================= STATE ================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [assignedTo, setAssignedTo] = useState("");
  const [machineId, setMachineId] = useState("");

  const [failureType, setFailureType] = useState<FailureType>("NONE");
  const [condition, setCondition] = useState<MachineCondition>("NORMAL");

  const [priority, setPriority] = useState<MissionPriority>("MEDIUM");
  const [status, setStatus] = useState<MissionStatus>("PENDING");

  const [location, setLocation] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");

  const [technicians, setTechnicians] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  const [alertId, setAlertId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [materials, setMaterials] = useState<MissionMaterial[]>([]);

  const [openTechDropdown, setOpenTechDropdown] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  /* ================= LOAD ================= */
  useEffect(() => {
    getAvailableTechnicians().then(setTechnicians).catch(console.error);

    api
      .get("/api/machines")
      .then((res) => setMachines(res.data.data))
      .catch(console.error);
  }, []);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (techRef.current && !techRef.current.contains(e.target as Node)) {
        setOpenTechDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= DERIVED ================= */
  const selectedMachine = machines.find((m) => m._id === machineId);
  const selectedTechnician = technicians.find((t) => t._id === assignedTo);

  const isValid =
    title.trim() &&
    description.trim() &&
    assignedTo &&
    machineId &&
    location.trim() &&
    requiredSkills.trim();

  /* ================= RESET ================= */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setMachineId("");
    setFailureType("NONE");
    setCondition("NORMAL");
    setPriority("MEDIUM");
    setStatus("PENDING");
    setLocation("");
    setRequiredSkills("");
    setAlertId("");
    setTasks([]);
    setMaterials([]);
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      await createMission({
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        machine: machineId,
        alertId,

        machineType: selectedMachine?.type || "",
        failureType,
        condition,
        priority,
        // @ts-expect-error STATUS is handled in server
        status,

        location: location.trim(),
        requiredSkills: requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        tasks,
        materials,
      });

      toast.success("Mission created successfully");

      resetForm();

      refresh?.();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(error?.response?.data?.message || "Mission creation failed");
    }
  };

  /* ================= UI ================= */
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
            New Mission
          </h1>

          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (FORM) */}
        <div className="lg:col-span-2 space-y-5">
          {/* BASIC INFO CARD */}
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

          {/* MACHINE + TECH */}
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

          {/* CONFIG */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 grid md:grid-cols-3 gap-3">
            <select
              className="px-3 py-2 rounded-xl border bg-zinc-50"
              value={failureType}
              onChange={(e) => setFailureType(e.target.value as FailureType)}
            >
              <option>NONE</option>
              <option>MECHANICAL</option>
              <option>ELECTRICAL</option>
              <option>OVERHEAT</option>
              <option>SENSOR</option>
              <option>HYDRAULIC</option>
              <option>UNKNOWN</option>
            </select>

            <select
              className="px-3 py-2 rounded-xl border bg-zinc-50"
              value={condition}
              onChange={(e) => setCondition(e.target.value as MachineCondition)}
            >
              <option>NORMAL</option>
              <option>ANOMALY</option>
              <option>FAILURE</option>
            </select>

            <select
              className="px-3 py-2 rounded-xl border bg-zinc-50"
              value={status}
              onChange={(e) => setStatus(e.target.value as MissionStatus)}
            >
              <option>PENDING</option>
              <option>ASSIGNED</option>
            </select>
          </div>

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
          {/* ALERT CARD */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-2">Linked alert</p>
            <AlertSelector
              alertId={alertId}
              setAlertId={setAlertId}
              setMachineId={setMachineId}
            />
          </div>

          {/* ACTION CARD */}
          <div className="sticky top-24 bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium">Actions</p>

            <button
              onClick={resetForm}
              className="w-full py-2.5 rounded-xl border hover:bg-zinc-50 transition cursor-pointer"
            >
              Reset
            </button>

            <button
              onClick={handleCreate}
              disabled={!isValid}
              className="w-full py-2.5 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
            >
              Create Mission
            </button>

            <p className="text-xs text-zinc-400 text-center">
              Mission will be assigned instantly after creation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
