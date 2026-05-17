import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <--- import useNavigate
import { Check, MessageCircle, UserMinus, X } from "lucide-react";
import type { PopulatedUser } from "../../types/global.types";
import ConfirmModal from "../ConfirmModal";

interface Props {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  friend: any;
  currentUserId: string;
  type?: "friend" | "request";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMessage: (id: string) => void;
  onRemove?: (id: string) => void;
}

const FriendCard = ({
  friend,
  currentUserId,
  type = "friend",
  onAccept,
  onReject,
  onRemove,
}: Props) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // <--- initialize navigate

  const user: PopulatedUser =
    friend.user ||
    (friend.requester?._id === currentUserId
      ? friend.recipient
      : friend.requester);

  if (!user?._id) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleDelete = () => {
    onRemove?.(user._id);
    setOpen(false);
  };

  const handleChat = () => {
    navigate(`/chat/private/${user._id}`); // <--- navigate to private chat
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            className="w-14 h-14 rounded-full object-cover"
          />

          <div>
            <h3 className="font-semibold text-base text-black">{fullName}</h3>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {type === "friend" && (
            <>
              <button
                onClick={handleChat} // <--- navigate on click
                className="p-2.5 rounded-xl bg-black text-white cursor-pointer"
              >
                <MessageCircle size={16} />
              </button>

              <button
                onClick={() => setOpen(true)}
                className="p-2.5 rounded-xl border border-zinc-300 cursor-pointer"
              >
                <UserMinus size={16} />
              </button>
            </>
          )}

          {type === "request" && (
            <>
              <button
                onClick={() => onAccept?.(friend._id)}
                className="p-2.5 rounded-xl bg-green-500 text-white cursor-pointer"
              >
                <Check size={16} />
              </button>

              <button
                onClick={() => onReject?.(friend._id)}
                className="p-2.5 rounded-xl bg-red-500 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={open}
        title="Remove Friend"
        message={`Are you sure you want to remove ${fullName}?`}
        confirmText="Delete"
        variant="danger"
        onOpenChange={setOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default FriendCard;
