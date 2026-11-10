---
name: seo-fundamentals
description: SEO fundamentals, E-E-A-T, Core Web Vitals (LCP, INP, CLS), JSON-LD, and AI search / llms.txt readiness.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "5.5.0"
---

# SEO Fundamentals — Core Web Vitals (INP), E-E-A-T & AI Search Readiness (v5.5.0)

> **PURPOSE**: Engineer technical search visibility, fast page experience (**`LCP <= 2.5s`**, **`INP <= 200ms`**, **`CLS <= 0.1`**), rich JSON-LD structured data, and **AI Search / Generative Engine Optimization (`llms.txt` & GEO)** across modern web applications.

---

## 🔧 Runtime SEO & GEO Verification

| Script | Purpose | Canonical Command |
|--------|---------|-------------------|
| `scripts/seo_checker.py` | Audits HTML/JSX/TSX public pages & Next.js Metadata API for `<title>`, `description`, `og:title`, single `<h1>`, `alt` attributes, canonical links, JSON-LD, semantic landmarks, and `robots.txt` / `sitemap.xml` / `llms.txt` | `python ~/.{TOOL}/skills/seo-fundamentals/scripts/seo_checker.py <project_path>` |
| `geo_checker.py` | Audits Generative Engine Optimization & AI citation readiness | `python ~/.{TOOL}/skills_library/geo-fundamentals/scripts/geo_checker.py <project_path>` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## 1. 2026 Core Web Vitals Standards (Zero Deprecated FID!)

> **IMPORTANT**: **INP (Interaction to Next Paint)** permanently replaced **FID (First Input Delay)** as Google's official responsiveness Core Web Vital. Never optimize for or report deprecated FID — measure **INP** across the entire page lifecycle!

| Core Web Vital | Good Threshold | Needs Improvement | Engineering Mitigations |
|----------------|:--------------:|:-----------------:|-------------------------|
| **LCP (Largest Contentful Paint)** | **`<= 2.5s`** | `2.5s – 4.0s` | Preload hero AVIF/WebP image (`fetchpriority="high"`, never `loading="lazy"` on above-the-fold LCP element), SSR/SSG HTML streaming, edge CDN caching |
| **INP (Interaction to Next Paint)** | **`<= 200ms`** | `200ms – 500ms` | Break up long main-thread JS tasks (`> 50ms`), yield via `scheduler.yield()` / React `startTransition`, avoid synchronous layout thrashing in click/input handlers |
| **CLS (Cumulative Layout Shift)** | **`<= 0.1`** | `0.1 – 0.25` | Explicit `width` & `height` / `aspect-ratio` on all media/embeds, `font-display: swap` or `optional` with metric-matched fallback fonts, reserved skeleton heights |

---

## 2. Technical Metadata & On-Page Architecture

| Element | 2026 Implementation Standard |
|---------|------------------------------|
| **`<title>` / `metadata.title`** | `50–60` chars, primary intent front-loaded, unique per indexable URL |
| **Meta Description** | `140–160` chars, specific value proposition + clear action cue |
| **Canonical URL (`rel="canonical"`)** | Self-referencing absolute HTTPS canonical on every indexable route (`alternates.canonical` in Next.js) to prevent query-param duplication |
| **Open Graph & Social (`og:*`)** | `og:title`, `og:description`, `og:url`, `og:type`, and `1200x630` `og:image` (`twitter:card = summary_large_image`) |
| **Heading & Semantic Landmarks** | Exactly **one `<h1>`** per page, logical `<h2>`→`<h3>` hierarchy, semantic `<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>` |
| **Images (`alt`)** | Descriptive `alt` text on informational images; explicit empty `alt=""` on purely decorative dividers/backgrounds |
| **Crawl Budget & Indexing** | Dynamic `sitemap.xml` with accurate `<lastmod>`, clean `robots.txt`, SSR/static HTML rendering for critical content, HTTP `404`/`410` (never soft-200) on missing routes |

---

## 3. JSON-LD Structured Data (`application/ld+json`)

Embed valid Schema.org JSON-LD in `<script type="application/ld+json">` matching visible page content:

| Page Type | Recommended `@type` | Key Required Properties |
|-----------|---------------------|-------------------------|
| **Home / Brand** | `Organization`, `WebSite` | `name`, `url`, `logo`, `sameAs` |
| **Editorial / Docs** | `Article` / `TechArticle` + `BreadcrumbList` | `headline`, `author` (`Person` credentials), `datePublished`, `dateModified` |
| **SaaS / App** | `SoftwareApplication`, `FAQPage` | `name`, `applicationCategory`, `operatingSystem`, `offers` |
| **E-Commerce** | `Product` | `name`, `image`, `description`, `sku`, `offers` (`price`, `priceCurrency`, `availability`) |

---

## 4. E-E-A-T & AI Search / `llms.txt` Readiness (GEO)

Modern discovery spans both **traditional search engines** and **AI answer engines / coding agents** (Google AI Overviews, SearchGPT, Perplexity, Claude):
1. **E-E-A-T Signals**: Attribute articles to verifiable authors, surface primary benchmarks/citations, maintain accurate `dateModified` timestamps, and avoid thin unedited AI boilerplate.
2. **`/llms.txt` & Markdown Documentation Endpoints**:
   - Expose a clean `/llms.txt` at the domain root (concise H1 title, `>` summary blockquote, and categorized Markdown links to core docs/APIs/pricing) so LLM agents ingest authoritative site structure without scraping noisy navbars.
3. **Citation-Ready Information Architecture**:
   - Lead major `<h2>` sections with a direct `40–60` word factual answer followed by comparison tables, specs, or code examples.
   - Ensure `robots.txt` intentionally configures AI retrieval bots (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`) according to product policy rather than blocking discovery accidentally.
