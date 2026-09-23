"use client";

import { useState } from "react";
import type { ProductInput } from "@/types/product";

const initial: ProductInput = { title: "", description: "", category: "beauty", price: 0, stock: 0, thumbnail: "" };

export default function ProductForm({ initialValue = initial, submitLabel, onSubmit }: { initialValue?: ProductInput; submitLabel: string; onSubmit: (value: ProductInput) => Promise<void> }) {
  const [form, setForm] = useState<ProductInput>(initialValue);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.category.trim()) next.category = "Category is required";
    if (form.price < 0) next.price = "Price cannot be negative";
    if (form.stock < 0 || !Number.isInteger(form.stock)) next.stock = "Stock must be a whole number ≥ 0";
    if (form.thumbnail && !/^https?:\/\//i.test(form.thumbnail)) next.thumbnail = "Use a valid http(s) image URL";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  }

  const field = (label: string, key: keyof ProductInput, type = "text") => (
    <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">{label}</span><input type={type} value={String(form[key])} onChange={(e) => update(key, type === "number" ? Number(e.target.value) : e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900" />{errors[key] && <span className="mt-1 block text-xs text-red-600">{errors[key]}</span>}</label>
  );

  return <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
    {field("Title", "title")}
    <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">Description</span><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900" />{errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description}</span>}</label>
    {field("Category", "category")}
    <div className="grid gap-4 sm:grid-cols-2">{field("Price", "price", "number")}{field("Stock", "stock", "number")}</div>
    {field("Thumbnail URL (optional)", "thumbnail")}
    <button disabled={saving} className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : submitLabel}</button>
  </form>;
}
