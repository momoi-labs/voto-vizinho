# Voto Vizinho

Browser application for exploring polling locations and electoral data to support
local mobilization. This repository currently contains the application scaffold.
Maps, location search, electoral calculations, and TSE datasets are not integrated.

## Run locally

Use Node.js 24 and pnpm 12.10.1. `mise.toml` configures both tools.
Install them with [mise](https://mise.jdx.dev/) before installing packages:

```sh
mise trust
mise install
```

With mise activated in your shell, run:

```sh
pnpm install
pnpm dev
```

Open <http://localhost:8777>. The server fails if that port is occupied.
The starter has `/` and `/mapa` routes, with Kiso React components and the system
color scheme. The red accent uses Kiso's existing appearance setting.

The supplied project summary references `prototipo/` and TSE data directories.
Those files are absent from this checkout.

## Check and build

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm preview
```

`pnpm format` formats project files. `pnpm build` writes the static application to
`dist/`. Configure the static host to serve `index.html` for client routes such as
`/mapa`. `pnpm preview` serves the build locally on port 8777.

## Dependencies

- React and TypeScript provide the browser application.
- Vite builds and serves it during development.
- TanStack Router handles client routes without code generation.
- `@momoi-labs/kiso-react` provides components, tokens, CSS, and system theme
  support. It includes `@momoi-labs/kiso` as a dependency. Its stylesheet loads
  Inter and JetBrains Mono from Google Fonts.
- `lucide-react` satisfies Kiso React's icon peer dependency.
- ESLint and Prettier check code and formatting.

TypeScript stays on 6.0 because the selected lint tooling requires a
version below 6.1. Dependency versions are pinned in `package.json`.

Add TanStack Query when browser data fetching is implemented. Add TanStack Form
only when form state or validation needs it. Add Leaflet and React Leaflet with
the map implementation. The scaffold has no backend, database, API client,
Tailwind setup, or deployment service.

## References

- [Momoi Labs web application pattern](https://github.com/momoi-labs/blueprint/blob/main/docs/patterns/web-application.md)
- [Kiso consumption rules](https://github.com/momoi-labs/blueprint/blob/main/kiso/AGENTS.md)
- [Kiso React installation and components](https://github.com/momoi-labs/blueprint/blob/main/packages/kiso-react/README.md)
- [Browser-only architecture decision](docs/adr/0001-browser-only-application.md)
