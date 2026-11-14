import { body, param, query } from "express-validator";

const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 200;
const MAX_IMAGES = 5;

// Must match the `SORTS` map in controllers/product.controller.js. The client
// sends a friendly name; the controller is the only place that turns it into a
// Mongo sort, so a raw string can never reach `.sort()`.
const SORT_KEYS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
];

const MAX_PAGE_SIZE = 50;

// A query parameter can be repeated (?page=1&page=2), which express-validator
// hands over as an array — and `isInt` happily passes on an array of strings.
// Without this guard the controller would compute `skip(NaN)` and the request
// would die with a 500 instead of a 422.
//
// `optional({ values: "falsy" })` (not plain `optional()`) is required: plain
// `optional()` only skips `undefined`, so `?page=` would fail as "not an int".
const queryParam = (path) =>
  query(path)
    .optional({ values: "falsy" })
    .not()
    .isArray()
    .withMessage(`Query parameter "${path}" must be provided only once`)
    .bail();

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

// Shared listing filters for `GET /products` and `GET /products/category/:id`.
// The category route takes the category from the path, so it does not define
// the `?category=` rule — accepting both would be ambiguous.
const listFilters = (withCategory) => [
  queryParam("page")
    .isInt({ min: 1 })
    .withMessage("Page must be a whole number greater than 0")
    .toInt(),

  queryParam("limit")
    .isInt({ min: 1, max: MAX_PAGE_SIZE })
    .withMessage(`Limit must be a whole number between 1 and ${MAX_PAGE_SIZE}`)
    .toInt(),

  queryParam("q")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search must be between 2 and 100 characters"),

  ...(withCategory
    ? [
        queryParam("category")
          .isMongoId()
          .withMessage("Category must be a valid category id"),
      ]
    : []),

  // Trade-off: `optional({ values: "falsy" })` also treats `?maxPrice=0` as
  // absent, so "only free products" is not expressible. Worth it — it keeps an
  // empty form field (`?maxPrice=`) from failing validation.
  queryParam("minPrice")
    .isFloat({ min: 0 })
    .withMessage("minPrice must be a number greater than or equal to 0")
    .toFloat(),

  queryParam("maxPrice")
    .isFloat({ min: 0 })
    .withMessage("maxPrice must be a number greater than or equal to 0")
    .custom((value, { req }) => {
      // Express 5 re-parses `req.query` on every access, so this is the raw
      // string. Number() handles both that and an already-sanitized number.
      const min = req.query.minPrice;
      if (min === undefined || min === "") return true;
      if (Number(min) > Number(value)) {
        throw new Error("maxPrice must be greater than or equal to minPrice");
      }
      return true;
    })
    .toFloat(),

  // Deliberately NOT `toBoolean()`: it would turn "false" into boolean `false`,
  // and `matchedData` drops falsy values because of `optional({ values:
  // "falsy" })` above — the filter would silently disappear. The controller
  // compares against the strings instead.
  queryParam("inStock")
    .isIn(["true", "false"])
    .withMessage('inStock must be "true" or "false"'),

  queryParam("sort")
    .isIn(SORT_KEYS)
    .withMessage(`Sort must be one of: ${SORT_KEYS.join(", ")}`),
];

export const listProductsRules = listFilters(true);

export const listProductsByCategoryRules = [
  param("id").isMongoId().withMessage("Invalid category id"),
  ...listFilters(false),
];
