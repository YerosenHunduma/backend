import express from "express";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
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
    console.log(result);
    res.json(result);
  }
);

router.post(
  "/upload-profile",
  isAuthenticated,
  uploadImageFromLocalToServer.single("profile"),
  async (req, res, next) => {
    const mainFolderName = "profile";
    const userId = req?.userId;

    const result = await uploadTocloudinary(
      req.file.path,
      mainFolderName,
      req.body.profileCloudId
    );

    let user;
    user = await User.findById(userId);
    if (!user) {
      user = await Broker.findById(userId);
    }
    if (!user) {
      return next(new errorHandler("User not found", 404));
    }

    user.profile = result.secure_url;
    user.profileCloudId = result.public_id;
    await user.save();
    console.log(user);
    res.status(200).json({ success: true, user });
  }
);

export default router;
