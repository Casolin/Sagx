import { useNavigate } from "react-router-dom";
import type { Mission } from "../../types/global.types";
import { MISSION_STATUS_COLORS } from "../../constants/missionStatus";
import { isPopulatedUser } from "../../utils/isPopulatedUser";
import { useAuth } from "../../hooks/useAuth";
import { Trash2, SlidersHorizontal, File } from "lucide-react";
import { deleteMission, generateMissionReport } from "../../api/mission.api";
import { toast } from "react-toastify";
import { useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";

type Props = {
  mission: Mission;
  refresh: () => void;
};

export default function MissionCard({ mission, refresh }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deleting, setDeleting] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const statusColor = MISSION_STATUS_COLORS[mission.status] || "#9ca3af";
  const creator = isPopulatedUser(mission.createdBy) ? mission.createdBy : null;

  const isTechnician = user?.role === "TECHNICIAN";

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();

    navigate(
      isTechnician
        ? `/missions/${mission._id}/tasks/edit`
        : `/missions/${mission._id}/edit`,
    );
  };

  const handleDelete = async () => {
    if (!mission._id) return;

    try {
      setDeleting(true);
      await deleteMission(mission._id);
      toast.success("Mission deleted successfully");
      setOpenDelete(false);
      refresh();
    } catch {
      toast.error("Failed to delete mission");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateReport = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!mission._id) return;

    try {
      const reportUrl = await generateMissionReport(mission._id);

      window.open(`${import.meta.env.VITE_AI_URL}${reportUrl}`, "_blank");

      toast.success("Report generated");
    } catch {
      toast.error("Failed to generate report");
    }
  };

  return (
    <>
      <div
        className="group relative rounded-3xl border border-gray-200/70 bg-white/80 backdrop-blur-xl p-5 space-y-4
      transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
              {mission.title}
            </h2>

            <div className="flex items-center gap-2">
              {creator?.avatar && (
                <img
                  src={creator.avatar}
                  className="w-7 h-7 rounded-full border object-cover"
                />
              )}

              <span className="text-xs text-gray-500">
                Created by{" "}
                <span className="font-medium text-gray-700">
                  {creator
                    ? `${creator.firstName} ${creator.lastName}`
                    : "Unknown"}
                </span>
              </span>
            </div>
          </div>

          {/* STATUS BADGE */}
          <span
            style={{ backgroundColor: statusColor }}
            className="px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-sm"
          >
            {mission.status}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {mission.description}
        </p>

        {/* INFO GRID */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Priority</p>
            <p className="font-semibold text-gray-800">{mission.priority}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Tasks</p>
            <p className="font-semibold text-gray-800">
              {mission.tasks?.length || 0}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 col-span-1">
            <p className="text-xs text-gray-400">Skills</p>
            <p className="font-semibold text-gray-800 truncate">
              {mission.requiredSkills?.join(", ") || "-"}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {new Date(mission.createdAt).toLocaleString()}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition"
            >
              <SlidersHorizontal size={18} />
            </button>

            {!isTechnician && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDelete(true);
                }}
                disabled={deleting}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            )}

            {!isTechnician && (
              <button
                onClick={handleGenerateReport}
                className="p-2 rounded-xl text-orange-600 hover:bg-orange-50 transition"
              >
                <File size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Mission"
        message="Are you sure you want to delete this mission? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
