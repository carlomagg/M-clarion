import React, { lazy, Suspense } from 'react';

const LazyRiskUpdate = lazy(() => import('./RiskUpdate'));

const RiskUpdate = props => (
  <Suspense fallback={null}>
    <LazyRiskUpdate {...props} />
  </Suspense>
);

export default RiskUpdate;
