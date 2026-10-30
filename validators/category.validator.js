import { body, param } from "express-validator";

export const categoryRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("category name is required")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("category name must be between 2 and 50 characters"),
];

export const updateCategoryRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("category name is required")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("category name must be between 2 and 50 characters"),
];

export const deleteCategoryRules = [
  param("id").isMongoId().withMessage("Invalid category id"),
];
