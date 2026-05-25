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
        className="group relative flex flex-col justify-between rounded-3xl border border-gray-200/70 bg-white
      shadow-sm hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]
      transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <div className="p-5 flex flex-col gap-4">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                {machine.name}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                {machine.type || "No type"}
              </p>
            </div>

            <span
              className={`text-[11px] px-3 py-1 rounded-full font-semibold text-white shadow-sm ${
                statusStyle[machine.status]
              }`}
            >
              {machine.status}
            </span>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <p className="text-[11px] text-gray-400">Condition</p>
              <span
                className={`inline-block mt-1 px-2 py-1 rounded-md text-xs font-semibold ${
                  conditionStyle[machine.condition]
                }`}
              >
                {machine.condition}
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <p className="text-[11px] text-gray-400">Failure</p>
              <p className="mt-1 font-medium text-gray-800 text-sm">
                {machine.failureType || "-"}
              </p>
            </div>

            {machine.location && (
              <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <p className="text-[11px] text-gray-400">Location</p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {machine.location}
                </p>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {machine.description && (
            <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              {machine.description}
            </p>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenEdit(true);
                }}
                className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition"
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
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
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
