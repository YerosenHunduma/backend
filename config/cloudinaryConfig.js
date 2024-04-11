import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dm94aeunk",
  api_key: "972997294255268",
  api_secret: "NePK4_n2_dVJPfwENJiBcbcNDJ0",
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
