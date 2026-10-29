import mongoose from "mongoose";

// Minimal on purpose: there is no category endpoint yet, so categories are
// seeded directly in the database. A `slug` field can be added together with
// the product slug when the category routes are built.
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
