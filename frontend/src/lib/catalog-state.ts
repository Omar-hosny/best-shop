// Kept out of the "use server" action module: those files may only export
// async functions, so the state shape and initial value live here.
import type {
  ProductFieldErrors,
  ProductFormValues,
} from "./product-rules";
import { emptyProductFormValues } from "./product-rules";

export interface CategoryActionState {
  status: "idle" | "ok" | "error";
  message: string | null;
  fieldErrors: { name?: string };
  values: { name: string; categoryId: string };
  // Bumped on every submission so forms can remount with the returned values.
  submissionId: number;
}

export const initialCategoryActionState: CategoryActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: { name: "", categoryId: "" },
  submissionId: 0,
};

export interface ProductActionState {
  status: "idle" | "ok" | "error";
  message: string | null;
  fieldErrors: ProductFieldErrors;
  values: ProductFormValues;
  // Bumped on every submission so forms can remount with the returned values.
  submissionId: number;
}

export const initialProductActionState: ProductActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: emptyProductFormValues,
  submissionId: 0,
};
