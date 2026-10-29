import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./lib/connectDB.js";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import categoryRoute from "./routes/category.route.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// middleware

// parse json request body with limit of 1mb
app.use(express.json({ limit: "1mb" }));
// parse url-encoded request body with limit of 1mb
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// parse the `jwt` httpOnly cookie into req.cookies — required by protectMiddleware
app.use(cookieParser());

//routes

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/category", categoryRoute);

// Error handling middleware
app.use(errorMiddleware);

//start server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  // connect to database
  connectDB();
});
