import React, { lazy, Suspense } from 'react';

const LazyStateSelector = lazy(() => import('./StateSelector'));

const StateSelector = props => (
  <Suspense fallback={null}>
    <LazyStateSelector {...props} />
  </Suspense>
);

export default StateSelector;
