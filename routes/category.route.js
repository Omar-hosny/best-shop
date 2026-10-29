import { Router } from "express";
import protectMiddleware from "../middleware/protectMiddleware.js";
import restrictTo from "../middleware/restrictTo.js";

import { categoryRules } from "../validators/category.validator.js";
import validate from "../middleware/validate.js";
import { createCategory } from "../controllers/category.controller.js";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  restrictTo("admin"),
  categoryRules,
  validate,
  createCategory,
);
export default router;
