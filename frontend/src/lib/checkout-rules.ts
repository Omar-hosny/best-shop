// Shared by the checkout form and its Server Action. Mirrors
// validators/order.validator.js so the API stays the final authority while the
// UI can reject obvious mistakes without a round trip.

export const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

export interface CheckoutValues {
  "shippingAddress.fullName": string;
  "shippingAddress.phone": string;
  "shippingAddress.street": string;
  "shippingAddress.city": string;
  "shippingAddress.postalCode": string;
  "shippingAddress.country": string;
  note: string;
}

export const emptyCheckoutValues: CheckoutValues = {
  "shippingAddress.fullName": "",
  "shippingAddress.phone": "",
  "shippingAddress.street": "",
  "shippingAddress.city": "",
  "shippingAddress.postalCode": "",
  "shippingAddress.country": "",
  note: "",
};

export function validateCheckoutValues(
  values: CheckoutValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const fullName = values["shippingAddress.fullName"];
  if (!fullName) errors["shippingAddress.fullName"] = "Full name is required";
  else if (fullName.length < 2 || fullName.length > 100) {
    errors["shippingAddress.fullName"] =
      "Full name must be between 2 and 100 characters";
  }

  const phone = values["shippingAddress.phone"];
  if (!phone) errors["shippingAddress.phone"] = "Phone number is required";
  else if (!PHONE_PATTERN.test(phone)) {
    errors["shippingAddress.phone"] = "Please provide a valid phone number";
  }

  const street = values["shippingAddress.street"];
  if (!street) errors["shippingAddress.street"] = "Street address is required";
  else if (street.length < 5 || street.length > 200) {
    errors["shippingAddress.street"] =
      "Street address must be between 5 and 200 characters";
  }

  const city = values["shippingAddress.city"];
  if (!city) errors["shippingAddress.city"] = "City is required";
  else if (city.length < 2 || city.length > 100) {
    errors["shippingAddress.city"] = "City must be between 2 and 100 characters";
  }

  if (values["shippingAddress.postalCode"].length > 20) {
    errors["shippingAddress.postalCode"] =
      "Postal code must be at most 20 characters";
  }

  const country = values["shippingAddress.country"];
  if (!country) errors["shippingAddress.country"] = "Country is required";
  else if (country.length < 2 || country.length > 100) {
    errors["shippingAddress.country"] =
      "Country must be between 2 and 100 characters";
  }

  if (values.note.length > 500) {
    errors.note = "Note must be at most 500 characters";
  }

  return errors;
}
