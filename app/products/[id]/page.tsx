"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct } from "@/lib/products";
import {
  applyLocalChanges,
  getLocalAddedProducts,
} from "@/lib/local-products";
import { ErrorState, Loading } from "@/components/Loading";
import type { Product } from "@/types/product";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setProduct(null);
    setNotFound(false);
    setError("");

    async function loadProduct() {
      try {
        // First check products created locally.
        const localProduct = getLocalAddedProducts().find(
          (item) => item.id === numericId
        );

        if (localProduct) {
          setProduct(localProduct);
          return;
        }

        // Otherwise load the product from DummyJSON.
        const apiProduct = await getProduct(numericId);

        // Apply local edits/deletes to API products.
        const updatedProduct = applyLocalChanges([apiProduct])[0];

        if (!updatedProduct) {
          setNotFound(true);
          return;
        }

        setProduct(updatedProduct);
      } catch (err) {
        if (
          err instanceof Error &&
          /not found|404/i.test(err.message)
        ) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load product"
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Loading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <ErrorState
          message={error}
          onRetry={() => location.reload()}
        />
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-12 text-center">
          <h2 className="text-2xl font-bold">
            Product not found
          </h2>

          <p className="mt-2 text-slate-500">
            The product ID is invalid or no longer exists.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            Back to products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="text-sm font-medium text-blue-600"
        >
          ← Products
        </Link>

        <Link
          href={`/products/${product.id}/edit`}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Edit
        </Link>
      </div>

      <section className="grid gap-8 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <div>
          <img
            src={product.images?.[0] || product.thumbnail}
            alt={product.title}
            className="h-auto w-full rounded-xl object-cover"
          />
        </div>

        <div>
          <p className="text-sm capitalize text-slate-500">
            {product.category}
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            {product.title}
          </h1>

          <p className="mt-4 text-3xl font-bold">
            ${product.price.toFixed(2)}
          </p>

          <div className="mt-4 flex gap-5 text-sm text-slate-600">
            <span>
              ⭐ {product.rating.toFixed(1)}
            </span>

            <span>
              Stock: {product.stock}
            </span>
          </div>

          <p className="mt-6 leading-7 text-slate-600">
            {product.description}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm md:p-8">
        <h2 className="text-xl font-bold">
          Reviews
        </h2>

        <div className="mt-5 space-y-4">
          {product.reviews?.length ? (
            product.reviews.map((review, index) => (
              <div
                key={`${review.reviewerEmail}-${index}`}
                className="border-b pb-4 last:border-0"
              >
                <div className="flex justify-between gap-4">
                  <strong>
                    {review.reviewerName}
                  </strong>

                  <span>
                    ⭐ {review.rating}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No reviews available.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}