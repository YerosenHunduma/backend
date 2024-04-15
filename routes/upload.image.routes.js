import express from "express";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";
import Broker from "../models/broker.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";

const router = express.Router();

router.post(
  "/upload-license",
  uploadImageFromLocalToServer.single("license"),
  async (req, res) => {
    console.log(req.file);
    const mainFolderName = "license";
    const result = await uploadTocloudinary(req.file.path, mainFolderName);
    res.json(result);
  }
);

router.post(
  "/upload-profile",
  jwtAuthMiddleware,
  uploadImageFromLocalToServer.single("profile"),
  async (req, res, next) => {
    const mainFolderName = "profile";
    const userId = req?.userId;
    console.log(userId);

    const result = await uploadTocloudinary(
      req.file.path,
      mainFolderName,
      req.body.profileCloudId
    );
    console.log(result.uploadedFile.secure_url);
    let user;
    user = await User.findById(userId);
    if (!user) {
      user = await Broker.findById(userId);
    }
    if (!user) {
      return next(new errorHandler("User not found", 404));
    }
    user.profile = result.uploadedFile.secure_url;
    user.profileCloudId = result.uploadedFile.public_id;
    await user.save();
    res.status(200).json({ success: true, user });
  }
);

export default router;
