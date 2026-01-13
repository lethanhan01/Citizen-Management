type Prefetchers = Record<string, () => Promise<unknown>>;

const routePrefetchers: Prefetchers = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/citizens': () => import('@/pages/citizens/CitizenList'),
  '/fees/fixed': () => import('@/pages/fees/FixedFees'),
};

export const prefetchRoute = (path?: string) => {
  if (!path) return;
  const load = routePrefetchers[path];
  if (load) {
    load();
  }
};
