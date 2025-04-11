import React, { lazy, Suspense } from 'react';

const LazyRiskReview = lazy(() => import('./RiskReview'));

const RiskReview = props => (
  <Suspense fallback={null}>
    <LazyRiskReview {...props} />
  </Suspense>
);

export default RiskReview;
