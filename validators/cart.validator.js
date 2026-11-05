import { body, param } from "express-validator";

// Must match MAX_ITEM_QUANTITY in models/Cart.model.js.
const MAX_ITEM_QUANTITY = 99;

const quantityRule = (chain) =>
  chain
    .isInt({ min: 1, max: MAX_ITEM_QUANTITY })
    .withMessage(`Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`)
    .toInt();

// Rules used when adding a product to the cart. `quantity` defaults to 1 in
// the controller, so a body of just `{ "productId": "…" }` is valid.
export const addCartItemRules = [
  body("productId")
    .trim()
    .notEmpty()
    .withMessage("Product id is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product id"),

  quantityRule(body("quantity").optional()),
];

// Rules used when setting the quantity of an item that is already in the cart.
// 0 is rejected on purpose: removing an item is DELETE, not a magic quantity.
export const updateCartItemRules = [
  param("productId").isMongoId().withMessage("Invalid product id"),

  quantityRule(
    body("quantity").notEmpty().withMessage("Quantity is required").bail(),
  ),
];

// Rules for routes that only carry the product id in the path.
export const cartItemParamRules = [
  param("productId").isMongoId().withMessage("Invalid product id"),
];
