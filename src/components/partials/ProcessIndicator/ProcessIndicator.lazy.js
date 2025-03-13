import React, { lazy, Suspense } from 'react';

const LazyProcessIndicator = lazy(() => import('./ProcessIndicator'));

const ProcessIndicator = props => (
  <Suspense fallback={null}>
    <LazyProcessIndicator {...props} />
  </Suspense>
);

export default ProcessIndicator;
