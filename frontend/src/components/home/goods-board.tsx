"use client";

import { useState } from "react";

import { RetryButton } from "@/components/retry-button";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./product-card";

interface GoodsBoardProps {
  products: Product[];
  categories: Category[];
}

const categoryId = (product: Product) =>
  typeof product.category === "string" ? product.category : product.category._id;

const PREVIEW_LINES = 12;

export function GoodsBoard({ products, categories }: GoodsBoardProps) {
  const [active, setActive] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const counts = new Map<string, number>();
  for (const product of products) {
    const id = categoryId(product);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const matching = products
    .filter((product) => active === "all" || categoryId(product) === active)
    .sort((a, b) => Number(b.quantity > 0) - Number(a.quantity > 0));
  const visible = expanded ? matching : matching.slice(0, PREVIEW_LINES);

  const activeLabel =
    active === "all"
      ? "All goods"
      : (categories.find((category) => category._id === active)?.name ??
        "Selected category");

  return (
    <div id="departments" className="mt-8">
      <div
        role="group"
        aria-label="Filter goods by category"
        className="flex flex-wrap gap-2"
      >
        <FilterButton
          active={active === "all"}
          label="All goods"
          count={products.length}
          onClick={() => {
            setActive("all");
            setExpanded(false);
          }}
        />
        {categories.map((category) => (
          <FilterButton
            key={category._id}
            active={active === category._id}
            label={category.name}
            count={counts.get(category._id) ?? 0}
            onClick={() => {
              setActive(category._id);
              setExpanded(false);
            }}
          />
        ))}
      </div>

      <p
        aria-live="polite"
        className="mt-6 border-b border-border pb-3 font-mono text-eyebrow uppercase tracking-label text-brand"
      >
        Showing {visible.length} of {matching.length}{" "}
        {matching.length === 1 ? "line" : "lines"} / {activeLabel}
      </p>

      {visible.length ? (
        <div className="grid gap-3 border-b border-border pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div role="status" className="border-b border-border py-10">
          <p className="font-display text-xl uppercase tracking-display">
            No lines filed here
          </p>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            There are no goods in {activeLabel} right now. No substitutions have
            been made.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setActive("all");
                setExpanded(false);
              }}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Show all goods
            </button>
            <RetryButton />
          </div>
        </div>
      )}

      {matching.length > visible.length ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-11 items-center rounded-full border border-border px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:border-foreground"
          >
            Show remaining {matching.length - visible.length} lines
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}

function FilterButton({ active, label, count, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 font-mono text-eyebrow uppercase tracking-label transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:border-foreground"
      }`}
    >
      <span>{label}</span>
      <span className={active ? "opacity-70" : "text-brand"}>{count}</span>
    </button>
  );
}
