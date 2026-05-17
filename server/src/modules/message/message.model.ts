import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "room"],
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    content: {
      type: String,
      required: true,
    },

    isFile: {
      type: Boolean,
      default: false,
    },

    fileType: {
      type: String,
      default: null,
    },

    fileName: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Message", MessageSchema);
