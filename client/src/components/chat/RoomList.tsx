import { useNavigate } from "react-router-dom";
import type { Room } from "../../types/global.types";

type Props = {
  rooms: Room[];
};

const RoomList = ({ rooms }: Props) => {
  const navigate = useNavigate();

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
