import { validationResult } from "express-validator";

/**
 * Collects the errors produced by express-validator rule chains and turns them
 * into a 422 response. Place it right after the rule chains on a route:
 *
 *   router.post("/register", registerRules, validate, registerUser);
 */
export const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.path ?? error.param, // v7 renamed `param` -> `path`
    message: error.msg,
    location: error.location,
  }));

  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};

export default validate;
