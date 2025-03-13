import React, { lazy, Suspense } from 'react';

const LazyMetric = lazy(() => import('./Metric'));

const Metric = props => (
  <Suspense fallback={null}>
    <LazyMetric {...props} />
  </Suspense>
);

export default Metric;
