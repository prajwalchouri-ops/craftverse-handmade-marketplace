# CraftVerse — React Version

A handmade marketplace built with **React**, **React Router**, and **Vite**.

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Supabase Setup

1. Copy `.env.example` to `.env.local` and set your Supabase Project URL and publishable key.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor to create the tables, row-level security policies, and sample products.
3. Restart the Vite dev server after changing environment variables.

The browser app only uses the publishable key. Never put a database password, Supabase secret key, or `service_role` key in frontend code or a `VITE_` variable. Keep `.env.local` out of version control.

## Project Structure

```
src/
├── components/
│   └── Navbar.jsx          # Navigation component with links and cart button
├── context/
│   └── CartContext.jsx     # Shared cart state
├── data/
│   └── products.js         # Sample product list
├── pages/
│   ├── Home.jsx            # Landing page with hero and categories
│   ├── Shop.jsx            # Product listing with filters and search
│   ├── ProductDetails.jsx  # Individual product page
│   └── Cart.jsx            # Shopping cart
├── App.jsx                 # Main app with routes
├── App.css                 # App styles
└── index.css               # Global styles
```

## Features

✓ **Responsive Design** — Mobile-friendly across all devices
✓ **Product Filtering** — Filter by category (Pottery, Jewelry, Textiles, Woodcraft)
✓ **Search Functionality** — Find products by name, maker, or category
✓ **Product Details** — View full product information and ratings
✓ **Shopping Cart** — Add items, change quantities, and view cart totals across pages
✓ **Beautiful UI** — Warm, artisan-inspired design with beige & brown palette
✓ **No Backend Required** — Sample products and in-memory cart for demo purposes

The cart is shared across routes while the app is open. It resets when the page is refreshed. Checkout is a demo button only.

## Color Palette

- Primary Background: `#f5ebdd` (Warm Beige)
- Secondary Background: `#fff9f0` (Cream)
- Primary Brown: `#5a3825` (Dark Brown)
- Secondary Brown: `#8b5e3c` (Medium Brown)
- Accent: `#b98255` (Caramel)
- Text: `#2f211a` (Espresso)
- Muted: `#806f63` (Warm Gray)

## Tech Stack

- **React** 18.2+
- **React Router** 6.20+
- **Vite** 5.0+
- **CSS3** with responsive design

## Building

```bash
npm run build
```

Output will be in the `dist/` directory.

---

Made with intention ✳
