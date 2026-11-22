// Kept out of the "use server" action module: those files may only export
// async functions, so the state shape and initial value live here.
import { emptyCheckoutValues, type CheckoutValues } from "./checkout-rules";

export interface CheckoutActionState {
  status: "idle" | "ok" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
  values: CheckoutValues;
}

export const initialCheckoutState: CheckoutActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: emptyCheckoutValues,
};
