"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProductTable from "@/components/ProductTable";
import Pagination from "@/components/Pagination";
import { ErrorState, Loading } from "@/components/Loading";

import {
  ELECTRONICS_CATEGORIES,
  getCategories,
  getProducts,
  deleteProduct,
} from "@/lib/products";

import {
  applyLocalChanges,
  deleteLocalProduct,
  getLocalAddedProducts,
  getLocalState,
} from "@/lib/local-products";

import type {
  Category,
  Product,
} from "@/types/product";

const validSizes = [10, 20, 50];

const validSorts = [
  "price",
  "rating",
  "title",
] as const;

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const pageRaw = Number(params.get("page"));
  const sizeRaw = Number(params.get("pageSize"));

  const page =
    Number.isInteger(pageRaw) && pageRaw > 0
      ? pageRaw
      : 1;

  const pageSize = validSizes.includes(sizeRaw)
    ? sizeRaw
    : 10;

  const search = params.get("search") || "";
  const category = params.get("category") || "";

  const sortParam = params.get("sort");

  const sort = validSorts.includes(
    sortParam as (typeof validSorts)[number]
  )
    ? (sortParam as (typeof validSorts)[number])
    : "title";

  const order =
    params.get("order") === "desc"
      ? "desc"
      : "asc";

  const [searchInput, setSearchInput] =
    useState(search);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [total, setTotal] = useState(0);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [retryCount, setRetryCount] =
    useState(0);

  const requestId = useRef(0);

  const deletingIds = useRef(
    new Set<number>()
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateParams = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(
        params.toString()
      );

      Object.entries(changes).forEach(
        ([key, value]) => {
          if (value === null) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
      );

      const queryString = next.toString();

      router.push(
        queryString
          ? `${pathname}?${queryString}`
          : pathname
      );
    },
    [params, pathname, router]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({
          search: searchInput.trim() || null,
          page: "1",
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    searchInput,
    search,
    updateParams,
  ]);

  // Load products
  useEffect(() => {
    const controller =
      new AbortController();

    const id = ++requestId.current;

    setLoading(true);
    setError("");

    async function loadProducts() {
      try {
        const data = await getProducts(
          {
            page,
            limit: pageSize,
            search,
            category: search
              ? ""
              : category,
            sort,
            order,
          },
          controller.signal
        );

        if (id !== requestId.current) {
          return;
        }

        const localState = getLocalState();

        /*
         * Products returned by DummyJSON after
         * applying local edit/delete changes.
         */
        const apiProducts =
          applyLocalChanges(
            data.products
          );

        /*
         * All products created locally.
         */
        const allAddedProducts =
          getLocalAddedProducts();

        /*
         * Find locally-added products that match
         * the current search.
         *
         * DummyJSON does not know about these
         * products, so we must search them ourselves.
         */
        const matchingLocalSearchProducts =
          search
            ? allAddedProducts.filter(
                (product) => {
                  const query =
                    search.toLowerCase();

                  return (
                    product.title
                      .toLowerCase()
                      .includes(query) ||
                    product.description
                      .toLowerCase()
                      .includes(query) ||
                    product.category
                      .toLowerCase()
                      .includes(query)
                  );
                }
              )
            : [];

        let addedProducts: Product[] = [];

        /*
         * Normal product list:
         * show all locally-added products on
         * page 1.
         */
        if (
          !search &&
          page === 1
        ) {
          if (!category) {
            addedProducts =
              allAddedProducts;
          } else if (
            category === "electronics"
          ) {
            addedProducts =
              allAddedProducts.filter(
                (product) =>
                  ELECTRONICS_CATEGORIES.includes(
                    product.category
                  )
              );
          } else {
            addedProducts =
              allAddedProducts.filter(
                (product) =>
                  product.category ===
                  category
              );
          }
        }

        /*
         * Search:
         * combine DummyJSON search results
         * with matching locally-added products.
         */
        if (search && page === 1) {
          addedProducts =
            matchingLocalSearchProducts;
        }

        /*
         * Prevent duplicate IDs.
         */
        const combined = [
          ...addedProducts,
          ...apiProducts,
        ];

        const uniqueProducts =
          Array.from(
            new Map(
              combined.map((product) => [
                product.id,
                product,
              ])
            ).values()
          );

        const visibleProducts =
          uniqueProducts.slice(
            0,
            pageSize
          );

        setProducts(visibleProducts);

        /*
         * Calculate total including matching
         * local products.
         */
        let calculatedTotal =
          data.total;

        if (search) {
          calculatedTotal +=
            matchingLocalSearchProducts.length;
        } else if (category === "electronics") {
          calculatedTotal +=
            allAddedProducts.filter(
              (product) =>
                ELECTRONICS_CATEGORIES.includes(
                  product.category
                )
            ).length;
        } else if (!category) {
          calculatedTotal +=
            allAddedProducts.length;
        } else {
          calculatedTotal +=
            allAddedProducts.filter(
              (product) =>
                product.category ===
                category
            ).length;
        }

        /*
         * Account for locally deleted API
         * products on the normal list.
         */
        const deletedApiCount =
          localState.deleted.filter(
            (deletedId) =>
              !localState.added.some(
                (product) =>
                  product.id === deletedId
              )
          ).length;

        if (!search && !category) {
          calculatedTotal -=
            deletedApiCount;
        }

        setTotal(
          Math.max(0, calculatedTotal)
        );
      } catch (err) {
        if (
          controller.signal.aborted ||
          id !== requestId.current
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products"
        );
      } finally {
        if (id === requestId.current) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [
    page,
    pageSize,
    search,
    category,
    sort,
    order,
    retryCount,
  ]);

  // Load categories
  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((data) => {
        if (cancelled) return;

        const electronicsCategory: Category = {
          slug: "electronics",
          name: "Electronics",
          url: "",
        };

        const combined = [
          ...data.filter(
            (item) =>
              item.slug !== "electronics"
          ),
          electronicsCategory,
        ];

        combined.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setCategories(combined);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep page number valid
  useEffect(() => {
    if (loading || error) return;

    const maxPage = Math.max(
      1,
      Math.ceil(total / pageSize)
    );

    if (page > maxPage) {
      updateParams({
        page: String(maxPage),
      });
    }
  }, [
    page,
    pageSize,
    total,
    loading,
    error,
    updateParams,
  ]);

  const title = useMemo(
    () =>
      search
        ? `Search results for “${search}”`
        : "Products",
    [search]
  );

  async function deleteConfirm(
    product: Product
  ) {
    if (
      deletingIds.current.has(
        product.id
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        `Delete “${product.title}”?`
      )
    ) {
      return;
    }

    deletingIds.current.add(
      product.id
    );

    try {
      const isLocalProduct =
        getLocalAddedProducts().some(
          (item) =>
            item.id === product.id
        );

      /*
       * Locally-added products do not exist
       * on DummyJSON's server.
       */
      if (!isLocalProduct) {
        await deleteProduct(
          product.id
        );
      }

      deleteLocalProduct(
        product.id
      );

      setProducts((old) =>
        old.filter(
          (item) =>
            item.id !== product.id
        )
      );

      setTotal((current) =>
        Math.max(
          0,
          current - 1
        )
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Delete failed"
      );
    } finally {
      deletingIds.current.delete(
        product.id
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage products, search, filter
            and sort.
          </p>
        </div>

        <Link
          href="/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
        >
          + Add product
        </Link>
      </div>

      <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="text-sm font-medium">
          Search

          <input
            value={searchInput}
            onChange={(e) =>
              setSearchInput(
                e.target.value
              )
            }
            placeholder="Search products..."
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Category

          <select
            disabled={Boolean(search)}
            value={
              search
                ? ""
                : category
            }
            onChange={(e) =>
              updateParams({
                category:
                  e.target.value ||
                  null,
                page: "1",
              })
            }
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 disabled:bg-slate-100"
          >
            <option value="">
              All categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item.slug}
                  value={item.slug}
                >
                  {item.name}
                </option>
              )
            )}
          </select>
        </label>

        <label className="text-sm font-medium">
          Sort

          <select
            value={sort}
            onChange={(e) =>
              updateParams({
                sort: e.target.value,
                page: "1",
              })
            }
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2"
          >
            {validSorts.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item[0].toUpperCase() +
                    item.slice(1)}
                </option>
              )
            )}
          </select>
        </label>

        <label className="text-sm font-medium">
          Order

          <select
            value={order}
            onChange={(e) =>
              updateParams({
                order:
                  e.target.value,
                page: "1",
              })
            }
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2"
          >
            <option value="asc">
              Ascending
            </option>

            <option value="desc">
              Descending
            </option>
          </select>
        </label>
      </section>

      {search && (
        <p className="text-xs text-amber-700">
          Category filtering is disabled
          during search because DummyJSON&apos;s
          search endpoint does not combine
          search and category filtering.
          Search takes precedence.
        </p>
      )}

      {loading ? (
        <Loading label="Loading products..." />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() =>
            setRetryCount(
              (count) => count + 1
            )
          }
        />
      ) : products.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
          No products found.
        </div>
      ) : (
        <>
          <ProductTable
            products={products}
            onDelete={deleteConfirm}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPage={(nextPage) =>
              updateParams({
                page: String(
                  nextPage
                ),
              })
            }
            onPageSize={(nextSize) =>
              updateParams({
                pageSize: String(
                  nextSize
                ),
                page: "1",
              })
            }
          />
        </>
      )}
    </main>
  );
}