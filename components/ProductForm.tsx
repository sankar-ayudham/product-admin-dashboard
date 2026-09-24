"use client";

import { useEffect, useState } from "react";
import type { Category, ProductInput } from "@/types/product";
import { getCategories } from "@/lib/products";

const initial: ProductInput = {
  title: "",
  description: "",
  category: "beauty",
  price: 0,
  stock: 0,
  thumbnail: "",
};

type ProductFormProps = {
  initialValue?: ProductInput;
  submitLabel: string;
  onSubmit: (value: ProductInput) => Promise<void>;
};

// Hide individual electronics categories.
// They will be represented by one "Electronics" category.
const excludedCategories = new Set([
  "smartphones",
  "laptops",
  "tablets",
  "mobile-accessories",
]);

export default function ProductForm({
  initialValue = initial,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductInput>(initialValue);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const data = await getCategories();

        if (!cancelled) {
          const filteredCategories = data.filter(
            (category) => !excludedCategories.has(category.slug)
          );

          setCategories(filteredCategories);
        }
      } catch (error) {
        if (!cancelled) {
          setCategoriesError(
            error instanceof Error
              ? error.message
              : "Failed to load categories"
          );
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setForm(initialValue);
    setErrors({});
  }, [initialValue]);

  function update<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));

    setErrors((old) => ({
      ...old,
      [key]: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (saving) return;

    const next: Record<string, string> = {};

    if (!form.title.trim()) {
      next.title = "Title is required";
    }

    if (!form.description.trim()) {
      next.description = "Description is required";
    }

    if (!form.category.trim()) {
      next.category = "Category is required";
    }

    if (form.price < 0) {
      next.price = "Price cannot be negative";
    }

    if (form.stock < 0 || !Number.isInteger(form.stock)) {
      next.stock = "Stock must be a whole number ≥ 0";
    }

    if (
      form.thumbnail &&
      !/^https?:\/\//i.test(form.thumbnail)
    ) {
      next.thumbnail = "Use a valid http(s) image URL";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        thumbnail: form.thumbnail.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  function inputField(
    label: string,
    key: keyof ProductInput,
    type = "text"
  ) {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>

        <input
          type={type}
          value={String(form[key])}
          onChange={(e) =>
            update(
              key,
              type === "number"
                ? Number(e.target.value)
                : e.target.value
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
        />

        {errors[key] && (
          <span className="mt-1 block text-xs text-red-600">
            {errors[key]}
          </span>
        )}
      </label>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7"
    >
      {inputField("Title", "title")}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </span>

        <textarea
          value={form.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
          rows={5}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
        />

        {errors.description && (
          <span className="mt-1 block text-xs text-red-600">
            {errors.description}
          </span>
        )}
      </label>

      {/* Category */}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Category
        </span>

        <select
          value={form.category}
          onChange={(e) =>
            update("category", e.target.value)
          }
          disabled={categoriesLoading || saving}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">
            Select a category
          </option>

          {/* Custom Electronics category */}
          <option value="electronics">
            Electronics
          </option>

          {categories.map((category) => (
            <option
              key={category.slug}
              value={category.slug}
            >
              {category.name}
            </option>
          ))}
        </select>

        {categoriesLoading && (
          <span className="mt-1 block text-xs text-slate-500">
            Loading categories...
          </span>
        )}

        {categoriesError && (
          <span className="mt-1 block text-xs text-red-600">
            Failed to load categories: {categoriesError}
          </span>
        )}

        {errors.category && (
          <span className="mt-1 block text-xs text-red-600">
            {errors.category}
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        {inputField("Price", "price", "number")}
        {inputField("Stock", "stock", "number")}
      </div>

      {inputField(
        "Thumbnail URL (optional)",
        "thumbnail"
      )}

      <button
        type="submit"
        disabled={saving || categoriesLoading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : categoriesLoading
            ? "Loading categories..."
            : submitLabel}
      </button>
    </form>
  );
}