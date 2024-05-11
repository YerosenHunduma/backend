import Broker from "../models/broker.model.js";
import User from "../models/user.model.js";
import verfiyTokenModel from "../models/verfiyToken.model.js";
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
  const { name, username, email, password, lastName, phoneNumber, address } =
    req.body;
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
      const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.jwt_secret_key,
        {
          expiresIn: "1h",
        }
      );
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

export const signOut = async (req, res) => {
  res.cookie("access_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Successfully signed out" });
};

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const {
    name,
    lastName,
    email,
    address,
    phoneNumber,
    profile,
    biography,
    profileCloudId,
    role,
  } = req.body;

  const newUserData = {
    name,
    lastName,
    email,
    address,
    phoneNumber,
    profile,
    biography,
    profileCloudId,
  };

  let user;
  if (role == "Broker") {
    user = await Broker.findByIdAndUpdate(req.userId, newUserData, {
      new: true,
    });
  } else {
    user = await User.findByIdAndUpdate(req.userId, newUserData, {
      new: true,
    });
  }
  if (!user) {
    return next(new errorHandler("No user is found", 404));
  }
  res.status(200).json(user);
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      const errorMessage = error.array().map((err) => err.msg);
      return next(new errorHandler(errorMessage[0], 400));
    }
    let existingUser;
    const existingBroker = await Broker.findById(req.userId);
    if (!existingBroker) {
      existingUser = await User.findById(req.userId);
      if (!existingUser) {
        return next(
          new errorHandler("No user is found with this email address", 404)
        );
      }
    }
    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isMatch) {
      return next(new errorHandler("Old password is incorrect", 400));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    existingUser.password = hashedPassword;
    await existingUser.save();
    res.status(200).json("Password updated successfully");
  } catch (err) {
    console.log(err.message);
  }
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  let userType;
  let existingUser;
  const existingBroker = await Broker.findOne({ email });
  if (!existingBroker) {
    existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(
        new errorHandler("No user is found with this email address", 404)
      );
    }
    userType = "User";
  } else {
    userType = "Broker";
  }
  let verificationToken = await verfiyTokenModel.findOne({
    _userId: existingBroker ? existingBroker._id : existingUser._id,
  });

  if (verificationToken) {
    await verfiyTokenModel.deleteOne();
  }

  const reset_Token = crypto.randomBytes(32).toString("hex");

  let newVerificationToken = await new verfiyTokenModel({
    _userId: existingBroker ? existingBroker._id : existingUser._id,
    token: reset_Token,
    createdAt: Date.now(),
    userType,
  }).save();

  try {
    if (existingBroker || existingUser) {
      let resetToken = newVerificationToken.token;
      let userId = existingBroker ? existingBroker._id : existingUser._id;

      const resetUrl = `${process.env.FrontEndUrl}/resetpassword/${resetToken}/${userId}`;

      console.log(resetUrl);
      const message = getResetPasswordTemplate(
        existingBroker ? existingBroker.name : existingUser.name,
        resetUrl
      );
      await sendEmail({
        email: existingBroker ? existingBroker.email : existingUser.email,
        subject: "AssetMarketSquare Password Reset",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Password reset link has been sent to ${existingBroker ? existingBroker.email : existingUser.email}`,
      });
    }
  } catch (error) {
    await verfiyTokenModel.findByIdAndDelete(
      existingBroker ? existingBroker._id : existingUser._id
    );
    next(error);
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token, userId } = req.params;
  console.log(req.body);
  console.log(req.params);

  const passwordResetToken = await verfiyTokenModel.findOne({
    _userId: userId,
  });
  if (!passwordResetToken || passwordResetToken.token !== token) {
    return next(
      new errorHandler(
        "Your token is expired or invalid. Try resetting your password again",
        400
      )
    );
  }

  let existingUser;
  existingUser = await Broker.findById(userId);

  if (!existingUser) {
    existingUser = await User.findById(userId);
  }

  const error = validationResult(req);

  try {
    if (!error.isEmpty()) {
      const errorMessage = error.array().map((err) => err.msg);
      return next(new errorHandler(errorMessage[0], 400));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    existingUser.password = hashedPassword;

    await verfiyTokenModel.findByIdAndDelete(passwordResetToken._id);

    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
});

export const getuserProfile = async (req, res, next) => {
  let user;
  user = await User.findById(req.userId);
  if (!user) {
    user = await Broker.findById(req.userId);
    if (!user) {
      return next(
        new errorHandler("No user is found with this email address", 404)
      );
    }
  }
  res.status(200).json(user);
};
