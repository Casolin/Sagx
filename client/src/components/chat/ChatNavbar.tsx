import { Trash2, LogOut, Phone } from "lucide-react";
import type { SelectedUser } from "./ChatContent";
import { useEffect, useState, useCallback } from "react";
import { getMyRooms, deleteRoom, leaveRoom } from "../../api/room.api";
import type { Room } from "../../types/global.types";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useCallStore } from "../../utils/call.store";

interface Props {
  selectedUser?: SelectedUser | null;
  roomId?: string;
}

const LAST_ROUTE_KEY = "last_route_before_call";

const ChatNavbar = ({ selectedUser = null, roomId }: Props) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);

  const location = useLocation();

  const incomingCall = useCallStore((s) => s.incomingCall);
  const startCall = useCallStore((s) => s.startCall);

  const saveRoute = useCallback(() => {
    sessionStorage.setItem(LAST_ROUTE_KEY, location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!incomingCall) return;
    saveRoute();
  }, [incomingCall, saveRoute]);

  const handleStartCall = async () => {
    if (!selectedUser || !user) return;
    saveRoute();
    await startCall(selectedUser._id, user);
  };

  useEffect(() => {
    const fetch = async () => {
      if (!roomId) return;
      const rooms = await getMyRooms();
      const found = rooms.find((r) => r._id === roomId);
      setRoom(found || null);
    };

    fetch();
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
    } catch {
      toast.error("Failed to leave room");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoom(room!._id);
      toast.success("Room deleted");
    } catch {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {selectedUser && !isRoom && (
          <>
            <img
              src={selectedUser.avatar || "/default-avatar.png"}
              className="w-11 h-11 rounded-full"
            />
            <div>
              <p className="font-semibold text-sm sm:text-base">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </>
        )}

        {isRoom && (
          <div>
            <p className="font-semibold">{room?.name}</p>
            <p className="text-xs text-gray-500">
              {room?.members?.length ?? 0} members
            </p>
          </div>
        )}

        {!selectedUser && !isRoom && (
          <p className="text-gray-400">Select a chat</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {selectedUser && !isRoom && (
          <button
            onClick={handleStartCall}
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <Phone size={18} />
          </button>
        )}

        {isRoom && isMember && !isOwner && (
          <button
            onClick={handleLeave}
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        )}

        {isRoom && isOwner && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-gray-100 text-red-500 cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatNavbar;
