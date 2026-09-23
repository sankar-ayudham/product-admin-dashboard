"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { addProduct } from "@/lib/products";
import { addLocalProduct, makeLocalProduct } from "@/lib/local-products";
import type { ProductInput } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();
  async function submit(input: ProductInput) {
    const created = await addProduct(input);
    addLocalProduct(makeLocalProduct({ ...input }, created.id));
    router.push("/products?page=1&pageSize=10");
  }
  return <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6"><h2 className="mb-5 text-2xl font-bold">Add product</h2><ProductForm submitLabel="Create product" onSubmit={submit} /></main>;
}
