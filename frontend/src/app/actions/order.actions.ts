"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import {
  type CheckoutValues,
  validateCheckoutValues,
} from "@/lib/checkout-rules";
import type { CheckoutActionState } from "@/lib/checkout-state";
import { getAuthCookieHeader } from "@/lib/session";
import type { Order } from "@/lib/types";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAuthCookie(): Promise<string> {
  const cookie = await getAuthCookieHeader();
  if (!cookie) redirect("/login?next=/checkout");
  return cookie;
}

function fail(
  message: string,
  values: CheckoutValues,
): CheckoutActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
    values,
  };
}

function toCheckoutState(
  error: unknown,
  values: CheckoutValues,
): CheckoutActionState {
  if (error instanceof ApiError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.errors) {
      if (issue.field && !fieldErrors[issue.field]) {
        fieldErrors[issue.field] = issue.message;
      }
    }
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    return {
      status: "error",
      message: hasFieldErrors
        ? null
        : error.message || "We could not place that order",
      fieldErrors,
      values,
    };
  }

  return fail("Something went wrong. Please try again.", values);
}

export async function createOrderAction(
  _previous: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  // The form is only rendered for signed-in shoppers, but a Server Action is a
  // public POST endpoint. Authenticate here as well. Redirects stay outside
  // try/catch so NEXT_REDIRECT is never swallowed.
  const cookie = await requireAuthCookie();

  const values: CheckoutValues = {
    "shippingAddress.fullName": readField(
      formData,
      "shippingAddress.fullName",
    ),
    "shippingAddress.phone": readField(formData, "shippingAddress.phone"),
    "shippingAddress.street": readField(formData, "shippingAddress.street"),
    "shippingAddress.city": readField(formData, "shippingAddress.city"),
    "shippingAddress.postalCode": readField(
      formData,
      "shippingAddress.postalCode",
    ),
    "shippingAddress.country": readField(formData, "shippingAddress.country"),
    note: readField(formData, "note"),
  };

  const fieldErrors = validateCheckoutValues(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: null,
      fieldErrors,
      values,
    };
  }

  // Items, prices, totals, status and the user are deliberately absent. The
  // API derives all of them from the cart and the forwarded session.
  const body = {
    shippingAddress: {
      fullName: values["shippingAddress.fullName"],
      phone: values["shippingAddress.phone"],
      street: values["shippingAddress.street"],
      city: values["shippingAddress.city"],
      country: values["shippingAddress.country"],
      ...(values["shippingAddress.postalCode"]
        ? { postalCode: values["shippingAddress.postalCode"] }
        : {}),
    },
    paymentMethod: "cod" as const,
    ...(values.note ? { note: values.note } : {}),
  };

  let order: Order | undefined;
  let unauthorized = false;

  try {
    const result = await apiFetch<Order>("/orders", {
      method: "POST",
      cookie,
      body,
    });
    order = result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      return toCheckoutState(error, values);
    }
  }

  if (unauthorized) {
    redirect("/login?next=/checkout");
  }

  if (!order) {
    return fail("We could not place that order. Please try again.", values);
  }

  revalidatePath("/cart");
  revalidatePath("/orders");
  redirect(`/orders/${order._id}`);
}
