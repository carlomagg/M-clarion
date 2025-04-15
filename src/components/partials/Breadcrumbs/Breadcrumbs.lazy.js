import React, { lazy, Suspense } from 'react';

const LazyBreadcrumbs = lazy(() => import('./Breadcrumbs'));

const Breadcrumbs = props => (
  <Suspense fallback={null}>
    <LazyBreadcrumbs {...props} />
  </Suspense>
);

export default Breadcrumbs;
