import { api } from "./api";
import type { Category, Product, ProductInput, ProductListResponse } from "@/types/product";

export type ProductQuery = {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: "price" | "rating" | "title";
  order: "asc" | "desc";
};

export async function getProducts(query: ProductQuery, signal?: AbortSignal) {
  const skip = (query.page - 1) * query.limit;
  const params = {
    q: query.search || undefined,
    limit: query.limit,
    skip,
    sortBy: query.sort,
    order: query.order,
  };

  if (query.search) {
    const { data } = await api.get<ProductListResponse>("/products/search", {
      params,
      signal,
    });
    return data;
  }

  if (query.category) {
    const { data } = await api.get<ProductListResponse>(
      `/products/category/${encodeURIComponent(query.category)}`,
      { params: { limit: query.limit, skip, sortBy: query.sort, order: query.order }, signal },
    );
    return data;
  }

  const { data } = await api.get<ProductListResponse>("/products", { params, signal });
  return data;
}

export async function getProduct(id: number, signal?: AbortSignal) {
  const { data } = await api.get<Product>(`/products/${id}`, { signal });
  return data;
}

export async function getCategories(signal?: AbortSignal) {
  const { data } = await api.get<Category[]>("/products/categories", { signal });
  return data;
}

export async function addProduct(input: ProductInput) {
  const { data } = await api.post<Product>("/products/add", input);
  return data;
}

export async function updateProduct(id: number, input: Partial<ProductInput>) {
  const { data } = await api.patch<Product>(`/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await api.delete<Product>(`/products/${id}`);
  return data;
}
