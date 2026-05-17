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
          w-full flex items-center justify-between
          bg-white border border-gray-100
          rounded-2xl p-5 shadow-sm
          hover:shadow-md transition
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            className="w-14 h-14 rounded-full border object-cover"
          />

          <div>
            <h3 className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>

            <p className="text-sm text-gray-500">{user.email}</p>

            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-3 py-1 rounded-full ${roleColor}`}>
                {user.role}
              </span>

              <span className={`text-xs px-3 py-1 rounded-full ${statusColor}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="
              bg-indigo-600 hover:bg-indigo-700
              text-white px-4 py-2 rounded-xl
              text-sm font-medium transition cursor-pointer
            "
          >
            Edit
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
              bg-red-500 hover:bg-red-600
              text-white px-4 py-2 rounded-xl
              text-sm font-medium transition cursor-pointer
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
