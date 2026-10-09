# Voto Vizinho

Browser application for exploring polling locations and electoral data to support
local mobilization. It shows 2026 first-round presidential results (Lula and
Flávio) for every polling location in Brazil, on a map of the user's area.

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
`/` finds the user's area by CEP or browser geolocation. `/mapa` shows the
polling locations inside the visible map area, with totals, a list sorted by the
votes needed to flip each location, and a detail panel per location.

## Data

The app reads generated JSON from `public/data/locais/`: one `{UF}.json` per state
and an `index.json` with each state's bounds. The browser only loads the states
that intersect the visible map. These files are committed because the raw TSE
files are not part of this repository.

To regenerate them, point `DADOS_TSE` to the folder with the TSE CSVs:

```sh
DADOS_TSE=/path/to/tse-csvs pnpm data:build
```

The script is `scripts/gerar_locais_por_uf.py` and needs Python 3.

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
- Leaflet and React Leaflet render the map.
- ESLint and Prettier check code and formatting.

The browser calls these public services directly, without API keys:

- [ViaCEP](https://viacep.com.br/) turns a CEP into an address.
- [BrasilAPI](https://brasilapi.com.br/) provides coordinates for a CEP.
- [Nominatim](https://nominatim.openstreetmap.org/) geocodes the address when
  BrasilAPI has no coordinates.
- [OpenStreetMap](https://www.openstreetmap.org/) serves the map tiles.

TypeScript stays on 6.0 because the selected lint tooling requires a
version below 6.1. Dependency versions are pinned in `package.json`.

Add TanStack Form only when form state or validation needs it. The app has no
backend, database, Tailwind setup, or deployment service.

## References

- [Momoi Labs web application pattern](https://github.com/momoi-labs/blueprint/blob/main/docs/patterns/web-application.md)
- [Kiso consumption rules](https://github.com/momoi-labs/blueprint/blob/main/kiso/AGENTS.md)
- [Kiso React installation and components](https://github.com/momoi-labs/blueprint/blob/main/packages/kiso-react/README.md)
- [Browser-only architecture decision](docs/adr/0001-browser-only-application.md)
