import { matchedData } from "express-validator";
import User from "../models/User.model.js";
import AppError from "../middleware/AppError.js";
import { createToken } from "../lib/createToken.js";
import { JWT_COOKIE, jwtCookieOptions } from "../lib/cookie.js";

export const registerUser = async (req, res) => {
  // Only fields that passed validation are read, so a client can never smuggle
  // in extra properties like `role` or `isActive`.
  const { name, email, password } = matchedData(req, { locations: ["body"] });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({ name, email, password });
  const { password: _password, ...safeUser } = user.toObject();

  // create token for this user and set it in the cookie of the response.
  createToken(user._id, user.role, res);

  res.status(201).json({ success: true, data: safeUser });
};

export const loginUser = async (req, res) => {
  const { email, password } = matchedData(req, { locations: ["body"] });

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password: _password, ...safeUser } = user.toObject();

  // create token for this user and set it in the cookie of the response.
  createToken(user._id, user.role, res);

  res.status(200).json({ success: true, data: safeUser });
};

export const logoutUser = (req, res) => {
  // The options must mirror jwtCookieOptions() or the browser keeps the cookie.
  res.clearCookie(JWT_COOKIE, jwtCookieOptions());

  res.status(200).json({
    success: true,
    data: { message: "User logged out successfully" },
  });
};

// get loged in user
export const getMe = async (req, res) => {
  // protectMiddleware already loaded and attached the user, so no second query.
  res.status(200).json({
    success: true,
    data: req.user.toObject(),
  });
};
