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

const router = express.Router();

// register user
router.post("/register", registerRules, validate, registerUser);

// login user
router.post("/login", loginRules, validate, loginUser);

// logout user
router.post("/logout", logoutUser);

// get the logged in user
// must be protected route (requires authentication)
router.get("/me", protectMiddleware, getMe);

export default router;
