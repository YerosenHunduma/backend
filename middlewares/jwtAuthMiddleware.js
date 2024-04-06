import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorHandler.js";

export default (req, res, next) => {
  const authToken = req.cookies.access_token;
  if (!authToken) {
    return next(new errorHandler("Authorization invalid", 400));
  }
  try {
    jwt.verify(authToken, process.env.jwt_secret_key, (err, decoded) => {
      if (err) {
        return next(new errorHandler("Authorization invalid", 401));
      }
      req.userId = decoded._id;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};
