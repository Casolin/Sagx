import type {
  Alert,
  AlertStatus,
  Priority,
  FailureType,
} from "../../types/global.types";
import { useAuth } from "../../hooks/useAuth";
import { Trash2, Settings, Activity, Archive, Verified } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import {
  deleteAlert,
  updateAlertStatus,
  updateAlert,
  diagnoseAlert,
} from "../../api/alert.api";
import { toast } from "react-toastify";
import EditAlertModal from "./EditAlertModal";
import DiagnoseAlertModal from "./DiagnoseAlertModal";

type DiagnosePayload = {
  failureType?: FailureType;
  diagnosis: string;
  rootCause?: string;
};

type Props = {
  alert: Alert;
  refresh: () => void;
};

const statusColor = (status: AlertStatus) => {
  switch (status) {
    case "RESOLVED":
      return "bg-green-100 text-green-700 border-green-200";
    case "IN_PROGRESS":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-red-100 text-red-700 border-red-200";
  }
};

export default function AlertCard({ alert, refresh }: Props) {
  const { user } = useAuth();

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDiagnose, setOpenDiagnose] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isTechnician = user?.role === "TECHNICIAN";

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteAlert(alert._id);
      toast.success("Alert deleted");
      refresh();
    } catch {
      toast.error("Failed to delete alert");
    } finally {
      setLoading(false);
      setOpenDelete(false);
    }
  };

  const handleMarkInProgress = async () => {
    try {
      await updateAlertStatus(alert._id, { status: "IN_PROGRESS" });
      toast.success("Marked in progress");
      refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveEdit = async (data: {
    status: AlertStatus;
    priority: Priority;
    message: string;
  }) => {
    try {
      setLoading(true);

      await updateAlertStatus(alert._id, { status: data.status });

      await updateAlert(alert._id, {
        message: data.message,
        priority: data.priority,
      });

      toast.success("Alert updated");
      setOpenEdit(false);
      refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnose = async (data: DiagnosePayload) => {
    try {
      await diagnoseAlert(alert._id, data);
      toast.success("Diagnosed successfully");
      setOpenDiagnose(false);
      refresh();
    } catch {
      toast.error("Diagnose failed");
    }
  };

  return (
    <>
      {/* CARD */}
      <div
        className="
          group relative
          rounded-2xl border border-gray-200
          bg-white p-5
          hover:shadow-xl hover:border-gray-300
          transition-all duration-200
          space-y-3 hover:-translate-y-0.5
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {typeof alert.machine === "string"
                ? alert.machine
                : alert.machine?.name || "Unknown Machine"}
            </h2>

            <span className="text-xs text-gray-400 mt-0.5">{alert.type}</span>
          </div>

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColor(
              alert.status,
            )}`}
          >
            {alert.status.replace("_", " ")}
          </span>
        </div>

        {/* MESSAGE */}
        <p className="text-sm text-gray-600 leading-relaxed">{alert.message}</p>

        {/* PRIORITY */}
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full border">
            Priority: {alert.priority}
          </span>
        </div>

        {/* TIMESTAMP */}
        <div className="text-[11px] text-gray-400 pt-1">
          Updated {new Date(alert.updatedAt).toLocaleString()}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 opacity-90 group-hover:opacity-100 transition">
          {alert.status === "RESOLVED" ? (
            <button
              disabled
              className="p-2 rounded-xl text-emerald-600 bg-emerald-50 cursor-default flex items-center gap-1"
            >
              <Verified size={16} />
              <span className="text-xs font-medium">Verified</span>
            </button>
          ) : (
            isTechnician && (
              <button
                onClick={() => setOpenDiagnose(true)}
                className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition cursor-pointer"
              >
                <Archive size={16} />
              </button>
            )
          )}

          {isAdminOrManager && (
            <>
              <button
                onClick={handleMarkInProgress}
                className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              >
                <Activity size={16} />
              </button>

              <button
                onClick={() => setOpenEdit(true)}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <Settings size={16} />
              </button>

              <button
                onClick={() => setOpenDelete(true)}
                className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Alert"
        message="Are you sure you want to delete this alert?"
        confirmText="Delete"
        loading={loading}
        variant="danger"
        onConfirm={handleDelete}
      />

      <EditAlertModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        alert={alert}
        onSave={handleSaveEdit}
      />

      <DiagnoseAlertModal
        open={openDiagnose}
        onClose={() => setOpenDiagnose(false)}
        alert={alert}
        onSave={handleDiagnose}
      />
    </>
  );
}
