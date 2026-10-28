import jwt from "jsonwebtoken";
import AppError from "../middleware/AppError.js";
import { JWT_COOKIE, jwtCookieOptions } from "./cookie.js";

export const createToken = (userId, role = "user", res) => {
  const payload = {
    id: userId,
    role,
  };

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new AppError("JWT_SECRET is not defined", 500);
  }

  const token = jwt.sign(payload, secret, { expiresIn });

  // No maxAge: this is a session cookie, so it dies when the browser closes and
  // the token's own `exp` is the only lifetime ceiling. Adding a maxAge here
  // reintroduces the risk of it disagreeing with JWT_EXPIRES_IN.
  res.cookie(JWT_COOKIE, token, jwtCookieOptions());

  return token;
};
