import React, { lazy, Suspense } from 'react';

const LazyParametersAndIndicators = lazy(() => import('./ParametersAndIndicators'));

const ParametersAndIndicators = props => (
  <Suspense fallback={null}>
    <LazyParametersAndIndicators {...props} />
  </Suspense>
);

export default ParametersAndIndicators;
