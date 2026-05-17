import { useState } from "react";
import type { Alert, AlertStatus, Priority } from "../../types/global.types";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  alert: Alert;
  onSave: (data: {
    status: AlertStatus;
    priority: Priority;
    message: string;
  }) => Promise<void>;
};

export default function EditAlertModal({
  open,
  onClose,
  alert,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    status: alert.status,
    priority: alert.priority,
    message: alert.message,
  });

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        {/* header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Edit Alert</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* status */}
        <div>
          <label className="text-sm text-gray-600">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as AlertStatus })
            }
            className="w-full mt-1 border rounded-lg p-2"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* priority */}
        <div>
          <label className="text-sm text-gray-600">Priority</label>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value as Priority })
            }
            className="w-full mt-1 border rounded-lg p-2"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* message */}
        <div>
          <label className="text-sm text-gray-600">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
            className="w-full mt-1 border rounded-lg p-2"
          />
        </div>

        {/* actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
