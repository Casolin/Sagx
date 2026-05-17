/* ================= COMMON ================= */

export type ID = string;

/* ================= SHARED ENUMS ================= */

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type FailureType =
  | "NONE"
  | "ELECTRICAL"
  | "MECHANICAL"
  | "HYDRAULIC"
  | "SENSOR"
  | "OVERHEAT"
  | "UNKNOWN";

/* ================= USER ================= */

export type UserRole = "ADMIN" | "MANAGER" | "TECHNICIAN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  _id: ID;
  firstName: string;
  lastName: string;
  email: string;

  role: UserRole;
  skills: string[];
  availability: boolean;
  status: UserStatus;

  avatar: string;
  experience: number;

  currentTasks: number;
  assignedMissions: ID[];

  maxTasks: number;
  workloadScore: number;
  totalTasksDone: number;

  twoFactorEnabled?: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ================= MACHINE ================= */

export type MachineStatus = "OK" | "DOWN" | "MAINTENANCE";
export type MachineCondition = "NORMAL" | "ANOMALY" | "FAILURE";

export interface Machine {
  _id: ID;
  name: string;
  createdBy: ID;
  type: string;

  failureType: FailureType;
  status: MachineStatus;
  condition: MachineCondition;

  location?: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
}

export type CreateMachineDTO = {
  name: string;
  type: string;
  createdBy: string;
  failureType?: FailureType;
  status?: MachineStatus;
  condition?: MachineCondition;
  location?: string;
  description?: string;
};

export type UpdateMachineDTO = {
  name?: string;
  type?: string;
  failureType?: FailureType;
  status?: MachineStatus;
  condition?: MachineCondition;
  location?: string;
  description?: string;
};

/* ================= MATERIAL ================= */

export interface Material {
  _id: ID;
  name: string;
  quantity: number;
  unit: string;

  description?: string;
  failureTypes: FailureType[]; // tightened (was string[])
  machineTypes: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialDTO {
  name: string;
  quantity?: number;
  unit?: string;
  description?: string;
  failureTypes?: string[];
  machineTypes?: string[];
}

/* ================= ROOM ================= */

export interface Room {
  _id: ID;
  name: string;
  members: ID[];
  isPrivate: boolean;
  roomOwner: ID;

  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDTO {
  name: string;
  roomOwner?: string;
  members?: string[];
  isPrivate?: boolean;
}

/* ================= MESSAGE ================= */

export type MessageType = "private" | "room";

export interface Message {
  _id: ID;
  type: MessageType;
  sender: ID;
  receiver?: ID;
  roomId?: ID;
  isFile?: boolean;
  fileType: string;
  fileName: string;

  content: string;

  createdAt: string;
  updatedAt: string;
}

export type SelectedUser = {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

export type ActiveChat =
  | { type: "user"; user: SelectedUser }
  | { type: "room"; room: Room }
  | null;

export interface SendMessageDTO {
  type: MessageType;

  sender?: string;

  receiver?: string;

  roomId?: string;

  content: string;
}

export interface EditMessageDTO {
  messageId: string;
  content: string;
}

export interface DeleteMessageDTO {
  messageId: string;
}

/* ================= MISSION ================= */

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
export type TaskPriority = Priority;
export type TaskSource = "AUTO" | "MANUAL";

export type MissionsResponse = {
  success: boolean;
  data: Mission[];
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export interface Task {
  _id: ID;
  title: string;
  description?: string;

  source: TaskSource;
  machine?: ID | null;

  status: TaskStatus;
  priority: TaskPriority;

  dueDate?: string | null;
  estimatedTime: number;
  progress: number;

  createdAt: string;
  updatedAt: string;
}

export type MissionStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface MissionMaterial {
  materialId: ID;
  quantity: number;
}

export interface Mission {
  _id: ID;
  title: string;
  description: string;

  alertId?: ID | null;
  machine?: ID | null;

  machineType?: string;
  failureType?: FailureType;
  condition?: MachineCondition;

  status: MissionStatus;
  cancellationReason?: string | null;

  priority: Priority;

  createdBy: ID | PopulatedUser;
  assignedTo?: ID | PopulatedUser | null;

  missionSchedule: {
    scheduledAt: string;
    dueDate: string;
  };

  location?: string;

  requiredSkills: string[];
  materials: MissionMaterial[];
  tasks: Task[];

  progress: number;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export type MissionPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CreateMissionDTO {
  title: string;
  description: string;
  createdBy: string;

  alertId?: string;
  machine?: string;

  machineType?: string;
  failureType?: string;
  condition?: string;

  priority?: MissionPriority;
  assignedTo?: string;

  missionSchedule?: {
    scheduledAt?: string;
    dueDate?: string;
  };

  location?: string;
  requiredSkills?: string[];
  materials?: MissionMaterial[];

  tasks?: Omit<Task, "_id" | "createdAt" | "updatedAt">[];

  notes?: string;
}

export type UpdateMissionDTO = Partial<CreateMissionDTO> & {
  status?: MissionStatus;
  cancellationReason?: string;
};

export interface UpdateTaskStatusDTO {
  status: TaskStatus;
}

/* ================= ALERT ================= */

export type AlertType =
  | "FAILURE"
  | "ANOMALY"
  | "MAINTENANCE"
  | "MACHINE_FAILURE";

export type AlertStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type PopulatedMachine = {
  _id: ID;
  name: string;
};

export interface Alert {
  _id: ID;
  machine: ID | PopulatedMachine;

  type: AlertType;
  message: string;

  priority: Priority;
  status: AlertStatus;

  failureType: FailureType;

  missionId?: ID | null;

  createdAt: string;
  updatedAt: string;
}

/* ================= FRIEND ================= */

export type FriendStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Friend {
  _id: ID;

  requester: ID | PopulatedUser;

  recipient: ID | PopulatedUser;

  status: FriendStatus;

  createdAt: string;
  updatedAt: string;
}

/* ================= NOTIFICATION ================= */

export type NotificationType =
  | "FRIEND"
  | "MISSION"
  | "MATERIAL"
  | "SYSTEM"
  | "CHAT"
  | "ROOM";

export interface Notification {
  _id: ID;
  userId: ID;

  title: string;
  message: string;

  type: NotificationType;
  isRead: boolean;

  relatedId?: ID;

  createdAt: string;
  updatedAt: string;
}

/* ================= ACTIVITY LOG ================= */

export type Activity = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt?: string;
};

/* ================= AUTH ================= */

export interface LoginDTO {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type PopulatedUser = {
  _id: ID;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
};

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface PasswordResetRequestDTO {
  email: string;
}

export interface PasswordResetDTO {
  token: string;
  newPassword: string;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginUser: (data: LoginDTO) => Promise<void>;
  logoutUser: () => Promise<void>;
};

/* ================= AI ================= */

export interface AI_Technician {
  email: string;
  skills: string[];
  experience: number;
  currentTasks: number;
  maxTasks: number;
  availability: boolean;
}

export interface AI_AssignMissionDTO {
  requiredSkills: string[];
  technicians: AI_Technician[];
}

export interface AI_AssignResponse {
  assignedTechnician: AI_Technician | null;
  scoreUsed: number;
}
