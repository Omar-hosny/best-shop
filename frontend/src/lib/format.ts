import type { Product } from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatMoney = (value: number) => usd.format(value);

export const categoryName = (value: Product["category"]) =>
  typeof value === "string" ? "Selected" : value.name;
