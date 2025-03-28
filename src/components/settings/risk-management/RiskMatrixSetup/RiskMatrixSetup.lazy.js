import React, { lazy, Suspense } from 'react';

const LazyRiskMatrixSetup = lazy(() => import('./RiskMatrixSetup'));

const RiskMatrixSetup = props => (
  <Suspense fallback={null}>
    <LazyRiskMatrixSetup {...props} />
  </Suspense>
);

export default RiskMatrixSetup;
