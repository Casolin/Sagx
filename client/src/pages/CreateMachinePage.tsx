import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMachine } from "../api/machine.api";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeftToLine } from "lucide-react";

export default function CreateMachinePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canCreateMachine = isAdmin || isManager;

  const [loading, setLoading] = useState(false);

  // only editable fields
  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: "",
  });

  if (!canCreateMachine) {
    return <div className="p-6 text-red-500 font-medium">Access denied.</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

        // ✅ enforced defaults (NOT user-controlled)
        status: "OK",
        failureType: "NONE",
        condition: "NORMAL",
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
      <div className="sticky top-0 z-20 backdrop-blur border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/machines")}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
          >
            <ArrowLeftToLine size={16} />
            Machines
          </button>

          <h1 className="text-sm font-semibold text-zinc-800">
            Create Machine
          </h1>

          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-700">
              Machine details
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Add core information about the machine
            </p>
          </div>

          <input
            name="name"
            placeholder="Machine name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-zinc-50"
          />

          <input
            name="type"
            placeholder="Machine type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-zinc-50"
          />

          <input
            name="location"
            placeholder="Location (optional)"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-zinc-50"
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border bg-zinc-50 h-28"
          />
        </div>

        {/* ACTIONS */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/machines")}
              className="w-1/2 py-2.5 rounded-xl border hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-black text-white disabled:opacity-40"
            >
              {loading ? "Creating..." : "Create Machine"}
            </button>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Machine will be added immediately
          </p>
        </div>
      </div>
    </div>
  );
}
