import dotenv from "dotenv";
import { errorHandler } from "../utils/errorHandler.js";
dotenv.config();
export default (err, req, res, next) => {
  let error = {
    message: err?.message || "Internal server error",
    statusCode: err?.statusCode || 500,
  };

  // handle invalid mongoose id error
  if (err?.name === "CastError") {
    const message = `Resource not found. Invalid ${err?.path}`;
    error = new errorHandler(message, 404);
  }

  // handle validation  error
  if (err?.name === "validationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new errorHandler(message, 400);
  }

  // handle mongoose depulicate key error
  if (err?.code === 11000) {
    const message = `${Object.keys(err?.keyValue)} already taken. Please try with different ${Object.keys(err?.keyValue)} `;
    error = new errorHandler(message, 400);
  }

  // handle Invalid Jwt error
  if (err?.name === "JsonWebTokenError") {
    const message = "Token is invalid, please try again";
    error = new errorHandler(message, 400);
  }

  // handle Expired Jwt error
  if (err?.name === "TokenExpiredError") {
    const message = "Token is expired, please try again";
    error = new errorHandler(message, 400);
  }

  if (process.env.NODE_ENV == "DEVELOPMENT") {
    res
      .status(error.statusCode)
      .json({ message: error.message, error: err, stack: err?.stack });
  }
  if (process.env.NODE_ENV === "PRODUCTION") {
    res.status(error.statusCode).json(error);
  }
};
