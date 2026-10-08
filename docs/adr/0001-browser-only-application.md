---
status: accepted
date: 2026-10-08
supersedes: []
superseded_by: null
tags: [frontend, architecture]
---

# Build a browser-only application

Voto Vizinho runs entirely in the browser and has no product requirement for a
backend or server-side rendering. Use Vite, React, TypeScript, Kiso React, and
TanStack Router to produce a static build. Node.js is development tooling.

The [Momoi Labs web application pattern](https://github.com/momoi-labs/blueprint/blob/main/docs/patterns/web-application.md)
assumes an HTTP API and excludes static sites. Keep its frontend choices while
omitting Rust, PostgreSQL, and generated API contracts for this product.

Defer TanStack Query until browser data fetching exists, TanStack Form until form
state needs it, and map dependencies until the map is implemented. Import Kiso
React's stylesheet once. It already includes Kiso tokens and component CSS,
requires no Tailwind setup, and follows `prefers-color-scheme` when `data-theme`
is absent. Use Kiso's documented red accent for the scaffold. The product's exact
poster typography and colors belong to the later screen implementation.
