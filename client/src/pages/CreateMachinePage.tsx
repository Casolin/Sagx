import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMachine } from "../api/machine.api";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeftToLine } from "lucide-react";
import type {
  FailureType,
  MachineStatus,
  MachineCondition,
} from "../types/global.types";

export default function CreateMachinePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";

  const canCreateMachine = isAdmin || isManager;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: "",
    failureType: "NONE" as FailureType,
    status: "OK" as MachineStatus,
    condition: "NORMAL" as MachineCondition,
  });

  if (!canCreateMachine) {
    return <div className="p-6 text-red-500 font-medium">Access denied.</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type) {
      toast.error("Name and Type are required");
      return;
    }

    try {
      setLoading(true);

      await createMachine({
        ...form,
        createdBy: user!._id,
      });

      toast.success("Machine created successfully");
      navigate("/machines");
    } catch {
      toast.error("Failed to create machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white space-y-6">
      <div
        className="flex gap-1 items-center cursor-pointer"
        onClick={() => navigate("/machines")}
      >
        <ArrowLeftToLine size={15} />
        <button className="cursor-pointer">Back</button>
      </div>

      <div className="w-full bg-white rounded-lg p-6 space-y-4 border border-gray-300">
        <h1 className="text-xl font-bold">Create Machine</h1>

        <input
          name="name"
          placeholder="Machine name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="type"
          placeholder="Machine type"
          value={form.type}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="location"
          placeholder="Location (optional)"
          value={form.location}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            name="failureType"
            value={form.failureType}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="NONE">NONE</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="HYDRAULIC">HYDRAULIC</option>
            <option value="SENSOR">SENSOR</option>
            <option value="OVERHEAT">OVERHEAT</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="OK">OK</option>
            <option value="DOWN">DOWN</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>

        <select
          name="condition"
          value={form.condition}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="NORMAL">NORMAL</option>
          <option value="ANOMALY">ANOMALY</option>
          <option value="FAILURE">FAILURE</option>
        </select>

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 h-24"
        />

        {/* ACTIONS */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => navigate("/machines")}
            className="w-1/2 border rounded-lg py-2 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-1/2 bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Machine"}
          </button>
        </div>
      </div>
    </div>
  );
}
