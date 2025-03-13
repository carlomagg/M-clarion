import React, { lazy, Suspense } from 'react';

const LazyRiskDashboard = lazy(() => import('./RiskDashboard'));

const RiskDashboard = props => (
  <Suspense fallback={null}>
    <LazyRiskDashboard {...props} />
  </Suspense>
);

export default RiskDashboard;
