# Product Admin Dashboard

A small product administration dashboard built for the frontend assignment using **Next.js App Router, React, TypeScript, Tailwind CSS and Axios**, backed by the **DummyJSON API**.

## Demo Credentials

- **Username:** `emilys`
- **Password:** `emilyspass`

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Axios
- DummyJSON API
- localStorage for simulated CRUD persistence

## Features Completed

### Authentication

- Login using DummyJSON `/auth/login`
- Demo credentials provided above
- Invalid login credentials show an error message
- Protected product routes
- Logout functionality
- Authentication token attached through a shared Axios instance
- Duplicate-submit protection during login

### Product Listing

- Desktop table layout
- Mobile-friendly product cards
- Product thumbnail
- Product title
- Category
- Price
- Rating
- Stock
- Pagination using `limit` and `skip`
- Page sizes: 10 / 20 / 50
- Previous / Next pagination
- Page number navigation
- Displays the current result range and total count

### Search

- Product search using DummyJSON `/products/search?q=`
- 400ms debounce
- Search state synchronized with the URL
- Automatically resets to page 1 when searching
- AbortController used to cancel unnecessary requests
- Request sequencing prevents stale slow searches from replacing newer results
- Locally added products are also included in local search

### Category Filtering

- Categories loaded through `/products/categories`
- Category selection through a dropdown
- Electronics is available as a grouped category
- Electronics groups:
  - Smartphones
  - Laptops
  - Tablets
  - Mobile Accessories
- Category selection is synchronized with the URL

### Sorting

Products can be sorted by:

- Price
- Rating
- Title

Both ascending and descending order are supported.

Sorting state is synchronized with the URL.

### Search + Category Behavior

Search and category filtering are deliberately mutually exclusive.

When a search term exists:

- Search takes precedence
- Category filtering is disabled
- The search API endpoint is used

This avoids pretending that DummyJSON supports a combined server-side search + category query and keeps pagination totals consistent with the selected API endpoint.

### Product Details

- Product detail page
- Product images
- Product description
- Price
- Rating
- Stock
- Category
- Customer reviews
- Invalid product IDs are handled safely
- Locally added products can also be opened through their product detail page

### Add Product

- Add product form
- Title validation
- Description validation
- Category selection
- Price validation
- Stock validation
- Thumbnail URL validation
- Duplicate-submit protection
- Successful products are stored locally because DummyJSON mutations are simulated

### Edit Product

- Edit existing product
- Form validation
- Duplicate-submit protection
- Local persistence of updates

### Delete Product

- Delete confirmation dialog
- API delete request for normal DummyJSON products
- Local deletion handling for locally created products
- Deleted products remain hidden after refresh through local state

### Loading, Error and Empty States

The application includes:

- Loading states
- Empty states
- API error states
- Retry actions
- Invalid product handling
- Safe handling of invalid URL parameters

## Important API Limitation

DummyJSON documents that product add, update and delete operations are simulated and are **not permanently persisted on the server**.

Because of this limitation, this application:

1. Calls the required DummyJSON CRUD endpoint.
2. Receives the simulated API response.
3. Stores the resulting local change in `localStorage`.
4. Merges local changes with API data when displaying products.

This allows newly added, edited and deleted products to remain visible after navigation or a page refresh in the same browser.

### Local CRUD Persistence

The application maintains local state for:

- Added products
- Updated products
- Deleted products

Locally created products receive unique IDs so that adding multiple products does not create duplicate React keys or conflicting product URLs.

## API Architecture

API communication is separated from the UI.

The application uses:

- A shared Axios instance
- Request interceptor for authentication
- Centralized error handling
- Separate product API functions
- AbortController support for cancellable requests

The UI components do not directly contain the main API request logic.

## URL State

The following product-page state is synchronized with URL query parameters:

- Page
- Page size
- Search
- Category
- Sort
- Sort order

This makes product-listing state shareable and preserves the current view when navigating or refreshing.

## Project Structure

```text
product-admin-dashboard/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/
│   │           └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Loading.tsx
│   ├── Pagination.tsx
│   ├── ProductForm.tsx
│   ├── ProductTable.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── local-products.ts
│   └── products.ts
├── types/
│   └── product.ts
├── public/
├── README.md
├── package.json
└── tsconfig.json
```

## Setup

Clone the repository:

```bash
git clone https://github.com/sankar-ayudham/product-admin-dashboard.git
```

Move into the project directory:

```bash
cd product-admin-dashboard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Check

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Environment Variables

Create a `.env.local` file if you want to override the default API URL:

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
```

The application uses DummyJSON by default.

## Deployment

The project can be deployed to Vercel using the GitHub repository.

Recommended Vercel configuration:

- **Framework:** Next.js
- **Build command:** `npm run build`
- **Start command:** `npm start`

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
```

## Problem Faced and Solution

### Problem: DummyJSON CRUD operations are simulated

One challenge was handling product creation, editing and deletion because DummyJSON does not permanently persist CRUD operations on its server.

For example, a newly added product could receive an API-generated ID, but the product would not actually exist on the server after the simulated request. This caused issues when trying to open, search for or delete newly created products.

### Solution

I implemented a local persistence layer using `localStorage`.

The application:

- Generates unique IDs for locally created products.
- Stores newly added products locally.
- Stores updates locally.
- Stores deleted product IDs locally.
- Merges local changes with API products when displaying data.
- Uses local data for details, search, edit and delete operations when appropriate.

This allows the dashboard to behave like a persistent CRUD application even though the underlying DummyJSON CRUD API is simulated.

## Git History

The project was developed using separate commits for major features instead of putting the entire implementation into one commit.

Major commits cover:

- Project initialization
- Authentication and protected routes
- Product listing, pagination, search and filters
- Product details and states
- Product CRUD and local persistence
- Documentation

## Repository

GitHub repository:

https://github.com/sankar-ayudham/product-admin-dashboard

## Demo Credentials

```text
Username: emilys
Password: emilyspass
```

## Notes

- CRUD changes are persisted locally in the browser because DummyJSON does not persist mutations on the server.
- Clearing browser `localStorage` will remove locally stored product changes.
- Search and category filtering are intentionally mutually exclusive.
- The application is responsive for desktop and mobile layouts.
- Invalid product IDs and invalid URL values are handled safely.
