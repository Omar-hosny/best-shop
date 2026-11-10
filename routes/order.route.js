import { Router } from "express";
import protectMiddleware from "../middleware/protectMiddleware.js";
import restrictTo from "../middleware/restrictTo.js";
import validate from "../middleware/validate.js";
import {
  cancelOrderRules,
  createOrderRules,
  listOrdersRules,
  orderIdRules,
  updateOrderStatusRules,
} from "../validators/order.validator.js";
import {
  cancelMyOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

// Every order route requires login. The user is always req.user._id — no
// route accepts a userId, so cross-user access is not expressible.
router.use(protectMiddleware);

// Admin routes. The literal "/admin" prefix MUST stay above "/:id": otherwise
// "/admin" would be matched by "/:id" and fail as a malformed ObjectId.
router.get("/admin", restrictTo("admin"), listOrdersRules, validate, getAllOrders);
router.patch(
  "/admin/:id/status",
  restrictTo("admin"),
  updateOrderStatusRules,
  validate,
  updateOrderStatus,
);

// checkout: create an order from the caller's cart
router.post("/", createOrderRules, validate, createOrder);

// my orders
router.get("/", getMyOrders);

// cancel my order (before it ships)
router.patch("/:id/cancel", cancelOrderRules, validate, cancelMyOrder);

// one of my orders
router.get("/:id", orderIdRules, validate, getOrder);

export default router;
