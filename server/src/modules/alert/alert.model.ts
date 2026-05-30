import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },

    type: {
      type: String,
      enum: ["FAILURE", "ANOMALY", "MAINTENANCE", "MACHINE_FAILURE"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
      default: "OPEN",
    },

    failureType: {
      type: String,
      enum: [
        "NONE",
        "ELECTRICAL",
        "MECHANICAL",
        "HYDRAULIC",
        "SENSOR",
        "OVERHEAT",
        "UNKNOWN",
      ],
      default: "UNKNOWN",
    },

    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Alert", AlertSchema);
