import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyRooms } from "../../api/room.api";

import type { Room } from "../../types/global.types";

const RoomList = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await getMyRooms();
      setRooms(data);
    };

    fetchRooms();
  }, []);

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <button
          key={room._id}
          onClick={() => navigate(`/chat/room/${room._id}`)}
          className="w-full text-left p-3 rounded-xl hover:bg-zinc-100 transition"
        >
          #{room.name}
        </button>
      ))}
    </div>
  );
};

export default RoomList;
