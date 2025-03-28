import React, { lazy, Suspense } from 'react';

const LazyRiskRegister = lazy(() => import('./RiskRegister'));

const RiskRegister = props => (
  <Suspense fallback={null}>
    <LazyRiskRegister {...props} />
  </Suspense>
);

export default RiskRegister;
