import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import AppError from "./AppError.js";

const MINUTE = 60 * 1000;

// 429s are handed to the global error middleware instead of being written
// here, so they keep the same `{ success: false, message }` shape (and the
// production stack redaction) as every other error in the app.
const rateLimitHandler = (message) => (req, res, next) =>
  next(new AppError(message, 429));

const base = {
  // draft-8 sends the standard RateLimit-* and Retry-After headers.
  standardHeaders: "draft-8",
  legacyHeaders: false,
};

// A custom key generator that falls back to an IP MUST call ipKeyGenerator():
// it groups IPv6 clients by /64 so one client cannot rotate addresses and get
// a fresh bucket per request. express-rate-limit validates this.
const userOrIpKey = (req) =>
  req.user?._id?.toString() ?? ipKeyGenerator(req.ip);

// Broad safety net for scraping and accidental request storms. Deliberately
// loose: real users browse well under 300 requests per 15 minutes.
export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * MINUTE,
  limit: 300,
  handler: rateLimitHandler("Too many requests. Please try again later."),
});

// Login brute-force protection. The key is email + IP, never email alone:
// an email-only key would let an attacker lock a victim out of their account.
// Only failures count, so a user signing in repeatedly from several tabs is
// never punished.
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    `${String(req.body?.email ?? "")
      .toLowerCase()
      .slice(0, 254)}|${ipKeyGenerator(req.ip)}`,
  handler: rateLimitHandler(
    "Too many login attempts. Please try again in 15 minutes.",
  ),
});

// Mass-account-creation protection. Keyed by IP only, because the email is
// different on every attempt.
export const registerLimiter = rateLimit({
  ...base,
  windowMs: 60 * MINUTE,
  limit: 5,
  handler: rateLimitHandler(
    "Too many accounts created from this address. Please try again later.",
  ),
});

// Per-account limit for authenticated routes. Keyed by user id, not IP, so
// several people behind one office/NAT address do not share a bucket.
export const userLimiter = rateLimit({
  ...base,
  windowMs: 15 * MINUTE,
  limit: 120,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler("Too many requests. Please slow down."),
});

// Checkout is the most expensive write in the app (a Mongo transaction that
// decrements stock). A tighter, account-scoped bucket.
export const checkoutLimiter = rateLimit({
  ...base,
  windowMs: 60 * MINUTE,
  limit: 10,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler(
    "Too many checkout attempts. Please try again later.",
  ),
});

// Admin mutations are rare and powerful; cap them separately from browsing.
export const adminWriteLimiter = rateLimit({
  ...base,
  windowMs: 15 * MINUTE,
  limit: 60,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler("Too many write requests. Please slow down."),
});
