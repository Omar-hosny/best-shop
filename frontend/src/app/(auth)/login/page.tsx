import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthFormFallback } from "@/components/auth/auth-form-fallback";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Best Shop account.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const destination = safeRedirectPath(next);

  if (await getCurrentUser()) redirect(destination);

  return <LoginForm next={destination} />;
}
