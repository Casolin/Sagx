import { useNavigate } from "react-router-dom";
import { Trash2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import EditMachineStatusModal from "./EditMachineStatusModal";
import { deleteMachine } from "../../api/machine.api";

import type { Machine } from "../../types/global.types";

type Props = {
  machine: Machine;
  refresh: () => void;
};

const statusStyle = {
  OK: "bg-green-500",
  DOWN: "bg-red-500",
  MAINTENANCE: "bg-yellow-500",
};

const conditionStyle = {
  NORMAL: "text-green-600 bg-green-50",
  ANOMALY: "text-yellow-600 bg-yellow-50",
  FAILURE: "text-red-600 bg-red-50",
};

export default function MachineCard({ machine, refresh }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role;

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager; // ✅ UPDATED HERE

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenEditPage = () => {
    if (!canEdit) return;
    navigate(`/machines/${machine._id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteMachine(machine._id);

      toast.success("Machine deleted successfully");

      setOpenDelete(false);
      refresh();
    } catch {
      toast.error("Failed to delete machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handleOpenEditPage}
        className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white
      p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
              {machine.name}
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              {machine.type || "No type"}
            </p>
          </div>

          <span
            className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium text-white ${
              statusStyle[machine.status]
            }`}
          >
            {machine.status}
          </span>
        </div>

        {/* BODY */}
        <div className="mt-3 space-y-2">
          {/* CONDITION + FAILURE ROW */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Condition</span>
              <span
                className={`px-2 py-0.5 rounded-md font-medium ${
                  conditionStyle[machine.condition]
                }`}
              >
                {machine.condition}
              </span>
            </div>

            {machine.failureType && (
              <span className="text-gray-500 truncate max-w-[50%] text-right">
                {machine.failureType}
              </span>
            )}
          </div>

          {/* LOCATION */}
          {machine.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-gray-400">Location:</span>
              <span className="truncate">{machine.location}</span>
            </div>
          )}

          {/* DESCRIPTION */}
          {machine.description && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
              {machine.description}
            </p>
          )}
        </div>

        {/* FOOTER */}
        {(canEdit || canDelete) && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenEdit(true);
                }}
                className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition"
              >
                <SlidersHorizontal size={17} />
              </button>
            )}

            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDelete(true);
                }}
                className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {canEdit && (
        <EditMachineStatusModal
          open={openEdit}
          onOpenChange={setOpenEdit}
          machine={machine}
          refresh={refresh}
        />
      )}

      <ConfirmModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Machine"
        message="Are you sure you want to delete this machine? This action cannot be undone."
        confirmText="Delete"
        loading={loading}
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
