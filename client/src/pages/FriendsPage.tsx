import { useEffect, useState } from "react";
import { Users, UserPlus, Sparkles } from "lucide-react";

import {
  acceptFriend,
  getFriends,
  getRequests,
  rejectFriend,
  removeFriend,
} from "../api/friend.api";

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
    <div className="min-h-screen bg-zinc-50 text-black">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">Friends</h1>
              <p className="text-sm text-zinc-500">
                Manage connections & chats
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenAddFriend(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:scale-[1.02] transition cursor-pointer"
          >
            <UserPlus size={18} />
            Add friend
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition">
            <p className="text-sm text-zinc-500">Total friends</p>
            <p className="text-3xl font-semibold mt-1">{friends.length}</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition">
            <p className="text-sm text-zinc-500">Pending requests</p>
            <p className="text-3xl font-semibold mt-1">{requests.length}</p>
          </div>
        </div>

        {/* REQUESTS */}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-zinc-900">Requests</h2>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
            <FriendRequests
              requests={requests}
              currentUserId={CURRENT_USER_ID}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </div>
        </section>

        {/* FRIENDS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <h2 className="text-lg font-semibold">Your Friends</h2>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-4">
            <FriendList
              friends={friends}
              currentUserId={CURRENT_USER_ID}
              onRemove={handleRemove}
              onMessage={handleMessage}
            />
          </div>
        </section>
        <AddFriendModal open={openAddFriend} onOpenChange={setOpenAddFriend} />
      </div>
    </div>
  );
};

export default FriendsPage;
