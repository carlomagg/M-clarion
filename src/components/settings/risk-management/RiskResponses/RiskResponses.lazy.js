import React, { lazy, Suspense } from 'react';

const LazyRiskResponses = lazy(() => import('./RiskResponses'));

const RiskResponses = props => (
  <Suspense fallback={null}>
    <LazyRiskResponses {...props} />
  </Suspense>
);

export default RiskResponses;
