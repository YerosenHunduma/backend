import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { getResetPasswordTemplate } from "../utils/resetPasswordTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const SignUp = catchAsyncError(async (req, res, next) => {
  const { name, username, email, password } = req.body;
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      const errorMessage = error.array().map((err) => err.msg);
      return next(new errorHandler(errorMessage[0], 400));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await new User({
      name,
      username,
      lastName,
      email,
      address,
      phoneNumber,
      password: hashedPassword,
    }).save();
    res.status(201).json("User Registered Successfully");
  } catch (error) {
    next(error);
  }
});

export const Signin = catchAsyncError(async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err || !user) {
        const errorMessage = info ? info.message : "Authentication failed";
        return next(new errorHandler(errorMessage, 401));
      }
      const token = jwt.sign({ _id: user._id }, process.env.jwt_secret_key, {
        expiresIn: "1m",
      });
      const { password: pass, ...userInfo } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json({ success: true, userInfo });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// export const signOut = async (req, res) => {
//   res.clearCookie("access_token");
//   res.status(200).json({ success: true, message: "Successfully signed out" });
// };

export const signOut = async (req, res) => {
  console.log(req.cookie);
  res.cookie("access_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Successfully signed out" });
};

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new errorHandler("No user is found with this email address", 404)
    );
  }

  const resetToken = user.generateResetPasswordToken();

  await user.save();

  const resetUrl = `${process.env.FrontEndUrl}/api/auth/forgetPassword/${resetToken}`;

  const message = getResetPasswordTemplate(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "AssetMarketSquare Password Reset",
      message,
    });
    res.status(400).json({
      success: true,
      message: `Password reset link has been sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    next(error);
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new errorHandler("Password reset token is invalid or has expired", 400)
    );
  }

  const error = validationResult(req);

  try {
    if (!error.isEmpty()) {
      const errorMessage = error.array().map((err) => err.msg);
      return next(new errorHandler(errorMessage[0], 400));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
});
