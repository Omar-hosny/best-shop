"use client";

import { useActionState } from "react";

import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { initialProductActionState } from "@/lib/catalog-state";
import type { ProductActionState } from "@/lib/catalog-state";
import {
  emptyProductFormValues,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_DESCRIPTION_MIN,
  PRODUCT_MAX_IMAGES,
  PRODUCT_NAME_MAX,
  type ProductFormValues,
} from "@/lib/product-rules";
import type { Category } from "@/lib/types";

type ProductFormAction = (
  state: ProductActionState,
  formData: FormData,
) => Promise<ProductActionState>;

interface ProductFormProps {
  mode: "create" | "update";
  action: ProductFormAction;
  categories: Category[];
  initialValues?: ProductFormValues;
}

const outlineClass =
  "h-12 w-full rounded-2xl border border-border/60 bg-card px-4 font-mono text-sm outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring";

export function ProductForm({
  mode,
  action,
  categories,
  initialValues = emptyProductFormValues,
}: ProductFormProps) {
  const [state, formAction] = useActionState(action, {
    ...initialProductActionState,
    values: initialValues,
  });
  const values = state.values;
  const errors = state.fieldErrors;
  const remountKey = state.submissionId;
  const isUpdate = mode === "update";

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            state.status === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-surface-accent text-brand"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {isUpdate ? (
        <input type="hidden" name="productId" value={initialValues.productId} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            key={`name-${remountKey}`}
            name="name"
            label="Product name"
            required
            maxLength={PRODUCT_NAME_MAX}
            placeholder="e.g. Brass Desk Lamp"
            defaultValue={values.name}
            error={errors.name}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label
            htmlFor="product-description"
            className="block font-mono text-eyebrow font-bold uppercase tracking-label"
          >
            Description
          </label>
          <textarea
            key={`description-${remountKey}`}
            id="product-description"
            name="description"
            rows={4}
            maxLength={PRODUCT_DESCRIPTION_MAX}
            defaultValue={values.description}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? "product-description-error" : undefined}
            placeholder="What makes this item worth carrying?"
            className={`${outlineClass} h-auto resize-y py-3`}
          />
          {errors.description ? (
            <p id="product-description-error" className="text-sm text-destructive">
              {errors.description}
            </p>
          ) : (
            <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
              {isUpdate
                ? `Leave blank to keep the current description · ${PRODUCT_DESCRIPTION_MIN}–${PRODUCT_DESCRIPTION_MAX} characters otherwise`
                : `Optional · ${PRODUCT_DESCRIPTION_MIN}–${PRODUCT_DESCRIPTION_MAX} characters`}
            </p>
          )}
        </div>

        <FormField
          key={`price-${remountKey}`}
          name="price"
          label="Price (USD)"
          type="number"
          inputMode="decimal"
          min={0}
          max={1000000}
          step="0.01"
          required
          placeholder="0.00"
          defaultValue={values.price}
          error={errors.price}
        />

        <FormField
          key={`quantity-${remountKey}`}
          name="quantity"
          label="Quantity on hand"
          type="number"
          inputMode="numeric"
          min={0}
          max={100000}
          step="1"
          required
          placeholder="0"
          defaultValue={values.quantity}
          error={errors.quantity}
        />

        <div className="sm:col-span-2 space-y-2">
          <label
            htmlFor="product-category"
            className="block font-mono text-eyebrow font-bold uppercase tracking-label"
          >
            Category
          </label>
          <select
            key={`category-${remountKey}`}
            id="product-category"
            name="category"
            required
            defaultValue={values.category}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? "product-category-error" : undefined}
            className={outlineClass}
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p id="product-category-error" className="text-sm text-destructive">
              {errors.category}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label
            htmlFor="product-images"
            className="block font-mono text-eyebrow font-bold uppercase tracking-label"
          >
            Image URLs
          </label>
          <textarea
            key={`images-${remountKey}`}
            id="product-images"
            name="images"
            rows={Math.min(PRODUCT_MAX_IMAGES + 1, 6)}
            defaultValue={values.images}
            aria-invalid={errors.images ? true : undefined}
            aria-describedby={errors.images ? "product-images-error" : undefined}
            placeholder="https://example.com/photo.jpg"
            className={`${outlineClass} h-auto resize-y py-3`}
          />
          {errors.images ? (
            <p id="product-images-error" className="text-sm text-destructive">
              {errors.images}
            </p>
          ) : (
            <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
              One full URL per line · at most {PRODUCT_MAX_IMAGES} · no uploads
              yet
            </p>
          )}
        </div>
      </div>

      {isUpdate ? (
        <>
          <input type="hidden" name="originalName" value={initialValues.name} />
          <input
            type="hidden"
            name="originalDescription"
            value={initialValues.description}
          />
          <input type="hidden" name="originalPrice" value={initialValues.price} />
          <input
            type="hidden"
            name="originalQuantity"
            value={initialValues.quantity}
          />
          <input
            type="hidden"
            name="originalCategory"
            value={initialValues.category}
          />
          <input
            type="hidden"
            name="originalImages"
            value={initialValues.images}
          />
        </>
      ) : null}

      <SubmitButton
        label={isUpdate ? "Save changes" : "Create product"}
        pendingLabel={isUpdate ? "Saving…" : "Creating…"}
        className="w-full sm:w-auto"
      />
    </form>
  );
}
