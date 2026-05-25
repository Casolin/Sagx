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
    <div className="min-h-screen bg-zinc-50">
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/machines")}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
          >
            <ArrowLeftToLine size={16} />
            Machines
          </button>

          <h1 className="text-sm font-semibold tracking-wide text-zinc-800">
            Create Machine
          </h1>

          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* MAIN CARD */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-700">
              Machine details
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Add core information about the machine
            </p>
          </div>

          {/* NAME */}
          <input
            name="name"
            placeholder="Machine name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* TYPE */}
          <input
            name="type"
            placeholder="Machine type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* LOCATION */}
          <input
            name="location"
            placeholder="Location (optional)"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* GRID OPTIONS */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="failureType"
              value={form.failureType}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
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
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="OK">OK</option>
              <option value="DOWN">DOWN</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>

          {/* CONDITION */}
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border bg-zinc-50"
          >
            <option value="NORMAL">NORMAL</option>
            <option value="ANOMALY">ANOMALY</option>
            <option value="FAILURE">FAILURE</option>
          </select>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        {/* ACTION CARD */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700">Actions</p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/machines")}
              className="w-1/2 py-2.5 rounded-xl border hover:bg-zinc-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-40 transition"
            >
              {loading ? "Creating..." : "Create Machine"}
            </button>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Machine will be added to the system immediately after creation
          </p>
        </div>
      </div>
    </div>
  );
}
