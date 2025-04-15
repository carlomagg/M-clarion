import React, { lazy, Suspense } from 'react';

const LazyTrackRiskReview = lazy(() => import('./RiskReview'));

const TrackRiskReview = props => (
  <Suspense fallback={null}>
    <LazyTrackRiskReview {...props} />
  </Suspense>
);

export default TrackRiskReview;
