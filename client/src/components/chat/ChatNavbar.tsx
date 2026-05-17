import { CheckCircle, Trash2, LogOut } from "lucide-react";
import type { SelectedUser } from "./ChatContent";
import { useEffect, useState } from "react";
import { getMyRooms, deleteRoom, leaveRoom } from "../../api/room.api";
import type { Room } from "../../types/global.types";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

interface Props {
  selectedUser?: SelectedUser | null;
  roomId?: string;
}

const ChatNavbar = ({ selectedUser = null, roomId }: Props) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const rooms = await getMyRooms();
        const found = rooms.find((r) => r._id === roomId);
        setRoom(found || null);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load rooms",
        );
      }
    };

    if (roomId) fetch();
  }, [roomId]);

  const isRoom = !!roomId && !!room;

  const isOwner =
    isRoom && room && user?._id && String(room.roomOwner) === String(user._id);

  const isMember =
    isRoom &&
    room &&
    user?._id &&
    room.members?.some((m) => String(m) === String(user._id));

  const handleLeave = async () => {
    try {
      await leaveRoom(room!._id);
      toast.success("Left room");
      window.location.href = "/chat";
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to leave room");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoom(room!._id);
      toast.success("Room deleted");
      window.location.href = "/chat";
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete room");
    }
  };

  return (
    <div className="h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 flex items-center justify-between shadow-sm">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {selectedUser && !isRoom && (
          <>
            <img
              src={selectedUser.avatar || "/default-avatar.png"}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-400"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Online
              </p>
            </div>
          </>
        )}

        {isRoom && (
          <div>
            <p className="font-semibold text-gray-900">{room?.name}</p>
            <p className="text-xs text-gray-500">
              {room?.members?.length ?? 0} members
            </p>
          </div>
        )}

        {!selectedUser && !isRoom && (
          <p className="text-gray-400">Select a chat</p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* PRIVATE CHAT ICON */}
        {selectedUser && !isRoom && (
          <CheckCircle size={18} className="text-green-500" />
        )}

        {/* LEAVE ROOM */}
        {isRoom && isMember && !isOwner && (
          <button
            onClick={handleLeave}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition cursor-pointer"
            title="Leave room"
          >
            <LogOut size={18} />
          </button>
        )}

        {/* DELETE ROOM */}
        {isRoom && isOwner && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition cursor-pointer"
            title="Delete room"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatNavbar;
