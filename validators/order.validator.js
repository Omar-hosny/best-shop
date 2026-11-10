import { body, param, query } from "express-validator";

// Must match the schema enum in models/Order.model.js.
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// An admin can move an order to these; "pending" is only ever the initial state.
const ADMIN_SETTABLE_STATUSES = ["confirmed", "shipped", "delivered", "cancelled"];

// Phase 1: cash on delivery only. Adding "card" here and in the model is the
// first step of the Stripe work.
const PAYMENT_METHODS = ["cod"];

const NOTE_MAX = 500;
const CANCEL_REASON_MAX = 200;

const cancelReasonRule = (chain) =>
  chain
    .optional()
    .trim()
    .isLength({ max: CANCEL_REASON_MAX })
    .withMessage(`Cancel reason must be at most ${CANCEL_REASON_MAX} characters`);

// Checkout payload. Items, prices, totals, status and the user are deliberately
// absent: they are all derived from the cart and req.user.
export const createOrderRules = [
  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .matches(/^\+?[0-9\s-]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .bail()
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be between 5 and 200 characters"),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),

  body("shippingAddress.postalCode")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Postal code must be at most 20 characters"),

  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Country must be between 2 and 100 characters"),

  body("paymentMethod")
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`),

  body("note")
    .optional()
    .trim()
    .isLength({ max: NOTE_MAX })
    .withMessage(`Note must be at most ${NOTE_MAX} characters`),
];

// Routes that only carry the order id in the path.
export const orderIdRules = [
  param("id").isMongoId().withMessage("Invalid order id"),
];

// A user cancelling their own order may optionally say why.
export const cancelOrderRules = [
  param("id").isMongoId().withMessage("Invalid order id"),
  cancelReasonRule(body("cancelReason")),
];

// Admin status changes.
export const updateOrderStatusRules = [
  param("id").isMongoId().withMessage("Invalid order id"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .bail()
    .isIn(ADMIN_SETTABLE_STATUSES)
    .withMessage(`Status must be one of: ${ADMIN_SETTABLE_STATUSES.join(", ")}`),

  cancelReasonRule(body("cancelReason")),
];

// Admin order list, optionally filtered by status.
export const listOrdersRules = [
  query("status")
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(", ")}`),
];
