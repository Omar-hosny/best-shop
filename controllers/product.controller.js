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

const DEFAULT_PAGE_SIZE = 20;

// Must match SORT_KEYS in validators/product.validator.js. The client sends a
// friendly name; only this table turns it into a Mongo sort, so a raw string
// can never reach `.sort()`.
const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

// `q` is interpolated into a RegExp, so metacharacters must be escaped —
// otherwise a search for "(" throws and the request dies as a 500.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Turns validated query filters into a Mongo filter. Nothing here reads
// `req` directly, so the same builder serves both listing endpoints.
const buildProductFilter = ({ q, category, minPrice, maxPrice, inStock }) => {
  const filter = {};

  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: pattern }, { description: pattern }];
  }

  if (category) filter.category = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // `inStock=false` means "out of stock only", not "no filter". It arrives as a
  // string: turning it into a boolean in the validator would make `matchedData`
  // drop the field (falsy + `optional({ values: "falsy" })`).
  if (inStock === "true") filter.quantity = { $gt: 0 };
  else if (inStock === "false") filter.quantity = { $lte: 0 };

  return filter;
};

// Shared implementation for `GET /` and `GET /category/:id`. `baseFilter` is
// the part the route fixes itself (the category from the path).
const listProducts = async (req, res, baseFilter = {}) => {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    sort = "newest",
    ...filters
  } = matchedData(req, { locations: ["query"] });

  const filter = { ...baseFilter, ...buildProductFilter(filters) };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      // `_id` is a tiebreaker: without it, documents sharing a createdAt or a
      // price can swap order between pages, so a product is skipped or shown
      // twice while paging.
      .sort({ ...SORTS[sort], _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getProducts = (req, res) => listProducts(req, res);

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
  // `matchedData` only contains fields that were sent AND have a validation
  // rule, so injected `_id` / `slug` / `__v` can never reach the update.
  const updates = matchedData(req, { locations: ["body"] });

  // Nothing valid was sent — refuse instead of returning an unchanged product.
  if (Object.keys(updates).length === 0) {
    throw new AppError("No fields to update", 400);
  }

  // Same dangling-reference guard as create: `isMongoId()` only proves the
  // format, not that the category exists.
  if (updates.category && !(await Category.exists({ _id: updates.category }))) {
    throw new AppError("Category does not exist", 400);
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    // Mongoose 9: `new: true` is deprecated in favour of `returnDocument`.
    returnDocument: "after", // return the document AFTER the update, not the old one
    runValidators: true, // schema validators (min, minlength, integer) don't run otherwise
  }).populate("category", "name");

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
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
};

export const getProductsByCategory = (req, res) =>
  listProducts(req, res, { category: req.params.id });
