import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URL;

  if (!mongoUri) throw new Error("MONGODB_URL is not defined");

  try {
    await mongoose.connect(mongoUri);
    console.log("Database Connected");
  } catch (error: any) {
    console.error("DB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
