"use client";

import { useRouter } from "next/navigation";

import ProductForm from "@/components/ProductForm";

import { addProduct } from "@/lib/products";

import {
  addLocalProduct,
  makeLocalProduct,
} from "@/lib/local-products";

import type { ProductInput } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();

  async function submit(
    input: ProductInput
  ) {
    /*
     * DummyJSON returns a fake ID and does
     * not permanently persist the product.
     *
     * We still call the API because the
     * assignment requires POST /products/add.
     */
    const created =
      await addProduct(input);

    /*
     * makeLocalProduct generates our own
     * unique local ID instead of trusting
     * DummyJSON's returned ID.
     *
     * Example:
     * API returns 195
     * Local product becomes 195, 196, 197...
     */
    const localProduct =
      makeLocalProduct(
        { ...input },
        created.id
      );

    addLocalProduct(localProduct);

    router.push(
      "/products?page=1&pageSize=10"
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h2 className="mb-5 text-2xl font-bold">
        Add product
      </h2>

      <ProductForm
        submitLabel="Create product"
        onSubmit={submit}
      />
    </main>
  );
}