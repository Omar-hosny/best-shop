// Kept out of the "use server" action module: those files may only export
// async functions, so state shapes and initial values live here.

export interface AuthState {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
  // Only non-sensitive values are echoed back so a failed submit does not wipe
  // the whole form. Passwords are never included.
  values: {
    name?: string;
    email?: string;
  };
}

export const initialAuthState: AuthState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: {},
};
