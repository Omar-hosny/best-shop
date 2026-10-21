import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { registerRules, loginRules } from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", registerRules, validate, registerUser);
router.post("/login", loginRules, validate, loginUser);

export default router;
