import type { User } from "../../types/global.types";
import UserCard from "./UserCard";

interface Props {
  users: User[];

  onEdit: (user: User) => void;

  onDelete: (id: string) => void;
}

export default function UserList({ users, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
