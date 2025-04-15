import React, { lazy, Suspense } from 'react';

const LazyStrategy = lazy(() => import('./Strategy'));

const Strategy = props => (
  <Suspense fallback={null}>
    <LazyStrategy {...props} />
  </Suspense>
);

export default Strategy;
