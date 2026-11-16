import { Router } from "express";
import protectMiddleware from "../middleware/protectMiddleware.js";
import restrictTo from "../middleware/restrictTo.js";
import { adminWriteLimiter } from "../middleware/rateLimiters.js";

import {
  categoryRules,
  deleteCategoryRules,
  updateCategoryRules,
} from "../validators/category.validator.js";
import validate from "../middleware/validate.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  restrictTo("admin"),
  adminWriteLimiter,
  categoryRules,
  validate,
  createCategory,
);

router.get("/", getCategories);
router.get("/:id", getCategory);

// update a category only - admin only
router.put(
  "/:id",
  protectMiddleware,
  restrictTo("admin"),
  adminWriteLimiter,
  updateCategoryRules,
  validate,
  updateCategory,
);
// delete a category only - admin only
router.delete(
  "/:id",
  protectMiddleware,
  restrictTo("admin"),
  adminWriteLimiter,
  deleteCategoryRules,
  validate,
  deleteCategory,
);
export default router;
