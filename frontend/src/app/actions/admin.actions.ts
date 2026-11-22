"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAllowedTransition, isOrderStatus } from "@/lib/admin-rules";
import type { AdminActionState } from "@/lib/admin-state";
import { ApiError, apiFetch } from "@/lib/api";
import { CANCEL_REASON_MAX } from "@/lib/order-state";
import { getAuthCookieHeader, getCurrentUser } from "@/lib/session";
import type { AdminOrder } from "@/lib/types";

const ORDER_ID_PATTERN = /^[a-f\d]{24}$/i;

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdmin(nextQuery: string): Promise<string> {
  const cookie = await getAuthCookieHeader();
  if (!cookie) redirect(`/login?next=${nextQuery}`);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${nextQuery}`);
  if (user.role !== "admin") redirect("/account");

  return cookie;
}

function apiMessage(error: ApiError, fallback: string): string {
  return error.errors[0]?.message || error.message || fallback;
}

export async function updateAdminOrderStatusAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const orderId = readField(formData, "orderId");
  const currentStatus = readField(formData, "currentStatus");
  const nextStatus = readField(formData, "status");
  const cancelReason = readField(formData, "cancelReason");
  const nextPath = `/admin/orders${currentStatus ? `?status=${encodeURIComponent(currentStatus)}` : ""}`;

  // A Server Action is a public POST endpoint. The UI hides unavailable
  // buttons, but the role check belongs here too. Redirects stay outside the
  // try/catch below so NEXT_REDIRECT is never swallowed.
  const cookie = await requireAdmin(encodeURIComponent(nextPath));

  if (!ORDER_ID_PATTERN.test(orderId)) {
    return { status: "error", message: "Invalid order id" };
  }
  if (!isOrderStatus(currentStatus)) {
    return { status: "error", message: "Invalid current order status" };
  }
  if (!isAllowedTransition(currentStatus, nextStatus)) {
    return { status: "error", message: "That status change is not allowed" };
  }
  if (nextStatus === "cancelled" && cancelReason.length > CANCEL_REASON_MAX) {
    return {
      status: "error",
      message: `Cancel reason must be at most ${CANCEL_REASON_MAX} characters`,
    };
  }

  let unauthorized = false;
  let forbidden = false;

  try {
    await apiFetch<AdminOrder>(`/orders/admin/${orderId}/status`, {
      method: "PATCH",
      cookie,
      body: {
        status: nextStatus,
        ...(cancelReason ? { cancelReason } : {}),
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      forbidden = true;
    } else {
      return {
        status: "error",
        message:
          error instanceof ApiError
            ? apiMessage(error, "We could not update that order")
            : "Something went wrong. Please try again.",
      };
    }
  }

  if (unauthorized) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (forbidden) {
    redirect("/account");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);

  return {
    status: "ok",
    message: `Status updated to ${nextStatus}.`,
  };
}
