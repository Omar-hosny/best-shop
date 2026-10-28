import { body } from "express-validator";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt only hashes the first 72 bytes, so anything beyond is silently ignored

// const COMMON_PASSWORDS = [
//   "password",
//   "password1",
//   "password123",
//   "12345678",
//   "123456789",
//   "qwerty123",
//   "admin123",
//   "letmein1",
//   "welcome1",
//   "iloveyou1",
// ];

// Rules used when creating an account. Every field is sanitized in place,
// so the controller receives trimmed / lowercased values.
export const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
    .withMessage(
      `Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`,
    ),
  // .bail()
  // .matches(/[a-z]/)
  // .withMessage("Password must include at least one lowercase letter")
  // .matches(/[A-Z]/)
  // .withMessage("Password must include at least one uppercase letter")
  // .matches(/[0-9]/)
  // .withMessage("Password must include at least one number")
  // .matches(/[^A-Za-z0-9]/)
  // .withMessage("Password must include at least one special character")
  // .custom((value) => !COMMON_PASSWORDS.includes(value.toLowerCase()))
  // .withMessage("This password is too common"),
];

// Rules used when signing in. Strength rules are deliberately NOT applied here:
// an account created with a weak password must still be able to log in.
export const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),

  body("password").notEmpty().withMessage("Password is required").bail(),
];
