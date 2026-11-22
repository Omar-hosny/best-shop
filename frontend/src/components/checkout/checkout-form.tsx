"use client";

import { useActionState } from "react";

import { createOrderAction } from "@/app/actions/order.actions";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { PHONE_PATTERN, type CheckoutValues } from "@/lib/checkout-rules";
import { initialCheckoutState } from "@/lib/checkout-state";

interface CheckoutFormProps {
  defaultValues: CheckoutValues;
}

const inputClass =
  "h-12 w-full rounded-2xl border border-border/60 bg-card px-4 font-mono text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring/30";

export function CheckoutForm({ defaultValues }: CheckoutFormProps) {
  const [state, formAction] = useActionState(
    createOrderAction,
    initialCheckoutState,
  );

  // Before the first submit, prefill the account name. After a failed submit,
  // show exactly what was sent — including an intentionally empty field.
  const value = (key: keyof CheckoutValues) =>
    state.status === "idle" ? defaultValues[key] : state.values[key];
  const error = (key: string) => state.fieldErrors[key];

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="paymentMethod" value="cod" />

      {state.message ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="mb-5 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
          01 · Who is it for
        </legend>
        <FormField
          name="shippingAddress.fullName"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={value("shippingAddress.fullName")}
          error={error("shippingAddress.fullName")}
        />
        <FormField
          name="shippingAddress.phone"
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 555 010 2030"
          pattern={PHONE_PATTERN.source}
          title="Use 7–20 digits, spaces, hyphens, or a leading +"
          required
          maxLength={20}
          defaultValue={value("shippingAddress.phone")}
          error={error("shippingAddress.phone")}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
          02 · Where it goes
        </legend>
        <FormField
          name="shippingAddress.street"
          label="Street address"
          autoComplete="street-address"
          placeholder="Number and street"
          required
          minLength={5}
          maxLength={200}
          defaultValue={value("shippingAddress.street")}
          error={error("shippingAddress.street")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            name="shippingAddress.city"
            label="City"
            autoComplete="address-level2"
            placeholder="City"
            required
            minLength={2}
            maxLength={100}
            defaultValue={value("shippingAddress.city")}
            error={error("shippingAddress.city")}
          />
          <FormField
            name="shippingAddress.postalCode"
            label="Postal code"
            autoComplete="postal-code"
            placeholder="Optional"
            maxLength={20}
            defaultValue={value("shippingAddress.postalCode")}
            error={error("shippingAddress.postalCode")}
          />
          <div className="sm:col-span-2">
            <FormField
              name="shippingAddress.country"
              label="Country"
              autoComplete="country-name"
              placeholder="Country"
              required
              minLength={2}
              maxLength={100}
              defaultValue={value("shippingAddress.country")}
              error={error("shippingAddress.country")}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-5 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
          03 · At the door
        </legend>
        <label
          htmlFor="checkout-note"
          className="block font-mono text-eyebrow font-bold uppercase tracking-label"
        >
          Delivery note <span className="font-medium text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="checkout-note"
          name="note"
          rows={4}
          maxLength={500}
          defaultValue={value("note")}
          aria-invalid={error("note") ? true : undefined}
          aria-describedby={error("note") ? "checkout-note-error" : "checkout-note-hint"}
          className={`${inputClass} h-auto resize-y py-3`}
          placeholder="Gate code, landmarks, or a quiet instruction"
        />
        {error("note") ? (
          <p id="checkout-note-error" className="pl-2 text-xs text-destructive">
            {error("note")}
          </p>
        ) : (
          <p id="checkout-note-hint" className="pl-2 text-xs text-muted-foreground">
            Anything the driver should know. Up to 500 characters.
          </p>
        )}
      </fieldset>

      <div className="border-t-2 border-sign pt-6">
        <SubmitButton
          label="Place order"
          pendingLabel="Placing order…"
          className="w-full"
        />
        <p className="mt-4 text-center font-mono text-eyebrow font-bold uppercase tracking-label text-muted-foreground">
          Cash is collected at the door. No card needed.
        </p>
      </div>
    </form>
  );
}
