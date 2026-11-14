import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getProductsByCategory,
  updateProduct,
} from "../controllers/product.controller.js";
import {
  listProductsByCategoryRules,
  listProductsRules,
  productRules,
  updateProductRules,
} from "../validators/product.validator.js";
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
// Public route. Paginated, searchable, filterable, sortable — see
// listProductsRules. Defaults to 20 per page, newest first.
router.get("/", listProductsRules, validate, getProducts);

// update a product — admin only
// Auth runs before validation so an anonymous caller gets a clean 401 instead
// of a 422 that would leak the field rules. PUT and PATCH share one chain:
// every field is optional, so both behave as a partial update.
const updateProductChain = [
  protectMiddleware,
  restrictTo("admin"),
  updateProductRules,
  validate,
  updateProduct,
];

router.put("/:id", updateProductChain);
router.patch("/:id", updateProductChain);

// get products by category
// Public route. Same pagination/search/sort filters as GET /, but the category
// comes from the path.
// MUST stay above "/:id": otherwise "/category/abc" is matched by "/:id" with
// id="category" and fails as a malformed ObjectId.
router.get(
  "/category/:id",
  listProductsByCategoryRules,
  validate,
  getProductsByCategory,
);

// get a single product
// Public route
router.get("/:id", getProduct);
router.delete("/:id", protectMiddleware, restrictTo("admin"), deleteProduct);

export default router;
