// cloudinary.ts
import cloudinary from "../cloudinary.config.js";
import { AppError } from "./AppError.js";

export const uploadAvatar = async (file: any): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const fileBuffer = file.data;

    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: "avatars",
          allowed_formats: ["webp", "jpg", "jpeg", "png"],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error: ", error);
            reject(new AppError("Error uploading image to Cloudinary", 500));
          } else {
            resolve(result?.secure_url || "");
          }
        },
      )
      .end(fileBuffer);
  });
};
