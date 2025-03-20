import React, { lazy, Suspense } from 'react';

const LazyInitiative = lazy(() => import('./Initiative'));

const Initiative = props => (
  <Suspense fallback={null}>
    <LazyInitiative {...props} />
  </Suspense>
);

export default Initiative;
