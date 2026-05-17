import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { createRoom } from "../../api/room.api";
import { getFriends } from "../../api/friend.api";
import type { Friend } from "../../types/global.types";
import { X, Users } from "lucide-react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateRoomModal = ({ open, onOpenChange, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFriends();
        setFriends(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load friends");
      }
    };

    if (open) load();
  }, [open]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Room name is required");
      return;
    }

    if (selected.length < 1) {
      toast.error("Select at least 1 friend");
      return;
    }

    setLoading(true);

    try {
      await createRoom({
        name,
        members: selected,
      });

      toast.success("Room created successfully");
      window.location.href = "/chat";

      onCreated();
      onOpenChange(false);

      setName("");
      setSelected([]);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;

      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* FULL SCREEN BLUR */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

        {/* MODAL */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-105 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-100 p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Create Room
              </Dialog.Title>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* ROOM NAME */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter room name..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          />

          {/* FRIENDS LIST */}
          <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl border border-gray-100 p-3 bg-gray-50">
            {friends.length === 0 && (
              <p className="text-sm text-gray-400 text-center">
                No friends available
              </p>
            )}

            {friends.map((f) => {
              // @ts-expect-error chat
              const user = f.user;
              if (!user) return null;

              const isSelected = selected.includes(user._id);

              return (
                <button
                  key={user._id}
                  onClick={() => toggle(user._id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition text-left ${
                    isSelected
                      ? "bg-indigo-50 border border-indigo-200"
                      : "hover:bg-white"
                  }`}
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    className="w-9 h-9 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Click to {isSelected ? "remove" : "add"}
                    </p>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateRoomModal;
