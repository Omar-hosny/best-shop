import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import connectDB from "./lib/connectDB.js";
import validateEnv from "./lib/validateEnv.js";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import categoryRoute from "./routes/category.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";

import { globalLimiter } from "./middleware/rateLimiters.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
// Load environment variables
dotenv.config();
// Fail fast on a missing secret / URI instead of a 500 on the first request.
validateEnv();

const PORT = process.env.PORT || 5000;
const app = express();

// Express only sees the proxy's address in req.ip unless it knows how many
// hops to trust. `true` would trust a client-supplied X-Forwarded-For and let
// anyone bypass every IP-based rate limit, so only a hop count or "loopback"
// is accepted. A bare "1" string is parsed by Express as an IP list, not a
// count, so numeric values must be converted.
const trustProxy = (process.env.TRUST_PROXY ?? "loopback").trim();
app.set(
  "trust proxy",
  /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy,
);

// middleware

// No `X-Powered-By: Express` fingerprint, plus the standard security headers
// (CSP, nosniff, frame-ancestors, HSTS over HTTPS, etc.).
app.disable("x-powered-by");
app.use(helmet());

// parse json request body. 100kb is well above this API's largest payload
// (an order with its shipping address) and limits memory pressure.
app.use(express.json({ limit: "100kb" }));
// `extended: false` uses the built-in querystring parser, so nested/array
// bodies cannot be crafted. The API is JSON-only anyway.
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
// parse the `jwt` httpOnly cookie into req.cookies — required by protectMiddleware
app.use(cookieParser());

// Liveness probe. Sits outside the global limiter so monitoring cannot be
// throttled, and touches neither Mongo nor auth.
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

// Broad rate limit for every API route. Route-specific limiters (login,
// register, checkout, admin writes) stack on top of this.
app.use("/api/v1", globalLimiter);

//routes

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);

// Unknown paths used to fall through to Express' HTML 404. Keep the API's
// response shape consistent.
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling middleware
app.use(errorMiddleware);

//start server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  // connect to database
  connectDB();
});
