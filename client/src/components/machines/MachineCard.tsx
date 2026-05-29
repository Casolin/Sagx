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
        className="group relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white
      p-3 shadow-sm hover:shadow-md transition cursor-pointer"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
              {machine.name}
            </h2>

            <p className="text-[11px] text-gray-400 truncate">
              {machine.type || "No type"}
            </p>
          </div>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full text-white ${
              statusStyle[machine.status]
            }`}
          >
            {machine.status}
          </span>
        </div>

        {/* META */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span
            className={`px-2 py-0.5 rounded-md ${
              conditionStyle[machine.condition]
            }`}
          >
            {machine.condition}
          </span>

          {machine.failureType && (
            <span className="truncate">• {machine.failureType}</span>
          )}

          {machine.location && (
            <span className="truncate">• {machine.location}</span>
          )}
        </div>

        {/* DESCRIPTION */}
        {machine.description && (
          <p className="text-[11px] text-gray-500 line-clamp-2">
            {machine.description}
          </p>
        )}

        {/* ACTIONS */}
        {(canEdit || canDelete) && (
          <div className="flex justify-end gap-1 pt-1">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenEdit(true);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600"
              >
                <SlidersHorizontal size={16} />
              </button>
            )}

            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDelete(true);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"
              >
                <Trash2 size={16} />
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
