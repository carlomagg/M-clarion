import React, { lazy, Suspense } from 'react';

const LazyTreatmentPlan = lazy(() => import('./TreatmentPlan'));

const TreatmentPlan = props => (
  <Suspense fallback={null}>
    <LazyTreatmentPlan {...props} />
  </Suspense>
);

export default TreatmentPlan;
