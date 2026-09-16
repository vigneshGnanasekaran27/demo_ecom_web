"use client";

import { useState, type FormEvent } from "react";
import type { ShippingDetailsInput } from "@/types/order";

const FIELDS: { name: keyof ShippingDetailsInput; label: string; required: boolean; span?: "full" }[] = [
  { name: "name", label: "Full name", required: true },
  { name: "phone", label: "Phone number", required: true },
  { name: "line1", label: "Address line 1", required: true, span: "full" },
  { name: "line2", label: "Address line 2 (optional)", required: false, span: "full" },
  { name: "landmark", label: "Landmark (optional)", required: false, span: "full" },
  { name: "city", label: "City", required: true },
  { name: "state", label: "State", required: true },
  { name: "postal_code", label: "Postal code", required: true },
  { name: "country", label: "Country", required: false },
];

type Values = Record<keyof ShippingDetailsInput, string>;

const EMPTY_VALUES: Values = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  landmark: "",
  country: "India",
};

/**
 * Inline shipping-details form used at checkout (CHECKOUT-02) — no saved
 * address book for this build (DECISION-030); the order snapshots whatever
 * is entered here. Client-side validation per FRONTEND_RULES.md §9; the
 * backend re-validates presence again regardless (never trust frontend
 * validation alone).
 */
export function ShippingForm({
  onSubmit,
  isSubmitting,
  submitError,
}: {
  onSubmit: (values: ShippingDetailsInput) => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingDetailsInput, string>>>({});

  const handleChange = (name: keyof ShippingDetailsInput, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof ShippingDetailsInput, string>> = {};

    for (const field of FIELDS) {
      if (field.required && !values[field.name].trim()) {
        errors[field.name] = "Required";
      }
    }

    if (values.phone && !/^[0-9+\s-]{7,15}$/.test(values.phone.trim())) {
      errors.phone = "Enter a valid phone number";
    }

    if (values.postal_code && !/^[0-9A-Za-z\s-]{4,10}$/.test(values.postal_code.trim())) {
      errors.postal_code = "Enter a valid postal code";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...values,
      country: values.country.trim() || "India",
    });
  };

  return (
    // method="post": see LoginForm's identical form tag for why — a
    // pre-hydration click must never fall back to a GET that puts the
    // customer's name/phone/address in the URL/history/server logs.
    <form onSubmit={handleSubmit} method="post" noValidate className="grid grid-cols-2 gap-4">
      {FIELDS.map((field) => (
        <div key={field.name} className={field.span === "full" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
          <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            value={values[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            aria-invalid={Boolean(fieldErrors[field.name])}
            aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {fieldErrors[field.name] && (
            <p id={`${field.name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
              {fieldErrors[field.name]}
            </p>
          )}
        </div>
      ))}

      <div className="col-span-2 mt-2">
        {submitError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{submitError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Placing order..." : "Continue to Payment"}
        </button>
      </div>
    </form>
  );
}
