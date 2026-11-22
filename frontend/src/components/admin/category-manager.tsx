"use client";

import { useActionState, useState } from "react";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions/catalog.actions";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { CATEGORY_NAME_MAX } from "@/lib/catalog-rules";
import {
  type CategoryActionState,
  initialCategoryActionState,
} from "@/lib/catalog-state";
import type { Category } from "@/lib/types";

type FormAction = (formData: FormData) => void;

const outlineButtonClass =
  "inline-flex min-h-11 items-center border-2 border-sign px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "inline-flex min-h-11 items-center border-2 border-destructive px-5 font-mono text-eyebrow font-bold uppercase tracking-label text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [createState, createAction, createPending] = useActionState(
    createCategoryAction,
    initialCategoryActionState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateCategoryAction,
    initialCategoryActionState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategoryAction,
    initialCategoryActionState,
  );
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // All three forms stay mounted; the success/error text lives outside the
  // rows so a delete message survives the row disappearing after revalidation.
  const messages = [createState, updateState, deleteState];

  return (
    <div className="space-y-5">
      <div aria-live="polite" className="space-y-2">
        {messages.map((state, index) => (
          <StatusMessage key={index} state={state} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <section
          aria-labelledby="new-category-title"
          className="rounded-4xl bg-card p-5 sm:p-6"
        >
          <h2
            id="new-category-title"
            className="font-display text-2xl uppercase leading-none tracking-display"
          >
            New category
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Categories feed the product form and the live storefront filters.
          </p>

          <form action={createAction} className="mt-5 space-y-4">
            <FormField
              key={createState.submissionId}
              name="name"
              label="Category name"
              required
              maxLength={CATEGORY_NAME_MAX}
              placeholder="e.g. Outerwear"
              defaultValue={createState.values.name}
              error={createState.fieldErrors.name}
            />
            <SubmitButton
              label="Add category"
              pendingLabel="Adding…"
              className="w-full"
            />
          </form>
        </section>

        <section
          aria-labelledby="category-list-title"
          className="rounded-4xl bg-card p-5 sm:p-6"
        >
          <h2
            id="category-list-title"
            className="font-display text-2xl uppercase leading-none tracking-display"
          >
            Category list
          </h2>
          <p className="mt-2 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {categories.length} live {categories.length === 1 ? "category" : "categories"}
          </p>

          {categories.length === 0 ? (
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              No categories yet. Add one before creating products.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-border/60">
              {categories.map((category) => (
                <CategoryRow
                  key={category._id}
                  category={category}
                  updateAction={updateAction}
                  deleteAction={deleteAction}
                  updatePending={updatePending}
                  deletePending={deletePending}
                  updateState={updateState}
                  confirming={confirmingId === category._id}
                  onConfirm={setConfirmingId}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {createPending || updatePending || deletePending ? (
        <p role="status" className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
          Saving change…
        </p>
      ) : null}
    </div>
  );
}

interface CategoryRowProps {
  category: Category;
  updateAction: FormAction;
  deleteAction: FormAction;
  updatePending: boolean;
  deletePending: boolean;
  updateState: CategoryActionState;
  confirming: boolean;
  onConfirm: (id: string | null) => void;
}

function CategoryRow({
  category,
  updateAction,
  deleteAction,
  updatePending,
  deletePending,
  updateState,
  confirming,
  onConfirm,
}: CategoryRowProps) {
  const isTarget = updateState.values.categoryId === category._id;
  const nameValue = isTarget ? updateState.values.name : category.name;
  const nameError = isTarget ? updateState.fieldErrors.name : undefined;

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-end gap-3">
        <form action={updateAction} className="flex min-w-0 flex-1 items-end gap-3">
          <input type="hidden" name="categoryId" value={category._id} />
          <div className="min-w-0 flex-1">
            <FormField
              key={isTarget ? updateState.submissionId : "idle"}
              id={`category-name-${category._id}`}
              name="name"
              label="Name"
              required
              maxLength={CATEGORY_NAME_MAX}
              defaultValue={nameValue}
              error={nameError}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            disabled={updatePending}
            className={outlineButtonClass}
          >
            {updatePending && isTarget ? "Saving…" : "Rename"}
          </button>
        </form>

        <form action={deleteAction}>
          <input type="hidden" name="categoryId" value={category._id} />
          {confirming ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={deletePending}
                className={dangerButtonClass}
              >
                {deletePending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => onConfirm(null)}
                disabled={deletePending}
                className={outlineButtonClass}
              >
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onConfirm(category._id)}
              className={dangerButtonClass}
            >
              Delete
            </button>
          )}
        </form>
      </div>
    </li>
  );
}

function StatusMessage({ state }: { state: CategoryActionState }) {
  if (!state.message) return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
        state.status === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-card text-brand"
      }`}
    >
      {state.message}
    </p>
  );
}
