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
}

const ChatSidebar = ({ setSelectedUser }: Props) => {
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
      <div className="w-64 md:w-[320px] bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* ROOMS HEADER */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between mr-2">
          <p className="text-sm font-semibold text-gray-700">Rooms</p>

          <button
            onClick={() => setOpenCreateRoom(true)}
            className="flex items-center gap-1 text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition cursor-pointer"
          >
            <Plus size={14} />
            Add Room
          </button>
        </div>

        {/* ROOMS */}
        <div className="px-4 pt-3">
          <RoomList />
        </div>

        {/* FRIENDS */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs uppercase text-gray-400 mb-3 tracking-wider">
            Friends
          </h2>

          <div className="space-y-2">
            {friends.length === 0 && (
              <p className="text-sm text-gray-400">No friends yet</p>
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
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition group"
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition"
                  />

                  <div className="text-left min-w-0">
                    <p className="font-medium truncate text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Click to chat
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <CreateRoomModal
        open={openCreateRoom}
        onOpenChange={setOpenCreateRoom}
        onCreated={() => {
          // optional: refresh room list later
        }}
      />
    </>
  );
};

export default ChatSidebar;
