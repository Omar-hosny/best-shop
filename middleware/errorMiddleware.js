import mongoose from "mongoose";
import AppError from "./AppError.js";

const errorMiddleware = (error, req, res, next) => {
  let statusCode = error.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = error.message || "Something went wrong";
  let errors;

  if (error instanceof mongoose.Error.ValidationError) {
    // Schema-level validation failed
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  } else if (error.code === 11000) {
    // Unique index violated (e.g. duplicate email)
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists`;
  } else if (error instanceof mongoose.Error.CastError) {
    // Malformed ObjectId / type
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  } else if (error.name === "TokenExpiredError") {
    // jsonwebtoken: token past its `exp`
    statusCode = 401;
    message = "Your session has expired. Please log in again";
  } else if (error.name === "JsonWebTokenError") {
    // jsonwebtoken: bad signature / malformed token
    statusCode = 401;
    message = "Invalid token. Please log in again";
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
};

export default errorMiddleware;
