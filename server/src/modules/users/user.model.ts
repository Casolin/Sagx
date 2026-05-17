import mongoose, { Schema, Document } from "mongoose";
import { UserRole, UserStatus } from "./user.types.js";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  skills: string[];
  availability: boolean;
  status: UserStatus;
  avatar: string;
  experience: number;
  currentTasks: number;
  assignedMissions: mongoose.Types.ObjectId[];
  maxTasks: number;
  workloadScore: number;
  totalTasksDone: number;
  refreshToken?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.TECHNICIAN,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    avatar: {
      type: String,
      default: function (this: IUser) {
        const fullName = `${this.firstName} ${this.lastName}`;
        return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`;
      },
    },
    experience: {
      type: Number,
      default: 1,
    },
    currentTasks: {
      type: Number,
      default: 0,
    },
    assignedMissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mission",
      },
    ],
    maxTasks: {
      type: Number,
      default: 5,
    },
    workloadScore: {
      type: Number,
      default: 0,
    },
    totalTasksDone: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User", UserSchema);
