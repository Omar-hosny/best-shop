import { matchedData } from "express-validator";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import AppError from "../middleware/AppError.js";

// Must match the schema max in models/Cart.model.js and the validator.
const MAX_ITEM_QUANTITY = 99;

// Only the fields the storefront needs. `quantity` here is the *stock* level,
// used to tell the client how many are still available.
const CART_PRODUCT_FIELDS = "name price images quantity category";

// Decimal Number prices accumulate float noise (0.1 + 0.2), so every money
// value is rounded to 2 decimals before it leaves the API.
const round2 = (value) => Math.round(value * 100) / 100;

// Atomic: a plain findOne → create race throws a duplicate-key 409 when two
// requests arrive for a user who has no cart yet. An upsert cannot.
const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

const emptyCart = () => ({
  _id: null,
  items: [],
  totalItems: 0,
  subtotal: 0,
});

// Every cart endpoint returns this shape, so the frontend has one parser.
const buildCartResponse = (cart) => {
  if (!cart) return emptyCart();

  // A product can be deleted while it sits in someone's cart. Drop those
  // from the response so totals stay correct; the document is left alone.
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: round2(item.product.price * item.quantity),
    }));

  return {
    _id: cart._id,
    user: cart.user,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: round2(items.reduce((sum, item) => sum + item.lineTotal, 0)),
    updatedAt: cart.updatedAt,
  };
};

const populateCart = (cart) =>
  cart.populate("items.product", CART_PRODUCT_FIELDS);

// Read the cart. Never writes: a user who has not added anything gets an empty
// cart shape, not a database row.
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    CART_PRODUCT_FIELDS,
  );

  res.status(200).json({ success: true, data: buildCartResponse(cart) });
};

// Add a product, or increase its quantity if it is already in the cart.
export const addCartItem = async (req, res) => {
  const { productId, quantity = 1 } = matchedData(req, {
    locations: ["body"],
  });

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (product.quantity < 1) {
    throw new AppError("Product is out of stock", 400);
  }

  // Create the cart if it does not exist.
  const cart = await getOrCreateCart(req.user._id);
  // Check that the product is not already in the cart.
  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === productId,
  );

  // If the product is already in the cart, increase its quantity.
  const newQuantity = (item?.quantity ?? 0) + quantity;

  if (newQuantity > product.quantity) {
    throw new AppError(`Only ${product.quantity} left in stock`, 400);
  }
  if (newQuantity > MAX_ITEM_QUANTITY) {
    throw new AppError(
      `You can order at most ${MAX_ITEM_QUANTITY} of this product`,
      400,
    );
  }

  // If the product is already in the cart, increase its quantity. by
  // adding a new item if it is not.
  if (item) {
    item.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, data: buildCartResponse(cart) });
};

// Set the quantity of an item that is already in the cart.
export const updateCartItem = async (req, res) => {
  const { quantity } = matchedData(req, { locations: ["body"] });
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError("Product is not in your cart", 404);
  }

  // Check that the product is in the cart.
  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === productId,
  );
  if (!item) {
    throw new AppError("Product is not in your cart", 404);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (quantity > product.quantity) {
    throw new AppError(`Only ${product.quantity} left in stock`, 400);
  }

  item.quantity = quantity;

  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, data: buildCartResponse(cart) });
};

// Remove one product from the cart.
export const removeCartItem = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError("Product is not in your cart", 404);
  }

  const index = cart.items.findIndex(
    (cartItem) => cartItem.product.toString() === productId,
  );
  if (index === -1) {
    throw new AppError("Product is not in your cart", 404);
  }

  // Remove the product from the cart.
  cart.items.splice(index, 1);

  await cart.save();
  // Populate the cart with the new items.
  await populateCart(cart);

  res.status(200).json({ success: true, data: buildCartResponse(cart) });
};

// Empty the cart. The document is kept so the next add reuses it.
export const clearCart = async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { returnDocument: "after" },
  ).populate("items.product", CART_PRODUCT_FIELDS);

  res.status(200).json({ success: true, data: buildCartResponse(cart) });
};
