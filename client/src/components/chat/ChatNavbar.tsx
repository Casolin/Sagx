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
    <div className="h-16 bg-white/80 backdrop-blur border-b border-zinc-200 px-6 flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4 min-w-0">
        {/* PRIVATE CHAT */}
        {selectedUser && !isRoom && (
          <>
            <div className="relative">
              <img
                src={selectedUser.avatar || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
              />

              {/* online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm text-zinc-800 truncate">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>

              <p className="text-xs text-green-600">Active now</p>
            </div>
          </>
        )}

        {/* ROOM */}
        {isRoom && (
          <div className="min-w-0">
            <p className="font-semibold text-sm text-zinc-800 truncate">
              {room?.name}
            </p>

            <p className="text-xs text-zinc-500">
              {room?.members?.length ?? 0} members
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!selectedUser && !isRoom && (
          <p className="text-sm text-zinc-400">Select a conversation</p>
        )}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2">
        {/* CALL */}
        {selectedUser && !isRoom && (
          <button
            onClick={handleStartCall}
            className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition cursor-pointer"
            title="Start call"
          >
            <Phone size={18} />
          </button>
        )}

        {/* LEAVE ROOM */}
        {isRoom && isMember && !isOwner && (
          <button
            onClick={handleLeave}
            className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 transition"
            title="Leave room"
          >
            <LogOut size={18} />
          </button>
        )}

        {/* DELETE ROOM */}
        {isRoom && isOwner && (
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition"
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
