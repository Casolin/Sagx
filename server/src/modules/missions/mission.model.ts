import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    source: { type: String, enum: ["AUTO", "MANUAL"], required: true },

    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"],
      default: "PENDING",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    dueDate: { type: Date, default: null },

    estimatedTime: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const MissionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      default: null,
    },

    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert",
      default: null,
    },

    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      default: null,
    },

    machineType: {
      type: String,
      default: "",
    },

    failureType: {
      type: String,
      default: "UNKNOWN",
    },

    condition: {
      type: String,
      default: "NORMAL",
    },

    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    cancellationReason: {
      type: String,
      default: null,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    missionSchedule: {
      scheduledAt: { type: Date, default: Date.now() },
      dueDate: { type: Date, default: Date.now() },
    },

    location: String,

    requiredSkills: {
      type: [String],
      default: [],
    },

    materials: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
        },
        quantity: Number,
      },
    ],

    tasks: [TaskSchema],

    progress: {
      type: Number,
      default: 0,
    },

    notes: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Mission", MissionSchema);
