import FriendCard from "./FriendCard";

import type { Friend } from "../../types/global.types";

interface Props {
  friends: Friend[];

  currentUserId: string;

  onRemove: (id: string) => void;

  onMessage: (id: string) => void;
}

const FriendList = ({ friends, currentUserId, onRemove, onMessage }: Props) => {
  if (!friends.length) {
    return <div className="text-zinc-500 text-center py-8">No friends yet</div>;
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <FriendCard
          key={friend._id}
          friend={friend}
          currentUserId={currentUserId}
          onRemove={onRemove}
          onMessage={onMessage}
        />
      ))}
    </div>
  );
};

export default FriendList;
