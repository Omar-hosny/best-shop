import { logoutAction } from "@/app/actions/auth.actions";
import { SubmitButton } from "@/components/auth/submit-button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <SubmitButton label="Sign out" pendingLabel="Signing out…" />
    </form>
  );
}
