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
        className="group relative h-full flex flex-col bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {machine.name}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {machine.type || "No type"}
            </p>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full text-white font-medium ${
              statusStyle[machine.status]
            }`}
          >
            {machine.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Condition</p>
            <span
              className={`inline-block mt-1 px-2 py-1 rounded-md text-xs font-medium ${
                conditionStyle[machine.condition]
              }`}
            >
              {machine.condition}
            </span>
          </div>

          <div>
            <p className="text-gray-400 text-xs">Failure</p>
            <p className="mt-1 font-medium text-gray-700 text-sm">
              {machine.failureType}
            </p>
          </div>

          {machine.location && (
            <div className="col-span-2 border-b border-gray-200 pb-3">
              <p className="text-gray-400 text-xs">Location</p>
              <p className="mt-1 text-gray-700 text-sm">{machine.location}</p>
            </div>
          )}
        </div>

        {machine.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {machine.description}
          </p>
        )}

        <div className="mt-auto flex justify-end gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenEdit(true);
              }}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDelete(true);
              }}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

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
