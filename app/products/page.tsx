"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductTable from "@/components/ProductTable";
import Pagination from "@/components/Pagination";
import { ErrorState, Loading } from "@/components/Loading";
import { getCategories, getProducts, deleteProduct } from "@/lib/products";
import { applyLocalChanges, deleteLocalProduct, getLocalAddedProducts } from "@/lib/local-products";
import type { Category, Product } from "@/types/product";

const validSizes = [10, 20, 50];
const validSorts = ["price", "rating", "title"] as const;

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pageRaw = Number(params.get("page"));
  const sizeRaw = Number(params.get("pageSize"));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const pageSize = validSizes.includes(sizeRaw) ? sizeRaw : 10;
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sortParam = params.get("sort");
  const sort = validSorts.includes(sortParam as typeof validSorts[number]) ? (sortParam as typeof validSorts[number]) : "title";
  const order = params.get("order") === "desc" ? "desc" : "asc";
  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const deletingIds = useRef(new Set<number>());

  useEffect(() => setSearchInput(search), [search]);

  const updateParams = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value));
    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) updateParams({ search: searchInput.trim() || null, page: "1" });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  useEffect(() => {
    const controller = new AbortController();
    const id = ++requestId.current;
    setLoading(true); setError("");
    getProducts({ page, limit: pageSize, search, category: search ? "" : category, sort, order }, controller.signal)
      .then((data) => {
        if (id !== requestId.current) return;
        const local = applyLocalChanges(data.products);
        const added = page === 1 && !search && !category ? getLocalAddedProducts() : [];
        setProducts([...added, ...local].slice(0, pageSize));
        const localState = getLocalAddedProducts();
        setTotal(Math.max(0, data.total + (page === 1 && !search && !category ? localState.length : 0)));
      })
      .catch((err) => { if (err?.code === "ERR_CANCELED") return; if (id === requestId.current) setError(err instanceof Error ? err.message : "Failed to load products"); })
      .finally(() => { if (id === requestId.current) setLoading(false); });
    return () => controller.abort();
  }, [page, pageSize, search, category, sort, order]);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage && total >= 0) updateParams({ page: String(maxPage) });
  }, [page, pageSize, total, updateParams]);

  const title = useMemo(() => search ? `Search results for “${search}”` : "Products", [search]);

  function deleteConfirm(product: Product) {
    if (deletingIds.current.has(product.id)) return;
    if (!window.confirm(`Delete “${product.title}”?`)) return;
    deletingIds.current.add(product.id);
    deleteProduct(product.id).then(() => { deleteLocalProduct(product.id); setProducts((old) => old.filter((p) => p.id !== product.id)); setTotal((t) => Math.max(0, t - 1)); }).catch((err) => window.alert(err instanceof Error ? err.message : "Delete failed")).finally(() => deletingIds.current.delete(product.id));
  }

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">Manage products, search, filter and sort.</p></div><Link href="/products/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">+ Add product</Link></div>
    <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_1fr]"><label className="text-sm font-medium">Search<input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-sm font-medium">Category<select disabled={Boolean(search)} value={search ? "" : category} onChange={(e) => updateParams({ category: e.target.value || null, page: "1" })} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 disabled:bg-slate-100"><option value="">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label><label className="text-sm font-medium">Sort<select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: "1" })} className="mt-1 w-full rounded-lg border bg-white px-3 py-2">{validSorts.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select></label><label className="text-sm font-medium">Order<select value={order} onChange={(e) => updateParams({ order: e.target.value, page: "1" })} className="mt-1 w-full rounded-lg border bg-white px-3 py-2"><option value="asc">Ascending</option><option value="desc">Descending</option></select></label></section>
    {search && <p className="text-xs text-amber-700">Category filtering is disabled during search because DummyJSON's search endpoint does not combine search and category filtering. Search takes precedence.</p>}
    {loading ? <Loading label="Loading products..." /> : error ? <ErrorState message={error} onRetry={() => router.refresh()} /> : products.length === 0 ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">No products found.</div> : <><ProductTable products={products} onDelete={deleteConfirm} /><Pagination page={page} pageSize={pageSize} total={total} onPage={(p) => updateParams({ page: String(p) })} onPageSize={(s) => updateParams({ pageSize: String(s), page: "1" })} /></>}
  </main>;
}
