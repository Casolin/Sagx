import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import RoomList from "./RoomList";
import { getFriends } from "../../api/friend.api";
import CreateRoomModal from "../rooms/CreateRoomModal";

import type { Friend } from "../../types/global.types";
import type { SelectedUser } from "./ChatContent";

interface Props {
  setSelectedUser: (user: SelectedUser) => void;
  closeSidebar?: () => void;
}

const ChatSidebar = ({ setSelectedUser, closeSidebar }: Props) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [openCreateRoom, setOpenCreateRoom] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(Array.isArray(data) ? data : []);
      } catch {
        setFriends([]);
      }
    };
    fetchFriends();
  }, []);

  return (
    <>
      <div className="md:w-[320px] bg-[#f9f9f9] border-r border-zinc-200 flex flex-col h-full transition-all duration-300 overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-800">Chat</p>
            <p className="text-xs text-zinc-500">Rooms & friends</p>
          </div>

          <button
            onClick={() => setOpenCreateRoom(true)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-black text-white hover:opacity-90 transition cursor-pointer"
          >
            <Plus size={14} />
            Room
          </button>
        </div>

        {/* ROOMS */}
        <div className="px-4 pt-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-2">
            Rooms
          </p>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2">
            <RoomList />
          </div>
        </div>

        {/* FRIENDS */}
        <div className="flex-1 overflow-y-auto px-4 pt-5">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-3">
            Friends
          </p>

          <div className="space-y-1">
            {friends.length === 0 && (
              <div className="text-sm text-zinc-400 px-2 py-3">
                No friends yet
              </div>
            )}

            {friends.map((friend) => {
              // @ts-expect-error chat
              const user = friend.user;
              if (!user) return null;

              return (
                <button
                  key={friend._id}
                  onClick={() => {
                    setSelectedUser({
                      _id: user._id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      avatar: user.avatar,
                    });
                    navigate(`/chat/private/${user._id}`);
                    closeSidebar?.();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 transition group"
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition"
                  />

                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="text-xs text-zinc-500 truncate">
                      Click to start chat
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL */}
        <CreateRoomModal
          open={openCreateRoom}
          onOpenChange={setOpenCreateRoom}
          onCreated={() => {
            // optional refresh
          }}
        />
      </div>
    </>
  );
};

export default ChatSidebar;
