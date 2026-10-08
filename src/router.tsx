import {
  createRootRoute,
  createRoute,
  createRouter,
  Link as RouterLink,
  Outlet,
} from '@tanstack/react-router';
import {
  Link,
  PageHeader,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@momoi-labs/kiso-react';

const rootRoute = createRootRoute({
  component: () => (
    <main className="page" aria-live="polite">
      <Outlet />
    </main>
  ),
  notFoundComponent: () => (
    <>
      <PageHeader>
        <PageHeaderTitle>Página não encontrada</PageHeaderTitle>
      </PageHeader>
      <Link asChild>
        <RouterLink to="/">Voltar ao início</RouterLink>
      </Link>
    </>
  ),
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <>
      <PageHeader variant="editorial">
        <PageHeaderTitle>Voto Vizinho</PageHeaderTitle>
        <PageHeaderDescription>
          Mobilização local a partir de dados eleitorais.
        </PageHeaderDescription>
      </PageHeader>
      <Link asChild>
        <RouterLink to="/mapa">Abrir área de trabalho</RouterLink>
      </Link>
    </>
  ),
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mapa',
  component: () => (
    <>
      <PageHeader>
        <PageHeaderTitle>Resumo da área</PageHeaderTitle>
        <PageHeaderDescription>
          O mapa e os dados eleitorais ainda não foram integrados.
        </PageHeaderDescription>
      </PageHeader>
      <Link asChild>
        <RouterLink to="/">Voltar ao início</RouterLink>
      </Link>
    </>
  ),
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([welcomeRoute, mapRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
