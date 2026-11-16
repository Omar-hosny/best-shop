import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/user.controller.js";
import { registerRules, loginRules } from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.js";
import protectMiddleware from "../middleware/protectMiddleware.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middleware/rateLimiters.js";

const router = express.Router();

// Limiter runs before validation so brute-force attempts never reach the
// bcrypt comparison.
// register user
router.post("/register", registerLimiter, registerRules, validate, registerUser);

// login user
router.post("/login", loginLimiter, loginRules, validate, loginUser);

// logout user
router.post("/logout", logoutUser);

// get the logged in user
// must be protected route (requires authentication)
router.get("/me", protectMiddleware, getMe);

export default router;
