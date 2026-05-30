import { useState } from "react";
import { notify } from "../../utils/toastify";

import type { User } from "../../types/global.types";
import ConfirmModal from "../ConfirmModal";

interface Props {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => Promise<void> | void;
}

export default function UserCard({ user, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleColor = {
    ADMIN: "bg-orange-500 text-white",
    MANAGER: "bg-indigo-500 text-white",
    TECHNICIAN: "bg-gray-800 text-white",
  }[user.role];

  const statusColor =
    {
      ACTIVE: "bg-green-500 text-white",
      INACTIVE: "bg-gray-400 text-white",
      SUSPENDED: "bg-red-500 text-white",
    }[user.status] || "bg-gray-300 text-black";

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(user._id);
      notify.info("User deleted successfully");
      setOpen(false);
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CARD */}
      <div
        className="
        group relative w-full
        rounded-2xl border border-gray-200
        bg-white p-5
        flex flex-col sm:flex-row items-center justify-between
        gap-4
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
      "
      >
        {/* subtle accent line */}
        <div className="absolute left-0 top-0 h-full w-0.75 bg-linear-to-b from-indigo-500 via-blue-500 to-cyan-400 rounded-l-2xl opacity-0 group-hover:opacity-100 transition" />

        {/* LEFT */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* avatar */}
          <div className="relative">
            <img
              src={user.avatar}
              className="w-12 h-12 rounded-full border object-cover"
            />
          </div>

          {/* info */}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
              {user.firstName} {user.lastName}
            </h3>

            <p className="text-sm text-gray-500 truncate max-w-60">
              {user.email}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${roleColor}`}
              >
                {user.role}
              </span>

              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusColor}`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => onEdit(user)}
            className="
            px-3 py-2 rounded-xl text-sm font-medium
            bg-black text-white
            hover:bg-indigo-100 transition
            cursor-pointer
          "
          >
            Edit
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
            px-3 py-2 rounded-xl text-sm font-medium
            bg-red-600 text-white
            hover:bg-red-100 transition
            cursor-pointer
          "
          >
            Delete
          </button>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
