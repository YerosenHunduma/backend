import express from "express";
import * as auth from "../controllers/auth.controllers.js";
import * as brokerAuth from "../controllers/broker.signup.controller.js";
import { registerationValidator } from "../Validators/registrationValidator.js";
import { resetPasswordValidator } from "../Validators/resetPasswordValidator.js";
import jwtAuthMiddleware from "../middlewares/jwtAuthMiddleware.js";

const router = express.Router();

router.post("/signup", registerationValidator, auth.SignUp);
router.post("/signin", auth.Signin);
router.post("/signOut", auth.signOut);
router.post("/signup-broker", registerationValidator, brokerAuth.SignUpBroker);
router.put("/update-profile", jwtAuthMiddleware, auth.updateProfile);
router.post("/forgotPassword", auth.forgotPassword);
router.put(
  "/resetPassword/:token/:userId",
  resetPasswordValidator,
  auth.resetPassword
);

export default router;
