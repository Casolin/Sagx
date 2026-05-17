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
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-green-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Diagnose Alert
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-3">
          {/* failure type */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Failure Type</label>
            <select
              value={form.failureType}
              onChange={(e) =>
                setForm({
                  ...form,
                  failureType: e.target.value as FailureType,
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="UNKNOWN">Unknown</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="MECHANICAL">Mechanical</option>
              <option value="HYDRAULIC">Hydraulic</option>
              <option value="SENSOR">Sensor</option>
              <option value="OVERHEAT">Overheat</option>
            </select>
          </div>

          {/* diagnosis */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Diagnosis</label>
            <textarea
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              rows={3}
              placeholder="Describe the issue..."
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* root cause */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Root Cause</label>
            <textarea
              value={form.rootCause}
              onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
              rows={2}
              placeholder="Optional"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
