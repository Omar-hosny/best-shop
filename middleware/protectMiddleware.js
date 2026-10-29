import jwt from "jsonwebtoken";
import AppError from "./AppError.js";
import User from "../models/User.model.js";
import { JWT_COOKIE } from "../lib/cookie.js";

const protectMiddleware = async (req, res, next) => {
  // `req.cookies` only exists because cookie-parser is mounted in server.js.
  // The optional chain keeps a missing parser a clean 401 instead of a 500.
  const token = req.cookies?.[JWT_COOKIE];
  const secret = process.env.JWT_SECRET;

  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to access this resource",
      401,
    );
  }

  if (!secret) {
    throw new AppError("JWT_SECRET not found", 500);
  }

  // Verify token
  const decodedToken = jwt.verify(token, secret);

  // Check if user still exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Attach user to request
  req.user = user;

  // Continue to the next middleware or route handler
  next();
};

export default protectMiddleware;
