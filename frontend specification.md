# Front-End Specification – Ingredient-First Skincare Web App (Mobile-First)

> **Audience:** Backend + front-end engineers, QA, PM.  Explains *why* each UI exists, *what* it must render/behave, and *how* it will consume backend APIs defined in the companion Backend Spec.

---

## 1 UX Goal (Why)

Deliver a **guided, ingredient-first discovery experience** that:

* **Educates** users on active ingredients before products.
* **Shows** a concise, AI-generated “skincare itinerary” for any natural query.
* **Builds trust** with ratings + influencer videos.
* **Enables choice** via an on-device comparison drawer.
  Everything must load **<1 s on 4G** and feel native-app smooth on small screens.

---

## 2 High-Level Flow (What)

```
Landing → Query → Results/Itinerary → (A) Compare Drawer → PDP Sheet → Buy (external)  ↘
                                                              ↘ Explore Page ↗
```

1. **Landing** – single search bar.
2. **Results Page** – top ingredients + product cards (scrollable).
3. **Compare Drawer** – side-by-side diff for up to 3 cards.
4. **PDP Sheet** – bottom sheet with full details & video embeds.
5. **Explore** – grid of concerns & ingredients for browsing.

---

## 3 Component Tree & API Contracts (How)

| Component               | Purpose (Why)                                                | Props / State                        | Backend Call                        |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------ | ----------------------------------- |
| `AppShell`              | Layout wrapper; handles global nav, theme, route transitions | N/A                                  | None                                |
| `SearchBar`             | Capture NL query; show auto-suggest                          | `onSubmit(query)`                    | `POST /api/itinerary` (debounced)   |
| `ResultsPage`           | Render itinerary for query                                   | `{concern, ingredients, products[]}` | Receives payload from SearchBar     |
| `KeyIngredientsSection` | Educate user on active ingredients                           | `ingredients[]`                      | None                                |
| `ProductCard`           | Compact card with hero imgs, rating, compare toggle          | `product`                            | Images CDN; no RPC                  |
| `CompareFAB`            | Floating action button showing #selected                     | `selectedIds[]`                      | None                                |
| `CompareDrawer`         | Bottom drawer diff table                                     | `products[]`                         | `GET /api/compare?ids=` when opened |
| `ProductDetailSheet`    | Full PDP bottom sheet                                        | `productId`                          | `GET /api/product/:id` (lazy)       |
| `VideoGallery`          | Embeds influencer videos                                     | `videoIds[]`                         | YouTube iframe (client)             |
| `ExplorePage`           | Discovery grid (concerns, ingredients)                       | Static lists / Query triggers        | Optional: `GET /api/explore`        |
| `ToastManager`          | Show “Added to Compare” etc.                                 | global                               | None                                |

### State Management

* **React Context** for selectedCompareIds and lastQueryPayload.
* **SWR / React-Query** for caching API fetches (dedupes identical PDP calls).
* **Redux not needed** (scope small).

---

## 4 Interaction Details (How)

### 4.1 Search

* Debounce 300 ms; on Enter or CTA click, POST itinerary.
* Handle 3 loading states → skeleton (cards), error toast, empty-state (show Explore suggestions).

### 4.2 Product Cards

* Tap → opens `ProductDetailSheet` via `<SlideInBottom>` transition.
* Long-press (Android) or checkbox → toggles Compare; triggers toast.

### 4.3 Compare Drawer

* Appears from bottom; height 85 vh.
* Horizontal scroll table; sticky row labels; swipe-down to dismiss.
* If >3 items selected, disable further adds + toast: “Max 3 for compare”.

### 4.4 PDP Sheet

* Fetch product detail on open; cache 15 min.
* Lazy-load YouTube iframe after user scrolls to VideoGallery.
* CTA **Buy Now** opens `source_url` in new tab.

---

## 5 Mobile-First Layout & Tailwind Breakpoints

* Default `sm:` (≥640 px) still treated as mobile; grid = 1 col.
* At `md:` (≥768 px) Results grid becomes 2 cols; Compare becomes side-by-side pane.
* Use `lg:` (≥1024 px) for desktop extras (sticky Compare panel).

---

## 6 Performance & Accessibility

* **CLS <0.1** – reserve image aspect ratios.
* **Largest Contentful Paint <2.5 s** – skeletons & lazy images.
* **ARIA** tags on modals/drawers; focus trap inside PDP sheet.
* Respect prefers-reduced-motion; disable heavy transitions.

---

## 7 Error & Edge Handling

| Scenario          | UX Behaviour                                                   |
| ----------------- | -------------------------------------------------------------- |
| LLM timeout       | Show toast “Service busy – try again” & fallback: Explore page |
| No products match | Display ingredient info + invite to refine search              |
| API 500           | Show error banner; log Sentry w/ trace-id                      |

---

## 8 Build & Tooling

* **React 19 + Next.js 14 App Router** – server components for SEO / hydration.
* **Tailwind v3** – JIT; custom color tokens `brand-primary`, `brand-accent`.
* **Zustand** – light global store (compare list).
* **SWR** – auto revalidation + optimistic UI.
* **Vercel / Netlify** for preview deploys on PR.

---

## 9 Timeline Alignment with Backend Sprints

| FE Sprint | Dependency                  | Deliverable                                   |
| --------- | --------------------------- | --------------------------------------------- |
| FE-S1     | None                        | Landing + SearchBar w/ mocked data            |
| FE-S2     | Backend S2 `/api/itinerary` | ResultsPage + IngredientSection + ProductCard |
| FE-S3     | Backend S3 PDP endpoint     | ProductDetailSheet + Compare scaffold         |
| FE-S4     | Backend S4 compare endpoint | Complete CompareDrawer; mobile polish         |
| FE-S5     | Backend final staging       | PWA tweaks, lighthouse ≥90, bug-bash          |

---

## 10 Hand-off Checklist

* [ ] Swagger / Postman collection from backend imported.
* [ ] Sample itinerary JSON to build against.
* [ ] CDN image domain whitelisted in Next config.
* [ ] Test YouTube embeds behind consent banner if GDPR region.
