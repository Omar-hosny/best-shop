import { matchedData } from "express-validator";
import Category from "../models/Category.model.js";
import AppError from "../middleware/AppError.js";

export const createCategory = async (req, res) => {
  // Only fields that passed validation are read, so a client cannot smuggle in
  // `_id`, `slug`, `__v`, or anything else the model might gain later.
  const { name } = matchedData(req, {
    locations: ["body"],
  });

  //check if category already exists
  const existsCategory = await Category.findOne({ name });
  if (existsCategory) {
    throw new AppError("Category already exist", 400);
  }
  const category = await Category.create({
    name,
  });

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: category,
  });
};

export const getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json({ success: true, data: categories });
};

export const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.status(200).json({ success: true, data: category });
};

export const updateCategory = async (req, res) => {
  // rule, so injected `_id` / `slug` / `__v` can never reach the update.
  const updates = matchedData(req, { locations: ["body"] });

  // Nothing valid was sent — refuse instead of returning an unchanged product.
  if (Object.keys(updates).length === 0) {
    throw new AppError("No fields to update", 400);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.status(200).json({ success: true, data: category });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res
    .status(200)
    .json({ success: true, message: "Category deleted successfully" });
};
