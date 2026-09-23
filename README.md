# Product Admin Dashboard

A small product administration dashboard built for the frontend assignment using **Next.js App Router, React, Tailwind CSS and Axios**, backed by DummyJSON.

## Demo credentials
- Username: `emilys`
- Password: `emilyspass`

## Features completed
- Login with DummyJSON `/auth/login`
- Protected product routes and logout
- Shared Axios instance with auth-token request interceptor and centralized error handling
- Product table on desktop and cards on mobile
- Pagination using `limit` and `skip`
- Page size: 10 / 20 / 50
- Search with 400ms debounce
- AbortController + request sequencing so stale slow searches cannot replace newer results
- Category filtering through `/products/categories`
- Sorting by price, rating or title with ascending/descending order
- URL state for page, page size, search, category, sort and order
- Product details and reviews
- Wrong product ID handling
- Add / edit / delete forms and confirmation dialog
- Validation and duplicate-submit protection
- Loading, empty and retry states
- Local persistence overlay for DummyJSON mutations

## Important API limitation
DummyJSON explicitly documents that add, update and delete operations are simulated and are not persisted on the server. This app calls the required API endpoint and then stores the resulting local change in `localStorage`, so the UI continues to show the change after navigation or refresh on the same browser.

Search and category are deliberately mutually exclusive. When a search term exists, the category control is disabled and search takes precedence. This avoids pretending the API supports a combined server-side search + category query and keeps pagination totals consistent with the selected API endpoint.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For a production check:

```bash
npm run build
npm start
```

## Environment

Create `.env.local` if you want to override the API base URL:

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
```

## Suggested Git commit sequence

Do not submit one giant commit. Example:

```bash
git init
git add .
git commit -m "chore: initialize Next.js dashboard"

git add lib/api.ts lib/auth.ts app/login components/ProtectedRoute.tsx components/Header.tsx
git commit -m "feat: add authentication and protected routes"

git add lib/products.ts components/ProductTable.tsx components/Pagination.tsx app/products/page.tsx
git commit -m "feat: add product listing pagination search and filters"
git add 'app/products/[id]' components/Loading.tsx
git commit -m "feat: add product details and states"
git add components/ProductForm.tsx 'app/products/new' 'app/products/[id]/edit' lib/local-products.ts
git commit -m "feat: add product CRUD UI and local persistence"
git add README.md
git commit -m "docs: add setup and implementation notes"
```

## Deployment

Import the GitHub repository into Vercel, keep the default Next.js build settings, and add `NEXT_PUBLIC_API_URL=https://dummyjson.com` as an environment variable if desired.
