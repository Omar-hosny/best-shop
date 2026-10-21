import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [72, "Password must be at most 72 characters"], // bcrypt truncates beyond 72 bytes
      select: false, // never returned by queries unless explicitly requested with .select("+password")
    },
    profileImage: {
      type: String,
      default: "", // URL of the image (Cloudinary, /uploads, etc.)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Hash the password before saving.
// Only runs when the value actually changed, so editing a name
// won't re-hash an already-hashed password.
// (Mongoose 9: promise-based middleware — no `next` callback)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("save", function () {
  if (this.isModified("resetPasswordToken") && this.resetPasswordToken) {
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(this.resetPasswordToken)
      .digest("hex");
  }
});

// Compare a plain-text password with the stored hash (for login)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate a password-reset token.
// Returns the RAW token (send this to the user by email),
// while only its sha256 hash is stored in the DB.
userSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = rawToken; // pre-save hook hashes it
  this.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  return rawToken;
};

const User = mongoose.model("User", userSchema);

export default User;
