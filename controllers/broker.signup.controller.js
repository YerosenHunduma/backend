import Broker from "../models/broker.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { errorHandler } from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";

export const SignUpBroker = catchAsyncError(async (req, res, next) => {
  const {
    name,
    username,
    email,
    password,
    lastName,
    phoneNumber,
    address,
    license,
    licenseCloudId,
  } = req.body;
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      const errorMessage = error.array().map((err) => err.msg);
      return next(new errorHandler(errorMessage[0], 400));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await new Broker({
      name,
      username,
      lastName,
      email,
      address,
      phoneNumber,
      license,
      licenseCloudId,
      password: hashedPassword,
    }).save();
    res.status(201).json("User Registered Successfully");
  } catch (error) {
    next(error);
  }
});
