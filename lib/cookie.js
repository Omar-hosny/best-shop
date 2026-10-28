// Single source of truth for the auth cookie. `res.cookie` and `res.clearCookie`
// must be given the same name/options, otherwise the browser keeps the stale
// cookie and logout silently does nothing. Keep both call sites importing this.

export const JWT_COOKIE = "jwt";

// A function, not a constant: ESM hoists imports, so a top-level `process.env`
// read would happen before dotenv.config() runs in server.js.
export const jwtCookieOptions = () => ({
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === "production", // Only send over https in production
  sameSite: "strict", // Prevents CSRF attacks
  // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds (optional - set manually for debuggability)
  path: "/", // Must match on clearCookie, or the deletion targets nothing
});
