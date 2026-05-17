import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["FRIEND", "MISSION", "MATERIAL", "SYSTEM", "CHAT", "ROOM"],
      default: "SYSTEM",
    },

    isRead: { type: Boolean, default: false },

    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
