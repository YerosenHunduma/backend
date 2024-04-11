import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const uploadTocloudinary = async (localFilePath) => {
  const mainFolderName = "profile";

  console.log(localFilePath);

  return cloudinary.uploader
    .upload(localFilePath, { folder: mainFolderName })
    .then((result) => {
      fs.unlinkSync(localFilePath);
      return {
        message: "success",
        uploadedFile: {
          secure_url: result.secure_url,
          asset_id: result.asset_id,
        },
      };
    })
    .catch((err) => {
      fs.unlinkSync(localFilePath);
      return {
        message: "failed to upload",
        error: err.message,
      };
    });
};

export default uploadTocloudinary;
