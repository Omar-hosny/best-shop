// Kept out of the "use server" action module: those files may only export
// async functions, so the state shape and initial value live here.
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
