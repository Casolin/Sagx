import FriendCard from "./FriendCard";

import type { Friend } from "../../types/global.types";

interface Props {
  requests: Friend[];

  currentUserId: string;

  onAccept: (id: string) => void;

  onReject: (id: string) => void;
}

const FriendRequests = ({
  requests,
  currentUserId,
  onAccept,
  onReject,
}: Props) => {
  if (!requests.length) {
    return (
      <div className="text-zinc-500 text-center py-8">No pending requests</div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <FriendCard
          key={request._id}
          friend={request}
          currentUserId={currentUserId}
          type="request"
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default FriendRequests;
