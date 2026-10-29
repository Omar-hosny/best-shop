import { matchedData } from "express-validator";
import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import AppError from "../middleware/AppError.js";

export const createProduct = async (req, res) => {
  // Only fields that passed validation are read, so a client cannot smuggle in
  // `_id`, `slug`, `__v`, or anything else the model might gain later.
  const { name, description, price, quantity, category, images } = matchedData(
    req,
    { locations: ["body"] },
  );

  // `isMongoId()` only proves the format is valid; make sure the category
  // actually exists so we never store a dangling reference.
  const categoryExists = await Category.exists({ _id: category });
  if (!categoryExists) {
    throw new AppError("Category does not exist", 400);
  }

  const product = await Product.create({
    name,
    // Leave the field out entirely when it was not sent; the schema would
    // reject an empty string against its 10-character minimum.
    ...(description !== undefined ? { description } : {}),
    price,
    quantity,
    category,
    images: images ?? [],
  });

  // Populate the `category` field with the category name. this
  // will be sent in the response.
  await product.populate("category", "name");

  res.status(201).json({ success: true, data: product });
};

export const getProducts = async (req, res) => {
  const products = await Product.find().populate("category", "name");
  res.status(200).json({ success: true, data: products });
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name",
  );
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.status(200).json({ success: true, data: product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    matchedData(req, { locations: ["body"] }),
    { new: true, runValidators: true },
  ).populate("category", "name");
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.status(200).json({ success: true, data: product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.status(200).json({ success: true, data: product });
};

export const getProductsByCategory = async (req, res) => {
  const products = await Product.find({ category: req.params.id }).populate(
    "category",
    "name",
  );
  res.status(200).json({ success: true, data: products });
};

// export const searchProducts = async (req, res) => {
//   const products = await Product.find({
//     name: { $regex: req.params.query, $options: "i" },
//   }).populate("category", "name");
//   res.status(200).json({ success: true, data: products });
// };
