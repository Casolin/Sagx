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
    <div className="min-h-screen p-6 bg-white space-y-6">
      <div
        className="flex gap-1 items-center cursor-pointer"
        onClick={() => navigate("/missions")}
      >
        <ArrowLeftToLine size={15} />
        <button className="cursor-pointer">Back</button>
      </div>
      <div className="w-full bg-white rounded-lg p-6 space-y-4 border border-gray-300">
        <h1 className="text-xl font-bold">Create Mission</h1>

        {/* ALERT */}
        <AlertSelector
          alertId={alertId}
          setAlertId={setAlertId}
          setMachineId={setMachineId}
        />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Mission title *"
          className="w-full border rounded-lg px-3 py-2"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mission description *"
          className="w-full border rounded-lg px-3 py-2 h-20"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={failureType}
            onChange={(e) => setFailureType(e.target.value as FailureType)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="NONE">NONE</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
            <option value="OVERHEAT">OVERHEAT</option>
            <option value="SENSOR">SENSOR</option>
            <option value="HYDRAULIC">HYDRAULIC</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as MachineCondition)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="NORMAL">NORMAL</option>
            <option value="ANOMALY">ANOMALY</option>
            <option value="FAILURE">FAILURE</option>
          </select>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MissionStatus)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="PENDING">PENDING</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        {/* TECHNICIAN */}
        <div ref={techRef} className="space-y-1">
          <button
            type="button"
            onClick={() => setOpenTechDropdown((v) => !v)}
            className="w-full border rounded-lg px-3 py-2 flex justify-between items-center"
          >
            {selectedTechnician ? (
              <div className="flex items-center gap-2">
                <img
                  src={selectedTechnician.avatar || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <div className="flex flex-col text-left leading-tight">
                  <p className="text-sm font-medium">
                    {selectedTechnician.firstName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedTechnician.email}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Select technician</span>
            )}
            <span>▾</span>
          </button>

          {openTechDropdown && (
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {technicians.map((t) => (
                <button
                  key={t._id}
                  onClick={() => {
                    setAssignedTo(t._id);
                    setOpenTechDropdown(false);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-2 hover:bg-gray-100"
                >
                  <img
                    src={t.avatar || "/default-avatar.png"}
                    className="w-8 h-8 rounded-full border"
                  />
                  <div className="text-left leading-tight">
                    <p className="text-sm font-medium">{t.firstName}</p>
                    <p className="text-xs text-gray-500">{t.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MACHINE */}
        <select
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Select machine *</option>
          {machines.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* TASKS + MATERIALS */}
        <TasksEditor tasks={tasks} setTasks={setTasks} machineId={machineId} />
        <MaterialsSelector materials={materials} setMaterials={setMaterials} />

        {/* LOCATION */}
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location *"
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* SKILLS */}
        <input
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          placeholder="Skills (comma separated) *"
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* ACTIONS */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={resetForm}
            className="w-1/2 border rounded-lg py-2 cursor-pointer"
          >
            Reset
          </button>

          <button
            onClick={handleCreate}
            disabled={!isValid}
            className="w-1/2 bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50 cursor-pointer"
          >
            Create Mission
          </button>
        </div>
      </div>
    </div>
  );
}
