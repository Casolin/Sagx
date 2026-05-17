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

        setAlertId(missionData.alertId || "");

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
    <div className="min-h-screen p-6">
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div
          className="flex gap-1 items-center cursor-pointer"
          onClick={() => navigate("/missions")}
        >
          <ArrowLeftToLine size={15} />
          <button className="cursor-pointer">Back</button>
        </div>

        <h2 className="text-xl font-bold">Edit Mission</h2>

        <AlertSelector
          alertId={alertId}
          setAlertId={setAlertId}
          setMachineId={setMachineId}
        />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Title"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Description"
        />

        {/* FAILURE TYPE + CONDITION EDITABLE */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={failureType}
            onChange={(e) => setFailureType(e.target.value as FailureType)}
            className="w-full border rounded px-3 py-2"
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
            className="w-full border rounded px-3 py-2"
          >
            <option value="NORMAL">NORMAL</option>
            <option value="ANOMALY">ANOMALY</option>
            <option value="FAILURE">FAILURE</option>
          </select>
        </div>

        {/* TECHNICIAN */}
        <div ref={techRef}>
          <button
            onClick={() => setOpenTechDropdown(!openTechDropdown)}
            className="w-full border rounded px-3 py-2 flex justify-between items-center"
          >
            {selectedTechnician ? (
              <div className="flex items-center gap-2">
                <img
                  src={selectedTechnician.avatar || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left">
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
          </button>

          {openTechDropdown && (
            <div className="border rounded max-h-40 overflow-y-auto">
              {technicians.map((t: User) => (
                <button
                  key={t._id}
                  onClick={() => {
                    setAssignedTo(t._id);
                    setOpenTechDropdown(false);
                  }}
                  className="flex items-center gap-2 w-full p-2 hover:bg-gray-100"
                >
                  <img
                    src={t.avatar || "/default-avatar.png"}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <p className="text-sm">{t.firstName}</p>
                    <p className="text-xs text-gray-500">{t.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select machine</option>
          {machines.map((m: Machine) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as MissionPriority)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MissionStatus)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="PENDING">PENDING</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        {status === "CANCELLED" && (
          <input
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Cancellation reason"
          />
        )}

        <TasksEditor tasks={tasks} setTasks={setTasks} machineId={machineId} />
        <MaterialsSelector materials={materials} setMaterials={setMaterials} />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Location"
        />

        <input
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Skills"
        />

        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-2 rounded cursor-pointer"
        >
          Update Mission
        </button>
      </div>
    </div>
  );
}
