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

  const roleStyle = {
    ADMIN: "bg-black text-white",
    MANAGER: "bg-zinc-800 text-white",
    TECHNICIAN: "bg-zinc-200 text-zinc-900",
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
      <div
        className="
          group relative w-full
          rounded-2xl border border-zinc-200
          bg-white p-5
          flex items-center justify-between
          gap-4
          transition-all duration-200
          hover:border-zinc-300
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* avatar */}
          <div className="relative">
            <img
              src={user.avatar}
              className="w-11 h-11 rounded-full object-cover border border-zinc-200"
            />
          </div>

          {/* info */}
          <div className="min-w-0">
            <h3 className="font-medium text-zinc-900">
              {user.firstName} {user.lastName}
            </h3>

            <p className="text-sm text-zinc-500 truncate max-w-64">
              {user.email}
            </p>

            {/* role only (minimal + clean) */}
            <div className="mt-2">
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${roleStyle}`}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(user)}
            className="
              px-3 py-2 rounded-xl text-sm font-medium
              border border-zinc-200 text-zinc-700
              hover:bg-zinc-100 transition
            "
          >
            Edit
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
              px-3 py-2 rounded-xl text-sm font-medium
              border border-zinc-200 text-red-600
              hover:bg-red-50 transition
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
