import mongoose from "mongoose";
import { matchedData } from "express-validator";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import AppError from "../middleware/AppError.js";
import createOrderNumber from "../lib/createOrderNumber.js";

// Must match the schema in models/Order.model.js.
const CURRENCY = "USD";
const DEFAULT_SHIPPING_FEE = 7.99;

// Cancelling restores stock, so it is only safe before the order ships.
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

// Forward-only lifecycle. "cancelled" is handled separately because it has to
// restock inside a transaction.
const ALLOWED_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

// Prices are decimal Numbers, so added floats drift (0.1 + 0.2). Every money
// value is rounded to 2 decimals, exactly like the cart.
const round2 = (value) => Math.round(value * 100) / 100;

// SHIPPING_FEE is optional; a missing or malformed value must never put NaN in
// a money field.
const getShippingFee = () => {
  const fee = Number(process.env.SHIPPING_FEE ?? DEFAULT_SHIPPING_FEE);
  return Number.isFinite(fee) && fee >= 0 ? round2(fee) : DEFAULT_SHIPPING_FEE;
};

const createOrderInTransaction = async ({
  userId,
  orderNumber,
  shippingAddress,
  paymentMethod,
  note,
}) => {
  const session = await mongoose.startSession();

  try {
    let order;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId })
        .populate("items.product", "name price images quantity")
        .session(session);

      if (!cart || cart.items.length === 0) {
        throw new AppError("Your cart is empty", 400);
      }

      const items = [];

      for (const item of cart.items) {
        // A product can be deleted while it sits in the cart.
        if (!item.product) {
          throw new AppError(
            "An item in your cart is no longer available. Remove it and try again",
            400,
          );
        }

        // Conditional decrement. The filter is what prevents overselling: two
        // concurrent checkouts for the last unit cannot both match.
        const product = await Product.findOneAndUpdate(
          { _id: item.product._id, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { returnDocument: "after", session },
        );

        if (!product) {
          throw new AppError(
            `Only ${item.product.quantity} left in stock for ${item.product.name}`,
            400,
          );
        }

        // Snapshot: the order keeps this price even if the product changes.
        items.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] ?? null,
          price: product.price,
          quantity: item.quantity,
        });
      }

      const subtotal = round2(
        items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      );
      const shippingFee = getShippingFee();

      [order] = await Order.create(
        [
          {
            orderNumber,
            user: userId,
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingFee,
            total: round2(subtotal + shippingFee),
            currency: CURRENCY,
            ...(note ? { note } : {}),
          },
        ],
        { session },
      );

      // Clearing the cart inside the transaction means a failed checkout
      // leaves the cart untouched.
      cart.items = [];
      await cart.save({ session });
    });

    return order;
  } finally {
    await session.endSession();
  }
};

// A duplicate order number aborts the whole transaction, so stock is rolled
// back and a retry is safe. The collision probability is ~1 in a billion.
const createOrderWithRetry = async (payload) => {
  for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    try {
      return await createOrderInTransaction({
        ...payload,
        orderNumber: createOrderNumber(),
      });
    } catch (error) {
      const duplicateOrderNumber =
        error?.code === 11000 && error?.keyPattern?.orderNumber;

      if (!duplicateOrderNumber || attempt === MAX_ORDER_NUMBER_ATTEMPTS) {
        throw error;
      }
    }
  }
};

// Checkout: cart -> order. The client sends only the address, the payment
// method and an optional note; items and prices come from the database.
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, note } = matchedData(req, {
    locations: ["body"],
  });

  const order = await createOrderWithRetry({
    userId: req.user._id,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      country: shippingAddress.country,
      // Omit an empty postal code instead of storing "".
      ...(shippingAddress.postalCode
        ? { postalCode: shippingAddress.postalCode }
        : {}),
    },
    paymentMethod: paymentMethod ?? "cod",
    note,
  });

  res.status(201).json({ success: true, data: order });
};

// get orders for the logged in user
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({ success: true, data: orders });
};

// Scoping by user is deliberate: another user's order must look non-existent,
// so the id space is not leaked through a 403.
export const getOrder = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  res.status(200).json({ success: true, data: order });
};

// Shared by the user cancel endpoint and the admin status endpoint. Everything
// happens in one transaction so stock and status cannot disagree.
const cancelOrderInTransaction = async (filter, cancelReason) => {
  const session = await mongoose.startSession();

  try {
    let cancelled;

    await session.withTransaction(async () => {
      // Re-read inside the transaction: two concurrent cancels cannot both
      // restock. The second write conflicts and its retry sees "cancelled".
      const order = await Order.findOne(filter).session(session);

      if (!order) {
        throw new AppError("Order not found", 404);
      }
      if (order.status === "cancelled") {
        throw new AppError("Order is already cancelled", 400);
      }
      // Only pending, confirmed and shipped orders can be cancelled.
      if (!CANCELLABLE_STATUSES.includes(order.status)) {
        throw new AppError(
          `Orders that are ${order.status} cannot be cancelled`,
          400,
        );
      }

      for (const item of order.items) {
        // The product may have been deleted since checkout; updateOne is a
        // no-op in that case, which is fine.
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: item.quantity } },
          { session },
        );
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      if (cancelReason) order.cancelReason = cancelReason;

      await order.save({ session });
      cancelled = order;
    });

    return cancelled;
  } finally {
    await session.endSession();
  }
};

export const cancelMyOrder = async (req, res) => {
  const { cancelReason } = matchedData(req, { locations: ["body"] });

  const order = await cancelOrderInTransaction(
    { _id: req.params.id, user: req.user._id },
    cancelReason,
  );

  res.status(200).json({ success: true, data: order });
};

export const getAllOrders = async (req, res) => {
  const { status } = matchedData(req, { locations: ["query"] });

  const orders = await Order.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .populate("user", "name email");

  res.status(200).json({ success: true, data: orders });
};

export const updateOrderStatus = async (req, res) => {
  const { status, cancelReason } = matchedData(req, { locations: ["body"] });

  // Cancellation restocks, so it takes the transactional path.
  if (status === "cancelled") {
    const order = await cancelOrderInTransaction(
      { _id: req.params.id },
      cancelReason,
    );
    return res.status(200).json({ success: true, data: order });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Cannot change order status from ${order.status} to ${status}`,
      400,
    );
  }

  order.status = status;

  if (status === "confirmed") order.confirmedAt = new Date();
  if (status === "shipped") order.shippedAt = new Date();
  if (status === "delivered") {
    order.deliveredAt = new Date();
    // Cash on delivery: the money is collected at the door.
    if (order.paymentMethod === "cod" && order.paymentStatus === "pending") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }
  }

  await order.save();

  res.status(200).json({ success: true, data: order });
};
