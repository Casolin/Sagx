import { useState } from "react";
import type { Alert, FailureType } from "../../types/global.types";
import { X, Archive } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  alert: Alert;
  onSave: (data: {
    failureType?: FailureType;
    diagnosis: string;
    rootCause?: string;
  }) => Promise<void>;
};

export default function DiagnoseAlertModal({
  open,
  onClose,
  alert,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    failureType: (alert.failureType || "UNKNOWN") as FailureType,
    diagnosis: "",
    rootCause: "",
  });

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
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
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="flex items-start justify-between p-5 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-start gap-2">
              <Archive size={16} className="text-zinc-700 mt-0.5" />

              <div>
                <h2 className="text-sm font-semibold text-zinc-800">
                  Diagnose Alert
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Analyze failure and define root cause
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-4">
            {/* FAILURE TYPE */}
            <div>
              <label className="text-xs text-zinc-500">Failure Type</label>
              <select
                value={form.failureType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    failureType: e.target.value as FailureType,
                  })
                }
                className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="MECHANICAL">Mechanical</option>
                <option value="HYDRAULIC">Hydraulic</option>
                <option value="SENSOR">Sensor</option>
                <option value="OVERHEAT">Overheat</option>
              </select>
            </div>

            {/* DIAGNOSIS */}
            <div>
              <label className="text-xs text-zinc-500">Diagnosis</label>
              <textarea
                value={form.diagnosis}
                onChange={(e) =>
                  setForm({ ...form, diagnosis: e.target.value })
                }
                rows={3}
                placeholder="Describe the issue..."
                className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              />
            </div>

            {/* ROOT CAUSE */}
            <div>
              <label className="text-xs text-zinc-500">Root Cause</label>
              <textarea
                value={form.rootCause}
                onChange={(e) =>
                  setForm({ ...form, rootCause: e.target.value })
                }
                rows={2}
                placeholder="Optional"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-200 bg-white">
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
