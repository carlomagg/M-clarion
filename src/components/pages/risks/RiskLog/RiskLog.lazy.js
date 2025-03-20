import React, { lazy, Suspense } from 'react';

const LazyRiskLog = lazy(() => import('./RiskLog'));

const RiskLog = props => (
  <Suspense fallback={null}>
    <LazyRiskLog {...props} />
  </Suspense>
);

export default RiskLog;
