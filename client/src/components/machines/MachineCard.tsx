import { useNavigate } from "react-router-dom";
import { Trash2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import EditMachineStatusModal from "./EditMachineStatusModal";
import { deleteMachine } from "../../api/machine.api";

import type { Machine } from "../../types/global.types";

type Props = {
  machine: Machine;
  refresh: () => void;
};

const statusDot = {
  OK: "bg-green-500",
  DOWN: "bg-red-500 animate-pulse",
  MAINTENANCE: "bg-yellow-500",
};

const conditionBadge = {
  NORMAL: "border-green-200 text-green-700 bg-green-50",
  ANOMALY: "border-yellow-200 text-yellow-700 bg-yellow-50",
  FAILURE: "border-red-200 text-red-700 bg-red-50",
};

export default function MachineCard({ machine, refresh }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canEdit = isAdmin || isManager;

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteMachine(machine._id);
      refresh();
      setOpenDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => navigate(`/machines/${machine._id}`)}
        className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition hover:border-gray-300 cursor-pointer"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between">
          {/* LEFT */}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
              {machine.name}
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              {machine.type || "No type"}
            </p>
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${statusDot[machine.status]}`}
            />
            <span className="text-xs font-medium text-gray-700">
              {machine.status}
            </span>
          </div>
        </div>

        {/* META */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span
            className={`px-2 py-0.5 rounded-md border ${
              conditionBadge[machine.condition]
            }`}
          >
            {machine.condition}
          </span>

          {machine.location && (
            <span className="text-gray-500">📍 {machine.location}</span>
          )}

          {machine.failureType && (
            <span className="text-gray-500">⚠ {machine.failureType}</span>
          )}
        </div>

        {/* DESCRIPTION */}
        {machine.description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {machine.description}
          </p>
        )}

        {/* ACTIONS (clean bottom-right, not noisy) */}
        {canEdit && (
          <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenEdit(true);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <SlidersHorizontal size={14} />
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDelete(true);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-red-50 text-red-600"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <EditMachineStatusModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        machine={machine}
        refresh={refresh}
      />

      <ConfirmModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Machine"
        message="This action cannot be undone."
        confirmText="Delete"
        loading={loading}
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
