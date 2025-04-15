import React, { lazy, Suspense } from 'react';

const LazyRiskIdentificationForm = lazy(() => import('./RiskIdentificationForm'));

const RiskIdentificationForm = props => (
  <Suspense fallback={null}>
    <LazyRiskIdentificationForm {...props} />
  </Suspense>
);

export default RiskIdentificationForm;
