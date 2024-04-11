import express from "express";
import * as auth from "../controllers/auth.controllers.js";
import * as brokerAuth from "../controllers/broker.signup.controller.js";
import { registerationValidator } from "../Validators/registrationValidator.js";
import { resetPasswordValidator } from "../Validators/resetPasswordValidator.js";
import uploadImageFromLocalToServer from "../helpers/multer.js";
import uploadTocloudinary from "../config/cloudinaryConfig.js";

const router = express.Router();

router.post("/signup", registerationValidator, auth.SignUp);
router.post("/signin", auth.Signin);
router.post("/signOut", auth.signOut);
router.post("/signup-broker", registerationValidator, brokerAuth.SignUpBroker);
router.post("/forgotPassword", auth.forgotPassword);
router.put(
  "/resetPassword/:token/:userId",
  resetPasswordValidator,
  auth.resetPassword
);
router.post(
  "/upload-profile",
  uploadImageFromLocalToServer.single("profile"),
  async (req, res) => {
    console.log(req.file);
    const result = await uploadTocloudinary(req.file.path);
    res.json(result);
  }
);

export default router;
