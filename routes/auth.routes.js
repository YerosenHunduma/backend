import express from "express";
import * as auth from "../controllers/auth.controllers.js";
import { registerationValidator } from "../Validators/registrationValidator.js";
import { resetPasswordValidator } from "../Validators/resetPasswordValidator.js";

const router = express.Router();

router.post("/signup", registerationValidator, auth.SignUp);
router.post("/signin", auth.Signin);
router.post("/signOut", auth.signOut);
router.post("/forgotPassword", auth.forgotPassword);
router.put("/resetPassword/:token", resetPasswordValidator, auth.resetPassword);

export default router;
