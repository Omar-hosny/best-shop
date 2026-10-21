import express from "express";
import connectDB from "./lib/connectDB.js";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
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

//routes

app.use("/api/v1/auth", userRoute);

// Error handling middleware
app.use(errorMiddleware);

//start server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  // connect to database
  connectDB();
});
