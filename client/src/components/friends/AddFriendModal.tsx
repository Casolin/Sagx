import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { X, UserPlus, Users } from "lucide-react";
import { toast } from "react-toastify";

import type { User } from "../../types/global.types";
import { getDiscoverUsers } from "../../api/user.api";
import { sendFriendRequest } from "../../api/friend.api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddFriendModal = ({ open, onOpenChange }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getDiscoverUsers();
        setUsers(data);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    return users.filter((u) => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        name.includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, users]);

  const addFriend = async (userId: string) => {
    try {
      setSendingId(userId);

      await sendFriendRequest({
        recipientId: userId,
      });

      toast.success("Friend request sent");

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      toast.error(message);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md" />

        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            w-[92vw] max-w-xl
            -translate-x-1/2 -translate-y-1/2
            bg-white rounded-2xl shadow-2xl
            border border-zinc-200
            overflow-hidden
          "
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
            <div>
              <h2 className="text-lg font-semibold">Add Friends</h2>
              <p className="text-sm text-zinc-500">
                Discover people you may know
              </p>
            </div>

            <Dialog.Close className="p-2 rounded-lg hover:bg-zinc-100 cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="p-4 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl">
              <Users size={16} className="text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center py-10 text-zinc-500">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-zinc-400">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => addFriend(user._id)}
                    disabled={sendingId === user._id}
                    className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg hover:scale-[1.02] transition disabled:opacity-50 cursor-pointer"
                  >
                    <UserPlus size={16} />
                    {sendingId === user._id ? "..." : "Add"}
                  </button>
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddFriendModal;
