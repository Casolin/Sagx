import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    action: { type: String, required: true },

    entityType: { type: String },

    entityId: { type: mongoose.Schema.Types.ObjectId },

    description: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("ActivityLog", activityLogSchema);
