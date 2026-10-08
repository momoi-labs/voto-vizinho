import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { WelcomePage } from './features/welcome/WelcomePage';
import { MapaPage } from './features/mapa/MapaPage';
import { parseMapaSearch } from './lib/mapa-search';

const rootRoute = createRootRoute({
  component: () => (
    <main aria-live="polite">
      <Outlet />
    </main>
  ),
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WelcomePage,
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mapa',
  validateSearch: (search: Record<string, unknown>) => parseMapaSearch(search),
  component: function MapaRoute() {
    const search = mapRoute.useSearch();
    return <MapaPage {...search} />;
  },
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([welcomeRoute, mapRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
