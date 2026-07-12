# Project-Scoped Agent Rules — SEO & Search Engine Findability

These guidelines are automatically loaded by AI coding assistants to ensure that all future frontend development is optimized for search engines (Google, Bing, Yahoo, etc.) and social media crawlers.

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
