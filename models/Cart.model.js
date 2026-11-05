import mongoose from "mongoose";

// Mirrors MAX_ITEM_QUANTITY in validators/cart.validator.js. The schema is the
// last line of defense — if the two disagree, one of them is lying.
const MAX_ITEM_QUANTITY = 99;

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [MAX_ITEM_QUANTITY, `Quantity must be at most ${MAX_ITEM_QUANTITY}`],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  // Items are addressed by product id, so a subdocument _id would be noise.
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    // One cart per user. The unique index is what actually enforces it —
    // the controller never trusts a client-supplied user id.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    // No price here on purpose: prices are read live from Product on every
    // response. An order is where a price gets snapshotted.
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
