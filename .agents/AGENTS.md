# Project-Scoped Agent Rules — End-to-End Implementation & SEO

These guidelines are automatically loaded by AI coding assistants.

## 0. Mandatory End-to-End Rule
Any requested feature MUST be implemented end-to-end across Database -> Backend API -> Frontend UI -> Admin Panel (if required) -> Sitemap/SEO.

## 1. Page Metadata Standards
Every page component created or modified in `frontend/src/pages/` must include:
- A `<Helmet>` block from `react-helmet-async`.
- A descriptive, search-friendly `<title>` (under 60 characters).
- A concise `<meta name="description">` (under 160 characters).
- Canonical URL link matching the active route:
  `<link rel="canonical" href={window.location.origin + window.location.pathname} />`
- Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`).
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).

## 2. Structured Data (JSON-LD)
All dynamic views or detail screens must embed JSON-LD schema scripts (`<script type="application/ld+json">`) using Schema.org specifications:
- **Blog posts / Articles**: Use `BlogPosting` or `Article` type.
- **Trading Ideas**: Use `Report` or custom `FinancialProduct` details.
- **IPOs / Events**: Use `Event` type for bidding windows.
- Ensure all schemas validate correctly and do not use relative URLs for schema elements (always prefix with `window.location.origin` or absolute domains).

## 3. Semantic HTML & Accessibility
- Use HTML5 semantic elements (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
- Maintain a proper heading hierarchy (`<h1>` should be unique per page, followed sequentially by `<h2>`, `<h3>`).
- Every image (`<img>`) MUST have a meaningful, descriptive `alt` attribute. Avoid generic names like "image" or "photo".
- Ensure color contrast and interactive elements support keyboard accessibility.

## 4. Sitemap Integrity
When introducing any new indexable routes:
- Add the route to the static list in `backend/routes/sitemap.js`.
- If the route represents a new dynamic resource (e.g. news articles, stocks), query the resource database and map it to `<url>` elements in the sitemap generator.

## 5. Modern Zero-Designer & Text-First UI Rules
All UI implementations MUST strictly comply with `DESIGN_SYSTEM_RULES.md`:
- **Text-First Actions & Text Buttons**: Use self-descriptive text buttons (`View Details →`, `Filter [All]`, `[+ Add New]`) and native text glyphs (`▲`, `▼`, `→`, `←`, `•`, `✓`, `✕`, `★`, `◆`) rather than external icon libraries (`lucide-react`, `font-awesome`, `react-icons`).
- **Initials-Based Avatars**: Replace missing visual assets or logos with styled uppercase initials badges (`RE`, `TC`, `HD`).
- **Full Mobile & Desktop Responsiveness**: Build mobile-first layouts (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) with touch-friendly targets (`min-h-[44px]`, `py-2.5 px-4`) and overflow scroll guards for tables.

