// Shapes returned by the Express API. Dates arrive as ISO strings after JSON
// serialization, and every endpoint wraps its payload in { success, data }.

export interface CategoryRef {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  images: string[];
  // Listing/detail endpoints populate this with { _id, name }; writes return
  // the bare id. Keep both possibilities here so one type serves all routes.
  category: CategoryRef | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// The API never returns `password` (select: false) or reset-token fields.
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profileImage?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  // Stock level, not the quantity in the cart.
  quantity: number;
  category?: CategoryRef | string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  // A user who has never added an item gets a synthetic empty cart with _id null.
  _id: string | null;
  user?: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  updatedAt?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode?: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  note?: string;
  paidAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface ValidationIssue {
  field: string;
  message: string;
  location: "body" | "query" | "params" | "cookies" | "headers";
}
