import { matchedData } from "express-validator";
import User from "../models/User.model.js";
import AppError from "../middleware/AppError.js";

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

  res.status(200).json({ success: true, data: safeUser });
};
