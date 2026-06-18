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
      <div
        className="
        group relative w-full
        rounded-2xl
        border border-zinc-800
        bg-zinc-950
        p-5
        flex items-center justify-between
        gap-4
        transition-all duration-300
        hover:border-zinc-600
        hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]
        hover:-translate-y-1
      "
      >
        {/* subtle top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-40" />

        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">
          {/* avatar */}
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-700"
            />

            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-zinc-900 ${
                user.status === "ACTIVE"
                  ? "bg-white"
                  : user.status === "SUSPENDED"
                  ? "bg-zinc-500"
                  : "bg-zinc-700"
              }`}
            />
          </div>

          {/* info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate group-hover:text-zinc-200 transition">
                {user.firstName} {user.lastName}
              </h3>

              <span
                className="
                text-[10px]
                px-2 py-0.5
                rounded-full
                border border-zinc-700
                text-zinc-300
              "
              >
                {user.role}
              </span>
            </div>

            <p className="text-sm text-zinc-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="
            px-3 py-1.5 rounded-xl text-sm font-medium
            border border-zinc-700
            text-white
            hover:bg-white hover:text-black
            transition
          "
          >
            Edit
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
            px-3 py-1.5 rounded-xl text-sm font-medium
            border border-zinc-700
            text-zinc-300
            hover:bg-white hover:text-black
            transition
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
