import React, { lazy, Suspense } from 'react';

const LazyRiskFollowUp = lazy(() => import('./RiskFollowUp'));

const RiskFollowUp = props => (
  <Suspense fallback={null}>
    <LazyRiskFollowUp {...props} />
  </Suspense>
);

export default RiskFollowUp; 