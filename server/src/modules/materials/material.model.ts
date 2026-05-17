import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    description: {
      type: String,
      default: "",
    },

    failureTypes: {
      type: [String],
      default: [],
    },

    machineTypes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Material", MaterialSchema);
