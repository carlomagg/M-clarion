import React, { lazy, Suspense } from 'react';

const LazyBusinessStrategy = lazy(() => import('./BusinessStrategy'));

const BusinessStrategy = props => (
  <Suspense fallback={null}>
    <LazyBusinessStrategy {...props} />
  </Suspense>
);

export default BusinessStrategy;
