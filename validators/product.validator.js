import { body, param } from "express-validator";

const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 200;
const MAX_IMAGES = 5;

// Rules used when an admin creates a product. Sanitizers mutate req.body in
// place, so the controller receives trimmed strings and real numbers.
export const productRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Product name must be between 2 and 50 characters"),

  // Optional, but when sent it must satisfy the same bounds as the schema.
  body("description")
    .optional()
    .trim()
    .isLength({ min: DESCRIPTION_MIN, max: DESCRIPTION_MAX })
    .withMessage(
      `Description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters`,
    ),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .bail()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Price must be a number between 0 and 1000000")
    .toFloat(),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .bail()
    .isInt({ min: 0, max: 100000 })
    .withMessage("Quantity must be a whole number between 0 and 100000")
    .toInt(),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .bail()
    .isMongoId()
    .withMessage("Category must be a valid category id"),

  body("images")
    .optional()
    .isArray({ max: MAX_IMAGES })
    .withMessage(`Images must be an array of at most ${MAX_IMAGES} URLs`),

  body("images.*")
    .isURL()
    .withMessage("Each image must be a valid URL"),
];

// Rules used when an admin updates a product. Every field is optional so a
// partial update is allowed; only the fields that were sent are validated and
// only those end up in `matchedData`.
export const updateProductRules = [
  param("id").isMongoId().withMessage("Invalid product id"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Product name must be between 2 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: DESCRIPTION_MIN, max: DESCRIPTION_MAX })
    .withMessage(
      `Description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters`,
    ),

  body("price")
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("Price must be a number between 0 and 1000000")
    .toFloat(),

  body("quantity")
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage("Quantity must be a whole number between 0 and 100000")
    .toInt(),

  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid category id"),

  body("images")
    .optional()
    .isArray({ max: MAX_IMAGES })
    .withMessage(`Images must be an array of at most ${MAX_IMAGES} URLs`),

  body("images.*")
    .isURL()
    .withMessage("Each image must be a valid URL"),
];
