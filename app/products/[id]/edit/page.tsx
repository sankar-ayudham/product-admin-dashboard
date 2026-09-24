"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProduct, updateProduct } from "@/lib/products";
import {
  applyLocalChanges,
  updateLocalProduct,
} from "@/lib/local-products";
import { Loading, ErrorState } from "@/components/Loading";
import type { Product, ProductInput } from "@/types/product";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      setError("Product not found");
      return;
    }

    getProduct(numericId)
      .then((p) => {
        setProduct(applyLocalChanges([p])[0] || null);
      })
      .catch((e) => {
        setError(
          e instanceof Error
            ? e.message
            : "Failed to load product"
        );
      });
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <ErrorState
          message={error}
          onRetry={() => location.reload()}
        />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Loading />
      </main>
    );
  }

  // Capture the non-null product.
  const currentProduct = product;

  const initial: ProductInput = {
    title: currentProduct.title,
    description: currentProduct.description,
    category: currentProduct.category,
    price: currentProduct.price,
    stock: currentProduct.stock,
    thumbnail: currentProduct.thumbnail,
  };

  async function submit(input: ProductInput) {
    await updateProduct(currentProduct.id, input);

    updateLocalProduct(currentProduct.id, input);

    router.push(`/products/${currentProduct.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h2 className="mb-5 text-2xl font-bold">
        Edit product
      </h2>

      <ProductForm
        initialValue={initial}
        submitLabel="Save changes"
        onSubmit={submit}
      />
    </main>
  );
}