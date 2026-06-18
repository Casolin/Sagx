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
        rounded-2xl border border-slate-200/70
        bg-white/80 backdrop-blur
        p-5
        flex items-center justify-between
        gap-4
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-1
        hover:border-indigo-200
      "
      >
        {/* gradient accent */}
        <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-indigo-500 via-blue-500 to-cyan-400 rounded-l-2xl opacity-80" />

        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">
          {/* avatar */}
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />

            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                user.status === "ACTIVE"
                  ? "bg-emerald-500"
                  : user.status === "SUSPENDED"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            />
          </div>

          {/* info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition">
                {user.firstName} {user.lastName}
              </h3>

              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColor}`}
              >
                {user.role}
              </span>
            </div>

            <p className="text-sm text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="
            px-3 py-1.5 rounded-xl text-sm font-medium
            bg-indigo-50 text-indigo-600
            hover:bg-indigo-100 transition
          "
          >
            Edit
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
            px-3 py-1.5 rounded-xl text-sm font-medium
            bg-red-50 text-red-600
            hover:bg-red-100 transition
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
