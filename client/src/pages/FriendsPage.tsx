import { useEffect, useState } from "react";
import { Users, UserPlus, Sparkles } from "lucide-react";

import {
  acceptFriend,
  getFriends,
  getRequests,
  rejectFriend,
  removeFriend,
} from "../api/friend.api";

import { SOCKET_EVENTS } from "../services/socket.events";
import { getSocket } from "../services/socket.service";

import FriendList from "../components/friends/FriendList";
import FriendRequests from "../components/friends/FriendRequests";
import AddFriendModal from "../components/friends/AddFriendModal";

import type { Friend } from "../types/global.types";

const CURRENT_USER_ID = "YOUR_USER_ID";

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getRequests(),
      ]);

      setFriends(friendsData);
      setRequests(requestsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleFriendRequest = () => {
      fetchData();
    };

    const handleFriendAccept = () => {
      fetchData();
    };

    const handleFriendReject = () => {
      fetchData();
    };

    const handleFriendRemove = () => {
      fetchData();
    };

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST, handleFriendRequest);
    socket.on(SOCKET_EVENTS.FRIEND_ACCEPT, handleFriendAccept);
    socket.on(SOCKET_EVENTS.FRIEND_REMOVE, handleFriendReject);
    socket.on(SOCKET_EVENTS.FRIEND_REMOVE, handleFriendRemove);

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST, handleFriendRequest);
      socket.off(SOCKET_EVENTS.FRIEND_ACCEPT, handleFriendAccept);
      socket.off(SOCKET_EVENTS.FRIEND_REMOVE, handleFriendReject);
      socket.off(SOCKET_EVENTS.FRIEND_REMOVE, handleFriendRemove);
    };
  }, []);

  const handleAccept = async (id: string) => {
    await acceptFriend(id);
    fetchData();
  };

  const handleReject = async (id: string) => {
    await rejectFriend(id);
    fetchData();
  };

  const handleRemove = async (id: string) => {
    await removeFriend(id);
    fetchData();
    setFriends((prev) => prev.filter((f) => f._id !== id));
  };

  const handleMessage = (id: string) => {
    console.log("open chat", id);
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-black">
      {/* HEADER */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
              <p className="text-sm text-zinc-500">
                Manage connections, requests & chats
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenAddFriend(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:scale-[1.03] active:scale-95 transition shadow-sm cursor-pointer"
          >
            <UserPlus size={18} />
            Add friend
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* HERO STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-black/5 rounded-full" />
            <p className="text-sm text-zinc-500">Total friends</p>
            <p className="text-4xl font-bold mt-2">{friends.length}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full" />
            <p className="text-sm text-zinc-500">Pending requests</p>
            <p className="text-4xl font-bold mt-2">{requests.length}</p>
          </div>
        </div>

        {/* REQUESTS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-yellow-100 text-yellow-600">
              <Sparkles size={16} />
            </div>
            <h2 className="text-lg font-semibold">Friend Requests</h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 text-sm text-zinc-500">
              People who want to connect with you
            </div>

            <div className="p-2">
              <FriendRequests
                requests={requests}
                currentUserId={CURRENT_USER_ID}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            </div>
          </div>
        </section>

        {/* FRIENDS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-black text-white">
              <Users size={16} />
            </div>
            <h2 className="text-lg font-semibold">Your Network</h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 text-sm text-zinc-500">
              Chat and manage your connections
            </div>

            <div className="p-2">
              <FriendList
                friends={friends}
                currentUserId={CURRENT_USER_ID}
                onRemove={handleRemove}
                onMessage={handleMessage}
              />
            </div>
          </div>
        </section>

        <AddFriendModal open={openAddFriend} onOpenChange={setOpenAddFriend} />
      </div>
    </div>
  );
};

export default FriendsPage;
