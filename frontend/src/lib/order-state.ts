// Kept out of the "use server" action module: those files may only export
// async functions, so the state shape and initial value live here.
export const CANCEL_REASON_MAX = 200;

export interface OrderActionState {
  status: "idle" | "ok" | "error";
  message: string | null;
  cancelReason: string;
  fieldErrors: Record<string, string>;
}

export const initialOrderActionState: OrderActionState = {
  status: "idle",
  message: null,
  cancelReason: "",
  fieldErrors: {},
};
