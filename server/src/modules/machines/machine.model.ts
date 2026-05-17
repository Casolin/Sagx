import mongoose from "mongoose";

const MachineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
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
      default: "NONE",
    },

    status: {
      type: String,
      enum: ["OK", "DOWN", "MAINTENANCE"],
      default: "OK",
    },

    condition: {
      type: String,
      enum: ["NORMAL", "ANOMALY", "FAILURE"],
      default: "NORMAL",
    },

    location: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Machine", MachineSchema);
