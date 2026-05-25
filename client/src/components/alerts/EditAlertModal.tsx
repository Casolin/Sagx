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
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-5">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">
                Edit Alert
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Update alert status and priority
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            {/* STATUS */}
            <div>
              <label className="text-xs text-zinc-500">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as AlertStatus })
                }
                className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div>
              <label className="text-xs text-zinc-500">Priority</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as Priority })
                }
                className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-xs text-zinc-500">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 disabled:opacity-40 transition"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
