import React, { lazy, Suspense } from 'react';

const LazyIndex = lazy(() => import('./Index'));

const Index = props => (
  <Suspense fallback={null}>
    <LazyIndex {...props} />
  </Suspense>
);

export default Index;
