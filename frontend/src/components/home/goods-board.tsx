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
  typeof product.category === "string"
    ? product.category
    : product.category._id;

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
        "Selected department");

  return (
    <div id="departments" className="mt-8">
      <div
        role="group"
        aria-label="Filter goods by department"
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
        className="my-6 font-mono text-eyebrow font-medium uppercase tracking-label text-brand"
      >
        Showing {visible.length} of {matching.length}{" "}
        {matching.length === 1 ? "tag" : "tags"} / {activeLabel}
      </p>

      {visible.length ? (
        <div className="grid gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div role="status" className="py-10">
          <p className="font-display text-xl uppercase tracking-display">
            No tags on this hook
          </p>
          <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
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
              className="inline-flex min-h-11 items-center bg-primary px-5 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
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
            className="inline-flex min-h-11 items-center bg-surface px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-surface-accent hover:text-brand"
          >
            Hang the remaining {matching.length - visible.length} tags
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
      className={`inline-flex min-h-11 items-center gap-2 px-3 font-mono text-eyebrow font-medium uppercase tracking-label transition-colors ${
        active
          ? "bg-sign text-sign-foreground"
          : "bg-surface hover:bg-surface-accent hover:text-brand"
      }`}
    >
      <span>{label}</span>
      <span className={active ? "opacity-70" : "text-brand"}>{count}</span>
    </button>
  );
}
