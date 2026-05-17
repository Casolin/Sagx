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
    <div className="p-6 min-h-screen bg-white">
      <div className="mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-orange-500" />
          <h1 className="text-2xl font-bold">Create Alert</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-300 rounded-2xl p-6 space-y-2"
        >
          <div>
            <label className="text-sm text-gray-600">Machine</label>
            <select
              name="machine"
              value={form.machine}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2"
            >
              <option value="">Select machine</option>
              {machines.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2"
            >
              <option value="FAILURE">Failure</option>
              <option value="ANOMALY">Anomaly</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="MACHINE_FAILURE">Machine Failure</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Failure Type</label>
            <select
              name="failureType"
              value={form.failureType}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2"
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

          <div>
            <label className="text-sm text-gray-600">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full mt-1 border rounded-lg p-2"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              className="w-full mt-1 border rounded-lg p-2"
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate("/alerts")}
              className="px-4 py-2 rounded-lg border cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
