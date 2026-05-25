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
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create Alert
            </h1>
            <p className="text-sm text-zinc-500">
              Report a machine issue or anomaly
            </p>
          </div>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-8 space-y-6"
        >
          {/* MACHINE */}
          <div>
            <label className="text-xs font-medium text-zinc-500">Machine</label>
            <select
              name="machine"
              value={form.machine}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition"
            >
              <option value="">Select machine</option>
              {machines.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-zinc-500">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition"
              >
                <option value="FAILURE">Failure</option>
                <option value="ANOMALY">Anomaly</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="MACHINE_FAILURE">Machine Failure</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">
                Failure Type
              </label>
              <select
                name="failureType"
                value={form.failureType}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition"
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="MECHANICAL">Mechanical</option>
                <option value="HYDRAULIC">Hydraulic</option>
                <option value="SENSOR">Sensor</option>
                <option value="OVERHEAT">Overheat</option>
                <option value="NONE">None</option>
              </select>
            </div>
          </div>

          {/* MESSAGE */}
          <div>
            <label className="text-xs font-medium text-zinc-500">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue..."
              className="w-full mt-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition resize-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/alerts")}
              className="px-5 py-3 rounded-2xl border border-zinc-300 hover:bg-zinc-50 transition"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              type="submit"
              className="px-6 py-3 rounded-2xl bg-linear-to-r from-orange-500 to-orange-600 text-white font-medium hover:opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? "Creating..." : "Create Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
