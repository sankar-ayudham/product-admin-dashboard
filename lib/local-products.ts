import type { Product, ProductInput } from "@/types/product";

const KEY = "product-admin-local-state";

type LocalState = {
  added: Product[];
  updated: Record<string, Partial<Product>>;
  deleted: number[];
};

const emptyState = (): LocalState => ({
  added: [],
  updated: {},
  deleted: [],
});

function read(): LocalState {
  if (typeof window === "undefined") {
    return emptyState();
  }

  try {
    return (
      JSON.parse(localStorage.getItem(KEY) || "null") ||
      emptyState()
    );
  } catch {
    return emptyState();
  }
}

function write(state: LocalState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getLocalState() {
  return read();
}

export function addLocalProduct(product: Product) {
  const state = read();

  state.added = [product, ...state.added];

  write(state);
}

export function updateLocalProduct(
  id: number,
  patch: Partial<Product>
) {
  const state = read();

  state.updated[String(id)] = {
    ...(state.updated[String(id)] || {}),
    ...patch,
  };

  write(state);
}

export function deleteLocalProduct(id: number) {
  const state = read();

  if (!state.deleted.includes(id)) {
    state.deleted.push(id);
  }

  write(state);
}

export function applyLocalChanges(products: Product[]) {
  const state = read();

  return products
    .filter(
      (product) =>
        !state.deleted.includes(product.id)
    )
    .map((product) => ({
      ...product,
      ...(state.updated[String(product.id)] || {}),
    }));
}

export function getLocalAddedProducts() {
  const state = read();

  return state.added.filter(
    (product) =>
      !state.deleted.includes(product.id)
  );
}

function generateUniqueLocalId(
  state: LocalState
): number {
  /*
   * DummyJSON has 194 original products.
   * Locally created products start at 195.
   */

  const usedIds = new Set<number>();

  // IDs of locally added products
  for (const product of state.added) {
    usedIds.add(product.id);
  }

  // IDs that have local updates
  for (const id of Object.keys(state.updated)) {
    const numericId = Number(id);

    if (Number.isInteger(numericId)) {
      usedIds.add(numericId);
    }
  }

  // IDs that were deleted
  for (const id of state.deleted) {
    usedIds.add(id);
  }

  let id = 195;

  while (usedIds.has(id)) {
    id++;
  }

  return id;
}

export function makeLocalProduct(
  input: ProductInput,
  _apiId: number
): Product {
  const state = read();

  const id = generateUniqueLocalId(state);

  const image =
    input.thumbnail ||
    "https://dummyjson.com/image/200x120";

  return {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price,
    rating: 0,
    stock: input.stock,
    thumbnail: image,
    images: [image],
    reviews: [],
  };
}