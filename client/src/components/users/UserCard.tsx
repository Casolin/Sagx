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
        rounded-2xl border border-gray-100
        bg-white/80 backdrop-blur-md
        p-5
        flex flex-col sm:flex-row items-center justify-between
        gap-5
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-1
        hover:border-gray-200
      "
      >
        {/* left accent glow */}
        <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-indigo-500 via-blue-500 to-cyan-400 rounded-l-2xl opacity-0 group-hover:opacity-100 transition" />

        {/* LEFT */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* avatar */}
          <div className="relative">
            <img
              src={user.avatar}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition"
            />

            {/* status dot */}
            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white ${
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
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                {user.firstName} {user.lastName}
              </h3>

              {/* subtle status pill */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                  user.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-600"
                    : user.status === "SUSPENDED"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {user.status.toLowerCase()}
              </span>
            </div>

            <p className="text-sm text-gray-500 truncate max-w-64">
              {user.email}
            </p>

            {/* role badge row */}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium shadow-sm border ${roleColor}`}
              >
                {user.role}
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
            bg-indigo-600 text-white
            hover:bg-indigo-500
            active:scale-95
            transition
            shadow-sm
          "
          >
            Edit
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
            px-3 py-2 rounded-xl text-sm font-medium
            bg-red-500 text-white
            hover:bg-red-400
            active:scale-95
            transition
            shadow-sm
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
