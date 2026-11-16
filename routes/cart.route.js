import { Router } from "express";
import protectMiddleware from "../middleware/protectMiddleware.js";
import { userLimiter } from "../middleware/rateLimiters.js";
import validate from "../middleware/validate.js";
import {
  addCartItemRules,
  cartItemParamRules,
  updateCartItemRules,
} from "../validators/cart.validator.js";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";

const router = Router();

// Every cart route requires login. The cart is always the caller's own:
// no userId appears in any body or path, so cross-user access is not
// expressible. The limiter is keyed by user id, so it must run after
// protectMiddleware has set req.user.
router.use(protectMiddleware, userLimiter);

// read my cart
router.get("/", getCart);

// add a product (or increase its quantity)
router.post("/items", addCartItemRules, validate, addCartItem);

// set the quantity of an item already in the cart
router.patch(
  "/items/:productId",
  updateCartItemRules,
  validate,
  updateCartItem,
);

// remove one product
router.delete(
  "/items/:productId",
  cartItemParamRules,
  validate,
  removeCartItem,
);

// empty the cart
router.delete("/", clearCart);

export default router;
