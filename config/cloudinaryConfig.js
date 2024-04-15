import cloudinary from "./cloudinary.js";
import fs from "fs";

const uploadTocloudinary = async (
  localFilePath,
  mainFolderName,
  profileCloudId
) => {
  if (profileCloudId) {
    await cloudinary.uploader.destroy(profileCloudId);
  }
  return await cloudinary.uploader
    .upload(localFilePath, { folder: mainFolderName })
    .then((result) => {
      fs.unlinkSync(localFilePath);
      return {
        message: "success",
        uploadedFile: {
          secure_url: result.secure_url,
          public_id: result.public_id,
        },
      };
    })
    .catch((err) => {
      fs.unlinkSync(localFilePath);
      return {
        message: err.message,
        error: err.message,
      };
    });
};

export default uploadTocloudinary;
