import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorHandler.js";

export const isAuthenticated = (req, res, next) => {
  console.log(req);
  console.log(req.cookies);
  const authToken = req.cookies.access_token;
  if (!authToken) {
    return next(new errorHandler("Authorization invalid", 400));
  }
  try {
    jwt.verify(authToken, process.env.jwt_secret_key, (err, decoded) => {
      if (err) {
        return next(new errorHandler(err.message, 401));
      }

      req.userId = decoded._id;
      req.role = decoded.role;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

export const authorizedRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(
        new errorHandler("You are not authorized to access this resource", 403)
      );
    }
    next();
  };
};
