import AppError from "./AppError.js";

/**
 * Role gate. Must run AFTER protectMiddleware, which is what loads `req.user`.
 *
 * The role is read from the database (req.user), not from the JWT payload, so
 * demoting a user takes effect on their next request instead of when their
 * token expires.
 *
 *   router.post("/", protectMiddleware, restrictTo("admin"), ...);
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new AppError(
        "You are not logged in. Please log in to access this resource",
        401,
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403,
      );
    }

    next();
  };

export default restrictTo;
