// Kept out of the "use server" action module: those files may only export
// async functions, so the state shape and initial value live here.
export interface AdminActionState {
  status: "idle" | "ok" | "error";
  message: string | null;
}

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: null,
};
