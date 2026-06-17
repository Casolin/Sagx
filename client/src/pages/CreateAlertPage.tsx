import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAlert } from "../api/alert.api";
import { getMachines } from "../api/machine.api";
import { toast } from "react-toastify";
import { AlertTriangle } from "lucide-react";

type AlertType = "FAILURE" | "ANOMALY" | "MAINTENANCE" | "MACHINE_FAILURE";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type FailureType =
  | "NONE"
  | "ELECTRICAL"
  | "MECHANICAL"
  | "HYDRAULIC"
  | "SENSOR"
  | "OVERHEAT"
  | "UNKNOWN";

type Machine = {
  _id: string;
  name: string;
};

export default function CreateAlertPage() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    machine: string;
    type: AlertType;
    message: string;
    priority: Priority;
    failureType: FailureType;
  }>({
    machine: "",
    type: "ANOMALY",
    message: "",
    priority: "MEDIUM",
    failureType: "UNKNOWN",
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await getMachines();
        setMachines(res);
      } catch {
        toast.error("Failed to load machines");
      }
    };

    fetchMachines();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.machine || !form.message) {
      toast.error("Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await createAlert({
        machine: form.machine,
        type: form.type,
        message: form.message.trim().replace(/\n{3,}/g, "\n\n"),
        priority: form.priority,
        failureType: form.failureType,
      });

      toast.success("Alert created");
      navigate("/alerts");
    } catch {
      toast.error("Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* TOP BAR */}
      <div className="sticky top-0 z-2 backdrop-blur border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/alerts")}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
          >
            <AlertTriangle size={16} />
            Alerts
          </button>

          <h1 className="text-sm font-semibold tracking-wide text-zinc-800">
            Create Alert
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
              Alert details
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Report a machine issue or anomaly
            </p>
          </div>

          {/* MACHINE */}
          <select
            name="machine"
            value={form.machine}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50"
          >
            <option value="">Select machine</option>
            {machines.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="FAILURE">FAILURE</option>
              <option value="ANOMALY">ANOMALY</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="MACHINE_FAILURE">MACHINE_FAILURE</option>
            </select>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="px-3 py-2 rounded-xl border bg-zinc-50"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <select
            name="failureType"
            value={form.failureType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-xl border bg-zinc-50"
          >
            <option value="UNKNOWN">UNKNOWN</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="HYDRAULIC">HYDRAULIC</option>
            <option value="SENSOR">SENSOR</option>
            <option value="OVERHEAT">OVERHEAT</option>
            <option value="NONE">NONE</option>
          </select>

          {/* MESSAGE */}
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Describe the issue..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 h-28"
          />
        </div>

        {/* ACTIONS */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/alerts")}
              className="w-1/2 py-2.5 rounded-xl border hover:bg-zinc-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 text-white disabled:opacity-40 transition cursor-pointer"
            >
              {loading ? "Creating..." : "Create Alert"}
            </button>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Alert will be processed immediately
          </p>
        </div>
      </div>
    </div>
  );
}
