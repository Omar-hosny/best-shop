import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthFormFallback } from "@/components/auth/auth-form-fallback";
import { RegisterForm } from "@/components/auth/register-form";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Best Shop account to save your cart and orders.",
};

interface RegisterPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  const destination = safeRedirectPath(next);

  if (await getCurrentUser()) redirect(destination);

  return <RegisterForm next={destination} />;
}
