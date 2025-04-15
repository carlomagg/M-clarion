import React, { lazy, Suspense } from 'react';

const LazyRiskBoundarySetup = lazy(() => import('./RiskBoundarySetup'));

const RiskBoundarySetup = props => (
  <Suspense fallback={null}>
    <LazyRiskBoundarySetup {...props} />
  </Suspense>
);

export default RiskBoundarySetup;
