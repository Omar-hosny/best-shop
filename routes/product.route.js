import express from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/product.controller.js";
import { productRules } from "../validators/product.validator.js";
import { validate } from "../middleware/validate.js";
import protectMiddleware from "../middleware/protectMiddleware.js";
import restrictTo from "../middleware/restrictTo.js";

const router = express.Router();

// create a product — admin only
// Auth runs before validation so an anonymous caller gets a clean 401 instead
// of a 422 that would leak the field rules.
router.post(
  "/",
  protectMiddleware,
  restrictTo("admin"),
  productRules,
  validate,
  createProduct,
);
// get all products
// Public route

export default router;
