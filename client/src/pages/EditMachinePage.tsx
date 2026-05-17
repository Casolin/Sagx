import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMachine, updateMachine } from "../api/machine.api";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeftToLine } from "lucide-react";

import type {
  FailureType,
  MachineStatus,
  MachineCondition,
} from "../types/global.types";

export default function EditMachinePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";

  const canEdit = isAdmin || isManager;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: "",

    failureType: "NONE" as FailureType,
    status: "OK" as MachineStatus,
    condition: "NORMAL" as MachineCondition,
  });

  /* ================= LOAD MACHINE ================= */
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const data = await getMachine(id);

        setForm({
          name: data.name || "",
          type: data.type || "",
          location: data.location || "",
          description: data.description || "",
          failureType: data.failureType,
          status: data.status,
          condition: data.condition,
        });
      } catch {
        toast.error("Failed to load machine");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!id) return;

    if (!form.name || !form.type) {
      toast.error("Name and Type are required");
      return;
    }

    try {
      setLoading(true);

      await updateMachine(id, form);

      toast.success("Machine updated successfully");
      navigate("/machines");
    } catch {
      toast.error("Failed to update machine");
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Access denied. Admin or Manager only.
      </div>
    );
  }

  if (fetching) {
    return <div className="p-6">Loading machine...</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-6 bg-white space-y-6">
      {/* BACK */}
      <div
        className="flex gap-1 items-center cursor-pointer"
        onClick={() => navigate("/machines")}
      >
        <ArrowLeftToLine size={15} />
        <button className="cursor-pointer">Back</button>
      </div>

      <div className="w-full bg-white rounded-lg p-6 space-y-4 border border-gray-300">
        <h1 className="text-xl font-bold">Edit Machine</h1>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Machine name"
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Machine type"
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location (optional)"
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
          value={form.description}
          onChange={handleChange}
          placeholder="Description (optional)"
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
            {loading ? "Updating..." : "Update Machine"}
          </button>
        </div>
      </div>
    </div>
  );
}
