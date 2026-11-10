import mongoose from "mongoose";

// Mirrors MAX_ITEM_QUANTITY in models/Cart.model.js and validators/cart.validator.js.
const MAX_ITEM_QUANTITY = 99;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_METHODS = ["cod"]; // "card" is added when Stripe lands

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

// Snapshot of the product at checkout. Prices, names and images are copied on
// purpose: editing or deleting a product must not rewrite order history.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than or equal to 0"],
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
  // Order items are addressed by product id, exactly like cart items.
  { _id: false },
);

// Embedded snapshot, not a reference: changing a saved address later must not
// change where a past order was shipped.
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name must be at most 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[0-9\s-]{7,20}$/, "Please provide a valid phone number"],
    },
    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
      minlength: [5, "Street address must be at least 5 characters"],
      maxlength: [200, "Street address must be at most 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters"],
      maxlength: [100, "City must be at most 100 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, "Postal code must be at most 20 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      minlength: [2, "Country must be at least 2 characters"],
      maxlength: [100, "Country must be at most 100 characters"],
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    // Human-readable, e.g. "ORD-8F3K2A". The unique index is the real
    // guarantee; the controller retries on the (very unlikely) collision.
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Always taken from req.user._id — never from the request body.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: "Payment method must be one of: cod",
      },
      required: [true, "Payment method is required"],
      default: "cod",
    },
    // For cash on delivery this stays "pending" until the order is delivered.
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: "Invalid payment status",
      },
      default: "pending",
    },
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: "Invalid order status",
      },
      default: "pending",
    },
    // Money is computed server-side only; a client can never send these.
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal must be greater than or equal to 0"],
    },
    shippingFee: {
      type: Number,
      required: [true, "Shipping fee is required"],
      min: [0, "Shipping fee must be greater than or equal to 0"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total must be greater than or equal to 0"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      default: "USD",
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note must be at most 500 characters"],
    },
    // Lifecycle timestamps. `createdAt` / `updatedAt` come from `timestamps`.
    paidAt: Date,
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: {
      type: String,
      trim: true,
      maxlength: [200, "Cancel reason must be at most 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// "My orders" and the admin list, both newest first.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
