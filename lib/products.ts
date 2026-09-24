import { api } from "./api";

import type {
  Category,
  Product,
  ProductInput,
  ProductListResponse,
} from "@/types/product";

export type ProductQuery = {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: "price" | "rating" | "title";
  order: "asc" | "desc";
};

export const ELECTRONICS_CATEGORIES = [
  "electronics",
  "smartphones",
  "laptops",
  "tablets",
  "mobile-accessories",
];

export async function getProducts(
  query: ProductQuery,
  signal?: AbortSignal
): Promise<ProductListResponse> {
  const skip = (query.page - 1) * query.limit;

  const params = {
    q: query.search || undefined,
    limit: query.limit,
    skip,
    sortBy: query.sort,
    order: query.order,
  };

  // Search takes precedence over category filtering.
  if (query.search) {
    const { data } = await api.get<ProductListResponse>(
      "/products/search",
      {
        params,
        signal,
      }
    );

    return data;
  }

  /*
   * Electronics is a custom grouped category.
   *
   * DummyJSON does not provide:
   * GET /products/category/electronics
   *
   * Fetch all products, combine the relevant categories,
   * sort them, and then paginate the combined results.
   */
  if (query.category === "electronics") {
    const { data } = await api.get<ProductListResponse>(
      "/products",
      {
        params: {
          limit: 0,
        },
        signal,
      }
    );

    const electronics = data.products.filter((product) =>
      ELECTRONICS_CATEGORIES.includes(product.category)
    );

    electronics.sort((a, b) => {
      let comparison = 0;

      if (query.sort === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (query.sort === "price") {
        comparison = a.price - b.price;
      } else {
        comparison = a.rating - b.rating;
      }

      return query.order === "desc"
        ? -comparison
        : comparison;
    });

    return {
      products: electronics.slice(skip, skip + query.limit),
      total: electronics.length,
      skip,
      limit: query.limit,
    };
  }

  // Normal DummyJSON category
  if (query.category) {
    const { data } = await api.get<ProductListResponse>(
      `/products/category/${encodeURIComponent(query.category)}`,
      {
        params: {
          limit: query.limit,
          skip,
          sortBy: query.sort,
          order: query.order,
        },
        signal,
      }
    );

    return data;
  }

  // All products
  const { data } = await api.get<ProductListResponse>(
    "/products",
    {
      params,
      signal,
    }
  );

  return data;
}

export async function getProduct(
  id: number,
  signal?: AbortSignal
) {
  const { data } = await api.get<Product>(
    `/products/${id}`,
    { signal }
  );

  return data;
}

export async function getCategories(
  signal?: AbortSignal
) {
  const { data } = await api.get<Category[]>(
    "/products/categories",
    { signal }
  );

  return data;
}

export async function addProduct(
  input: ProductInput
) {
  const { data } = await api.post<Product>(
    "/products/add",
    input
  );

  return data;
}

export async function updateProduct(
  id: number,
  input: Partial<ProductInput>
) {
  const { data } = await api.patch<Product>(
    `/products/${id}`,
    input
  );

  return data;
}

export async function deleteProduct(
  id: number
) {
  const { data } = await api.delete<Product>(
    `/products/${id}`
  );

  return data;
}